import React, { useState } from 'react';
import { appSupabase } from '../services/appSupabase';
import { toast } from 'react-hot-toast';
import { SpinnerIcon, GoogleIcon } from './icons';

interface AuthModalProps {
    onAuthSuccess: (isGuest?: boolean) => void;
}

type AuthView = 'login' | 'signup' | 'forgot_password';

const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (view === 'login') {
                const { error } = await appSupabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Signed in successfully!');
                onAuthSuccess();
            } else if (view === 'signup') {
                const { error } = await appSupabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                    },
                });
                if (error) throw error;
                toast.success('Sign up successful! Please check your email for confirmation.');
                const { data: { session } } = await appSupabase.auth.getSession();
                if (session) onAuthSuccess();
                else setView('login');
            } else if (view === 'forgot_password') {
                const { error } = await appSupabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                toast.success('Password reset email sent!');
                setView('login');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const { error } = await appSupabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleGuestMode = () => {
        localStorage.setItem('neuronlink_guest_mode', 'true');
        onAuthSuccess(true);
        toast.success('Continuing as Guest. Data exploration is limited to 10 rows.');
    };

    const getTitle = () => {
        switch (view) {
            case 'login': return 'Welcome Back';
            case 'signup': return 'Join NeuronLink';
            case 'forgot_password': return 'Reset Password';
        }
    };

    const getSubtitle = () => {
        switch (view) {
            case 'login': return 'Sign in to access your lakehouse';
            case 'signup': return 'Create an account to start analyzing';
            case 'forgot_password': return 'Enter your email to receive a reset link';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md border-2 border-border shadow-brutal-xl p-8 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider font-mono mb-2">
                        {getTitle()}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {getSubtitle()}
                    </p>
                </div>

                {view !== 'forgot_password' && (
                    <>
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={handleGoogleAuth}
                                className="brutal-button-secondary w-full py-3 flex justify-center items-center gap-2 text-sm font-bold"
                            >
                                <GoogleIcon className="h-5 w-5" />
                                Continue with Google
                            </button>

                            <button
                                onClick={handleGuestMode}
                                className="brutal-button-secondary w-full py-3 flex justify-center items-center gap-2 text-sm font-bold border-dashed"
                            >
                                Continue as Guest (10 Row Limit)
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground font-bold">Or continue with email</span>
                            </div>
                        </div>
                    </>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1 text-muted-foreground">Email</label>
                        <input
                            type="email"
                            required
                            className="brutal-input w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                        />
                    </div>

                    {view !== 'forgot_password' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Password</label>
                                {view === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => setView('forgot_password')}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
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
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="brutal-button-primary w-full py-3 flex justify-center items-center mt-6"
                    >
                        {loading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : (
                            view === 'login' ? 'Sign In' : (view === 'signup' ? 'Create Account' : 'Send Reset Link')
                        )}
                    </button>

                    {view === 'forgot_password' && (
                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="brutal-button-secondary w-full py-2 flex justify-center items-center mt-2 text-sm"
                        >
                            Back to Sign In
                        </button>
                    )}
                </form>

                {view !== 'forgot_password' && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                            className="text-primary hover:underline text-sm font-medium"
                        >
                            {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
