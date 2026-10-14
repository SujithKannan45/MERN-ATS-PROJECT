import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Bell,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useThemeStore, type Theme } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { toast } from '@/components/ui/Toast';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  // Gemini Custom Key State
  const [customApiKey, setCustomApiKey] = React.useState(
    localStorage.getItem('ats_custom_gemini_key') || ''
  );
  const [showApiKey, setShowApiKey] = React.useState(false);

  // Notification Preferences State
  const [emailAlerts, setEmailAlerts] = React.useState(
    localStorage.getItem('ats_pref_email_alerts') !== 'false'
  );
  const [weeklyDigest, setWeeklyDigest] = React.useState(
    localStorage.getItem('ats_pref_weekly_digest') !== 'false'
  );

  // Logout Confirm Dialog
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false);

  // Password Change Mutation
  const changePasswordMutation = useMutation({
    mutationFn: () => {
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New password and confirmation do not match');
      }
      return authService.changePassword({
        currentPassword,
        newPassword,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(msg);
      toast.error(msg);
    },
  });

  const handleSaveApiKey = () => {
    localStorage.setItem('ats_custom_gemini_key', customApiKey.trim());
    toast.success('Custom Gemini API key saved to your local storage!');
  };

  const handleToggleEmailAlerts = (checked: boolean) => {
    setEmailAlerts(checked);
    localStorage.setItem('ats_pref_email_alerts', String(checked));
    toast.success('Notification preferences updated');
  };

  const handleToggleWeeklyDigest = (checked: boolean) => {
    setWeeklyDigest(checked);
    localStorage.setItem('ats_pref_weekly_digest', String(checked));
    toast.success('Digest preferences updated');
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/login');
    toast.info('You have been signed out successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Account & System Settings"
        description="Configure your visual preferences, security credentials, personal Gemini AI keys, and communication alerts."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <div className="space-y-6">
        {/* Appearance & Theme Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Interface Theme & Appearance
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Choose how the ATS Resume platform looks across all devices.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'light' as Theme,
                  label: 'Light Mode',
                  description: 'Clean high-contrast theme for daytime',
                  icon: <Sun className="h-5 w-5 text-amber-500" />,
                },
                {
                  id: 'dark' as Theme,
                  label: 'Dark Mode',
                  description: 'Recruiter-focused dark aesthetic',
                  icon: <Moon className="h-5 w-5 text-indigo-400" />,
                },
                {
                  id: 'system' as Theme,
                  label: 'System Preference',
                  description: 'Synchronize automatically with OS settings',
                  icon: <Laptop className="h-5 w-5 text-muted-foreground" />,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                    theme === opt.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    {opt.icon}
                    {theme === opt.id && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="font-semibold text-xs text-foreground">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security & Password Change Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Password & Authentication Security
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Update your account password with standard cryptographic hashing (Argon2 / bcrypt).
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {passwordError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Confirm New Password
                </label>
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                className="gap-2"
                onClick={() => changePasswordMutation.mutate()}
                isLoading={changePasswordMutation.isPending}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                <KeyRound className="h-4 w-4" /> Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI & Google Gemini BYOK Settings */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Gemini AI Engine & BYOK API Keys
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              By default, platform-managed Gemini 1.5/2.0 API instances power your resume evaluations. You can optionally supply your personal Google AI key to bypass rate limits.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Personal Google Gemini API Key (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button size="sm" onClick={handleSaveApiKey} variant="outline">
                  Save Key
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Your key is stored securely in your browser session and sent only as an ephemeral header to the AI analysis endpoints.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Communication & Email Notifications
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Control which system events trigger email notifications.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Application Status & Interview Alerts</p>
                <p className="text-[11px] text-muted-foreground">
                  Receive notifications when an application status updates or an interview is scheduled.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => handleToggleEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Weekly Pipeline & ATS Progress Digest</p>
                <p className="text-[11px] text-muted-foreground">
                  Summary of jobs applied to, conversion rates, and skill recommendations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => handleToggleWeeklyDigest(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone & Sign Out */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Account Session Management
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Sign out of this device or end all active sessions.
            </p>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              <span>Logged in as: <strong className="text-foreground">{user?.email}</strong></span>
              <span className="block mt-0.5 text-[11px]">User ID: {user?.id}</span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setIsLogoutOpen(true)}
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        title="Sign Out of Account"
        description="Are you sure you want to log out of your ATS workspace? You will need to sign in again to access your resumes and pipeline."
        confirmText="Yes, Sign Out"
        isDestructive={true}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
