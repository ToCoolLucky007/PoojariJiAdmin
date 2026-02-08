'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
export default function ChangePasswordPage() {
    const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);

            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    setActionResult({ type: 'error', message: 'Unauthorized: No admin token found.' });
                    return;
                }

                const response = await fetch(`${baseUrl}/api/admin/changepassword`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentpassword: currentPassword,   // 👈 match backend naming
                        newpassword: newPassword,
                    }),
                });

                const result = await response.json();

                // ✅ Handle business error from API
                if (!result.success) {
                    setError(result.message);
                    return;
                }

                // ✅ Success
                setSuccess(result.message || 'Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');

            } catch (err) {
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }

        } catch (err) {
            setError('Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (<ProtectedRoute>
        <AdminLayout>
            <div className="max-w-lg mx-auto">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-blue-600" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your account password securely
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Show / Hide */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showPassword ? 'Hide passwords' : 'Show passwords'}
                            </button>

                            {/* Error */}
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {error}
                                </p>
                            )}

                            {/* Success */}
                            {success && (
                                <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                    {success}
                                </p>
                            )}

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>      </AdminLayout>
    </ProtectedRoute>
    );
}
