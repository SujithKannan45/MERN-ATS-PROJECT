import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Trash2,
  Sparkles,
  Briefcase,
  FileText,
  Calendar,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { INotificationResponse, NotificationType } from '@/services/notification.service';

interface NotificationItemProps {
  notification: INotificationResponse;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const navigate = useNavigate();

  const getIconAndColor = (type: NotificationType) => {
    switch (type) {
      case 'OFFER_RECEIVED':
        return {
          icon: <Trophy className="h-5 w-5 text-emerald-500" />,
          bg: 'bg-emerald-500/10',
          badge: 'Offer',
          targetUrl: '/jobs',
        };
      case 'INTERVIEW_SCHEDULED':
        return {
          icon: <Calendar className="h-5 w-5 text-amber-500" />,
          bg: 'bg-amber-500/10',
          badge: 'Interview',
          targetUrl: '/jobs',
        };
      case 'ATS_SCORE_UPDATED':
      case 'RESUME_ANALYZED':
      case 'RESUME_IMPROVEMENT_AVAILABLE':
        return {
          icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
          bg: 'bg-indigo-500/10',
          badge: 'AI Scoring',
          targetUrl: '/ai-analysis',
        };
      case 'JOB_ADDED':
      case 'APPLICATION_STATUS_CHANGED':
        return {
          icon: <Briefcase className="h-5 w-5 text-blue-500" />,
          bg: 'bg-blue-500/10',
          badge: 'Job Tracker',
          targetUrl: '/jobs',
        };
      case 'RESUME_UPLOADED':
        return {
          icon: <FileText className="h-5 w-5 text-purple-500" />,
          bg: 'bg-purple-500/10',
          badge: 'Resume Vault',
          targetUrl: '/resumes',
        };
      default:
        return {
          icon: <Bell className="h-5 w-5 text-slate-500" />,
          bg: 'bg-slate-500/10',
          badge: 'Alert',
          targetUrl: '/dashboard',
        };
    }
  };

  const { icon, bg, badge, targetUrl } = getIconAndColor(notification.type);

  const handleCardClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group flex items-start justify-between gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        notification.isRead
          ? 'border-border bg-card/60 hover:bg-muted/40'
          : 'border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Icon Avatar */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground truncate">
              {notification.title}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              {badge}
            </Badge>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" title="Unread" />
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
            <span>{new Date(notification.createdAt).toLocaleString()}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-primary group-hover:underline">
              Go to page <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 shrink-0 self-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Mark as read"
            onClick={() => onMarkRead(notification.id)}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          title="Delete notification"
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
