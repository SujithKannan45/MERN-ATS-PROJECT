import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'candidate',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setErrorMessage(null);
      const res = await authService.register(data);
      setAuth(res.user, res.accessToken);
      toast.success('Account created successfully! Welcome to ResumeATS.ai');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
          <CardDescription>
            Join candidates supercharging their career with automated ATS optimization
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Jane Doe"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="jane@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="At least 8 chars, 1 uppercase, 1 number"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Re-enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <div className="flex items-start space-x-2 pt-1">
              <input
                type="checkbox"
                id="agreeToTerms"
                className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                {...register('agreeToTerms')}
              />
              <label htmlFor="agreeToTerms" className="text-xs text-muted-foreground leading-normal">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs text-destructive">{errors.agreeToTerms.message}</p>
            )}

            <Button type="submit" className="w-full mt-4" size="lg" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
