import React, { useState } from 'react';
import { appSupabase } from '../services/appSupabase';
import { toast } from 'react-hot-toast';
import { SpinnerIcon } from './icons';

interface PasswordResetModalProps {
    onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { error } = await appSupabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success('Password updated successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md border-2 border-border shadow-brutal-xl p-8 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider font-mono mb-2">
                        Reset Password
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Enter a new password for your account.
                    </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1 text-muted-foreground">New Password</label>
                        <input
                            type="password"
                            required
                            className="brutal-input w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1 text-muted-foreground">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="brutal-input w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="brutal-button-primary w-full py-3 flex justify-center items-center mt-6"
                    >
                        {loading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Update Password'}
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="brutal-button-secondary w-full py-2 flex justify-center items-center mt-2 text-sm"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetModal;
