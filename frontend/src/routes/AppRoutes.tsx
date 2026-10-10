import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout, ProtectedLayout, DashboardLayout } from '@/layouts';
import { Spinner } from '@/components/ui/Spinner';

// Lazy-load route components for optimal initial bundle splitting
const LandingPage = React.lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = React.lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = React.lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = React.lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = React.lazy(() =>
  import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const VerifyEmailPage = React.lazy(() =>
  import('@/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage }))
);
const DashboardPage = React.lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ResumesPage = React.lazy(() =>
  import('@/pages/FeaturePages').then((m) => ({ default: m.ResumesPage }))
);
const AIAnalysisPage = React.lazy(() =>
  import('@/pages/FeaturePages').then((m) => ({ default: m.AIAnalysisPage }))
);
const JobsPage = React.lazy(() =>
  import('@/pages/FeaturePages').then((m) => ({ default: m.JobsPage }))
);
const AnalyticsPage = React.lazy(() =>
  import('@/pages/FeaturePages').then((m) => ({ default: m.AnalyticsPage }))
);
const NotificationsPage = React.lazy(() =>
  import('@/pages/FeaturePages').then((m) => ({ default: m.NotificationsPage }))
);
const ProfilePage = React.lazy(() =>
  import('@/pages/FeaturePages').then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = React.lazy(() =>
  import('@/pages/FeaturePages').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = React.lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const SuspenseFallback = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const router = createBrowserRouter([
  // Public Routes (Landing, Auth)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<SuspenseFallback />}>
            <LandingPage />
          </React.Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <React.Suspense fallback={<SuspenseFallback />}>
            <LoginPage />
          </React.Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <React.Suspense fallback={<SuspenseFallback />}>
            <RegisterPage />
          </React.Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <React.Suspense fallback={<SuspenseFallback />}>
            <ForgotPasswordPage />
          </React.Suspense>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <React.Suspense fallback={<SuspenseFallback />}>
            <ResetPasswordPage />
          </React.Suspense>
        ),
      },
      {
        path: 'verify-email',
        element: (
          <React.Suspense fallback={<SuspenseFallback />}>
            <VerifyEmailPage />
          </React.Suspense>
        ),
      },
    ],
  },

  // Protected Dashboard Routes
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: 'dashboard',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <DashboardPage />
              </React.Suspense>
            ),
          },
          {
            path: 'resumes',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <ResumesPage />
              </React.Suspense>
            ),
          },
          {
            path: 'ai-analysis',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <AIAnalysisPage />
              </React.Suspense>
            ),
          },
          {
            path: 'jobs',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <JobsPage />
              </React.Suspense>
            ),
          },
          {
            path: 'analytics',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <AnalyticsPage />
              </React.Suspense>
            ),
          },
          {
            path: 'notifications',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <NotificationsPage />
              </React.Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <ProfilePage />
              </React.Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <React.Suspense fallback={<SuspenseFallback />}>
                <SettingsPage />
              </React.Suspense>
            ),
          },
        ],
      },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: <PublicLayout />,
    children: [
      {
        path: '*',
        element: (
          <React.Suspense fallback={<SuspenseFallback />}>
            <NotFoundPage />
          </React.Suspense>
        ),
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
