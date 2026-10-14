import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Sparkles,
  ExternalLink,
  Edit3,
  Save,
  Globe,
  Code,
  Share2,
  MapPin,
  Calendar,
  Send,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';
import { authService } from '@/services/auth.service';
import { analyticsService } from '@/services/analytics.service';
import { toast } from '@/components/ui/Toast';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const [isEditing, setIsEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState(user?.fullName || '');
  const [title, setTitle] = React.useState(
    localStorage.getItem('ats_profile_title') || 'Software Engineer'
  );
  const [location, setLocation] = React.useState(
    localStorage.getItem('ats_profile_location') || 'San Francisco, CA'
  );
  const [bio, setBio] = React.useState(
    localStorage.getItem('ats_profile_bio') ||
      'Passionate technologist focused on crafting performant full-stack systems and high-converting resumes.'
  );
  const [linkedinUrl, setLinkedinUrl] = React.useState(
    localStorage.getItem('ats_profile_linkedin') || 'https://linkedin.com/in/'
  );
  const [githubUrl, setGithubUrl] = React.useState(
    localStorage.getItem('ats_profile_github') || 'https://github.com/'
  );
  const [portfolioUrl, setPortfolioUrl] = React.useState(
    localStorage.getItem('ats_profile_portfolio') || 'https://'
  );

  // Sync state if user changes
  React.useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

  // 1. Fetch Active Resume for Profile Card
  const { data: resume, isLoading: loadingResume } = useQuery({
    queryKey: ['current-resume'],
    queryFn: () => resumeService.getCurrentResume(),
  });

  // 2. Fetch KPI Stats for Profile summary
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => analyticsService.getOverview(),
  });

  // 3. Resend Verification Mutation
  const resendVerificationMutation = useMutation({
    mutationFn: () => {
      if (!user?.email) throw new Error('No user email found');
      return authService.resendVerification({ email: user.email });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Verification link sent to your inbox.');
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send verification email');
    },
  });

  const handleSaveProfile = () => {
    if (!fullName.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }

    if (user) {
      const updatedUser = { ...user, fullName: fullName.trim() };
      setUser(updatedUser);
    }

    localStorage.setItem('ats_profile_title', title.trim());
    localStorage.setItem('ats_profile_location', location.trim());
    localStorage.setItem('ats_profile_bio', bio.trim());
    localStorage.setItem('ats_profile_linkedin', linkedinUrl.trim());
    localStorage.setItem('ats_profile_github', githubUrl.trim());
    localStorage.setItem('ats_profile_portfolio', portfolioUrl.trim());

    setIsEditing(false);
    toast.success('Candidate profile information updated successfully!');
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'C';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Candidate Profile"
        description="Manage your personal background, contact information, career bio, and candidate credentials."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
        action={
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" className="gap-2" onClick={handleSaveProfile}>
                <Save className="h-4 w-4" /> Save Profile
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Account Badge Card */}
        <div className="space-y-6">
          <Card className="border-border bg-card p-6 text-center space-y-4">
            {/* Avatar Pill */}
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-3xl shadow-lg ring-4 ring-primary/20">
              {initial}
              <div
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-[10px]"
                title="Account Active"
              >
                ✓
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground truncate">{user?.fullName || 'Candidate'}</h3>
              <p className="text-xs text-muted-foreground truncate">{title}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs">
                {user?.role || 'candidate'}
              </Badge>
              {user?.isEmailVerified ? (
                <Badge variant="success" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="warning" className="text-xs gap-1">
                  <AlertCircle className="h-3 w-3" /> Email Pending
                </Badge>
              )}
            </div>

            <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span>Email:</span>
                <span className="font-semibold text-foreground truncate max-w-[170px]">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Location:</span>
                <span className="font-semibold text-foreground truncate">{location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {user?.accountStatus || 'active'}
                </span>
              </div>
            </div>

            {!user?.isEmailVerified && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs gap-2"
                  onClick={() => resendVerificationMutation.mutate()}
                  isLoading={resendVerificationMutation.isPending}
                >
                  <Send className="h-3.5 w-3.5" /> Resend Verification
                </Button>
              </div>
            )}
          </Card>

          {/* Active Vault Resume Card */}
          <Card className="border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="h-4 w-4 text-primary" /> Active Resume
              </span>
              <Link to="/resumes" className="text-xs text-primary hover:underline">
                Vault
              </Link>
            </div>

            {loadingResume ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : resume ? (
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground truncate">{resume.fileName}</p>
                  <Badge variant="outline" className="text-[10px]">
                    v{resume.version}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
                <div className="pt-1">
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Download Parsed Asset <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-muted-foreground space-y-2">
                <p>No active resume in vault.</p>
                <Link to="/resumes">
                  <Button size="sm" variant="outline" className="text-xs w-full">
                    Upload Resume
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right 2 Columns: Editable Profile Form & Activity Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base">Candidate Information</CardTitle>
              <p className="text-xs text-muted-foreground">
                These credentials populate your automatic ATS resume cover sheets and contact data.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Full Name & Target Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Full Name *
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    leftIcon={<UserIcon className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Target Role / Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={!isEditing}
                    leftIcon={<Briefcase className="h-4 w-4" />}
                  />
                </div>
              </div>

              {/* Email & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Primary Email
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled={true}
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={!isEditing}
                    leftIcon={<MapPin className="h-4 w-4" />}
                  />
                </div>
              </div>

              {/* Career Bio */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Professional Bio & Overview
                </label>
                <Textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Summary of career experience and skills..."
                />
              </div>

              {/* Social & Professional Links */}
              <div className="space-y-3 pt-2 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Professional Web Links
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      LinkedIn Profile
                    </label>
                    <Input
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      disabled={!isEditing}
                      leftIcon={<Share2 className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      GitHub Handle
                    </label>
                    <Input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={!isEditing}
                      leftIcon={<Code className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Portfolio Website
                    </label>
                    <Input
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      disabled={!isEditing}
                      leftIcon={<Globe className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="h-4 w-4" /> Save Profile Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3.5 border-border bg-card text-center">
              <span className="text-[11px] text-muted-foreground font-medium">Pipeline Jobs</span>
              <p className="text-2xl font-black text-foreground mt-1">
                {overview?.jobAnalytics?.totalJobs ?? 0}
              </p>
            </Card>

            <Card className="p-3.5 border-border bg-card text-center">
              <span className="text-[11px] text-muted-foreground font-medium">Average ATS Score</span>
              <p className="text-2xl font-black text-indigo-500 mt-1">
                {Math.round(overview?.resumeAnalytics?.averageAtsScore ?? 0)}%
              </p>
            </Card>

            <Card className="p-3.5 border-border bg-card text-center">
              <span className="text-[11px] text-muted-foreground font-medium">AI Analyses Run</span>
              <p className="text-2xl font-black text-foreground mt-1">
                {overview?.aiAnalytics?.totalResumeAnalyses ?? 0}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
