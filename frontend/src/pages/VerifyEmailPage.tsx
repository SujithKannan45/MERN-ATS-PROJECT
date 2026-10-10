import * as React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = React.useState(!!token);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Manual resend email state
  const [resendEmail, setResendEmail] = React.useState('');
  const [resending, setResending] = React.useState(false);
  const [resendSent, setResendSent] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;

    let mounted = true;
    authService
      .verifyEmail({ token })
      .then(() => {
        if (mounted) {
          setVerified(true);
          toast.success('Your email address has been verified!');
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Invalid or expired verification link.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    try {
      setResending(true);
      await authService.resendVerification({ email: resendEmail });
      setResendSent(true);
      toast.success('Verification email resent successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend verification.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
          <CardDescription>
            Confirming your account email ensures secure notifications and account recovery.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Verifying your token...</p>
            </div>
          ) : verified ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-foreground">Email Confirmed!</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Your email has been verified. You now have complete access to all AI Resume features.
              </p>
              <Link to="/login" className="mt-4 w-full">
                <Button className="w-full gap-2">
                  Sign In to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Need a new verification link? Enter your email address below to receive another one:
              </p>

              {resendSent ? (
                <div className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 text-center font-medium">
                  Verification link has been sent! Please check your inbox.
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={resending}>
                    Resend Verification Email
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-4">
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground font-medium">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
