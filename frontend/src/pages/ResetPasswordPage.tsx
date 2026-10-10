import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setErrorMessage(null);
      await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      toast.success('Password successfully reset! You can now log in.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Set new password</CardTitle>
          <CardDescription>
            Choose a strong password to secure your candidate profile and resumes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Password Reset Complete</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Redirecting you to the sign-in page in a moment...
              </p>
              <Link to="/login" className="mt-4 w-full">
                <Button className="w-full">Proceed to Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!tokenFromUrl && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Reset Token
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter reset token from your email"
                    error={errors.token?.message}
                    {...register('token')}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="At least 8 chars, 1 uppercase, 1 number"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="Re-enter your new password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button type="submit" className="w-full mt-4" size="lg" isLoading={isSubmitting}>
                Reset Password
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-4">
          <Link to="/login" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
