module.exports = {
    apps: [
        {
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
        }
    ]
};