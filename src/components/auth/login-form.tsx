import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { loginSchema, type LoginFormData } from '@/lib/auth/validation';
import { RateLimiter } from '@/lib/auth/rate-limit';
import { Button } from '../ui/button';
import { FormInput } from './ui/form-input';
import { FormError } from './ui/form-error';
import { RateLimitMessage } from './ui/rate-limit-message';

interface LoginFormProps {
  onToggleView: () => void;
}

export function LoginForm({ onToggleView }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState(RateLimiter.getStatus());

  // Update rate limit status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimitStatus(RateLimiter.getStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const status = RateLimiter.getStatus();
    if (status.isBlocked) {
      setError('Too many login attempts. Please try again later.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        RateLimiter.recordAttempt();
        setRateLimitStatus(RateLimiter.getStatus());
        throw authError;
      }

      // Success - reset rate limit and redirect
      RateLimiter.reset();
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-600 mt-1">Log in to your ReviewZone account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          {...register('email')}
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          disabled={rateLimitStatus.isBlocked}
        />

        <div className="space-y-1">
          <FormInput
            {...register('password')}
            label="Password"
            type="password"
            error={errors.password?.message}
            disabled={rateLimitStatus.isBlocked}
          />
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <FormError message={error} />}
        
        <RateLimitMessage
          remainingAttempts={rateLimitStatus.remainingAttempts}
          blockTimeRemaining={rateLimitStatus.blockTimeRemaining}
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          disabled={isLoading || rateLimitStatus.isBlocked}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">Don't have an account?</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleView}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          Sign up for free
        </button>
      </div>
    </div>
  );
}