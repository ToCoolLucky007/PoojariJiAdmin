#!/bin/bash
set -Eeuo pipefail

# ==========================================
# PoojariJiAdmin Production Release Deployment
# ==========================================

APP="/var/www/PoojariJiAdmin"
RELEASE_NAME="${1:?Usage: activate-release.sh release-name}"
RELEASE="$APP/releases/$RELEASE_NAME"
CURRENT="$APP/current"
PORT=3001

# Ensure script runs as ubuntu
if [ "$(id -un)" != "ubuntu" ]; then
    echo "ERROR: Run this script as ubuntu, not root."
    exit 1
fi

echo "======================================"
echo "Starting PoojariJiAdmin deployment"
echo "Release: $RELEASE_NAME"
echo "======================================"

# 1. Validate release name and directory
if [[ ! "$RELEASE_NAME" =~ ^release-[a-zA-Z0-9._-]+$ ]]; then
    echo "ERROR: Invalid release name."
    exit 1
fi

if [ ! -d "$RELEASE" ]; then
    echo "ERROR: Release directory does not exist."
    exit 1
fi

# 2. Validate standalone build
test -f "$RELEASE/server.js" || {
    echo "ERROR: server.js missing"
    exit 1
}

test -f "$RELEASE/package.json" || {
    echo "ERROR: package.json missing"
    exit 1
}

test -f "$RELEASE/.next/BUILD_ID" || {
    echo "ERROR: Next.js BUILD_ID missing"
    exit 1
}

test -d "$RELEASE/.next/static" || {
    echo "ERROR: Next.js static assets missing"
    exit 1
}

test -d "$RELEASE/node_modules" || {
    echo "ERROR: node_modules missing"
    exit 1
}

test -f "$APP/shared/.env.production" || {
    echo "ERROR: Shared environment file missing"
    exit 1
}

# 3. Link shared environment file
ln -sfn "$APP/shared/.env.production" "$RELEASE/.env.production"

echo "Release validation successful"

# 4. Preserve previous release for rollback
PREVIOUS_RELEASE=""

if [ -L "$CURRENT" ]; then
    PREVIOUS_RELEASE=$(readlink -f "$CURRENT" || true)
fi

if [ -n "$PREVIOUS_RELEASE" ] && [ ! -d "$PREVIOUS_RELEASE" ]; then
    echo "ERROR: Previous release target is invalid."
    exit 1
fi

echo "Previous release: ${PREVIOUS_RELEASE:-None}"

# 5. Create PM2 configuration
cat > "$APP/ecosystem.config.cjs" <<'CONFIG'
module.exports = {
  apps: [{
    name: "PoojariJiAdmin",
    cwd: "/var/www/PoojariJiAdmin/current",
    script: "server.js",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
      PORT: 3001,
      HOSTNAME: "127.0.0.1"
    }
  }]
};
CONFIG

# 6. Switch current release
ln -sfn "$RELEASE" "$CURRENT"

echo "New release activated"
echo "Restarting PoojariJiAdmin..."

# 7. Restart only PoojariJiAdmin under ubuntu PM2
if ! pm2 startOrReload "$APP/ecosystem.config.cjs" \
    --only PoojariJiAdmin --update-env; then

    echo "ERROR: PM2 activation failed"

    if [ -n "$PREVIOUS_RELEASE" ]; then
        echo "Rolling back to previous release..."

        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT"

        pm2 startOrReload "$APP/ecosystem.config.cjs" \
            --only PoojariJiAdmin --update-env || true
    else
        echo "No previous release available."
        echo "Manual recovery may be required."
    fi

    exit 1
fi

# 8. Verify the new release is actually running
echo "Checking new release..."

HEALTHY=0

for i in $(seq 1 30); do

    PID=$(pm2 pid PoojariJiAdmin | head -n 1)

    if [[ "$PID" =~ ^[0-9]+$ ]] && [ -d "/proc/$PID" ]; then

        RUNNING_CWD=$(readlink -f "/proc/$PID/cwd" 2>/dev/null || true)

        if [ "$RUNNING_CWD" = "$RELEASE" ] &&
           curl -fsS "http://127.0.0.1:$PORT" -o /dev/null; then

            HEALTHY=1
            break
        fi
    fi

    sleep 2
done

# 9. Deployment successful
if [ "$HEALTHY" -eq 1 ]; then

    echo "======================================"
    echo "SUCCESS: Deployment completed"
    echo "======================================"

    pm2 save
    pm2 status

    echo "Active release:"
    readlink -f "$CURRENT"

    exit 0
fi

# 10. Rollback if health check fails
echo "======================================"
echo "ERROR: New release health check failed"
echo "Starting rollback..."
echo "======================================"

if [ -n "$PREVIOUS_RELEASE" ]; then

    ln -sfn "$PREVIOUS_RELEASE" "$CURRENT"

    pm2 startOrReload "$APP/ecosystem.config.cjs" \
        --only PoojariJiAdmin --update-env || true

    echo "Previous release restored"

    # Verify rollback
    ROLLBACK_OK=0

    for i in $(seq 1 30); do
        PID=$(pm2 pid PoojariJiAdmin | head -n 1)

        if [[ "$PID" =~ ^[0-9]+$ ]] && [ -d "/proc/$PID" ]; then

            RUNNING_CWD=$(readlink -f "/proc/$PID/cwd" 2>/dev/null || true)

            if [ "$RUNNING_CWD" = "$PREVIOUS_RELEASE" ] &&
               curl -fsS "http://127.0.0.1:$PORT" -o /dev/null; then

                ROLLBACK_OK=1
                break
            fi
        fi

        sleep 2
    done

    pm2 save

    if [ "$ROLLBACK_OK" -eq 1 ]; then
        echo "SUCCESS: Previous release is healthy again."
    else
        echo "CRITICAL: Rollback health check failed."
        pm2 logs PoojariJiAdmin --lines 50 --nostream || true
    fi

else

    echo "No previous release available."
    echo "Manual recovery required."

fi

exit 1
