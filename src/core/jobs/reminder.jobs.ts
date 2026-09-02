import { Job } from '../../modules/jobs/models/job.model.js';
import { User, IUserDocument } from '../../modules/auth/models/user.model.js';
import { emailQueue } from '../queue/email.queue.js';
import { notificationQueue } from '../queue/notification.queue.js';
import { logger } from '../logger/logger.js';

export class ReminderJobs {
  /**
   * Scans for interviews occurring in the next 24 hours and dispatches reminder emails and notifications
   */
  public static async sendUpcomingInterviewReminders(): Promise<number> {
    const now = new Date();
    const next24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
      const upcomingJobs = await Job.find({
        status: 'Interview Scheduled',
        interviewDate: { $gte: now, $lte: next24Hours },
      }).exec();

      let remindersDispatched = 0;

      for (const job of upcomingJobs) {
        const user = await User.findById(job.userId).exec();
        if (!user || !user.email) continue;

        const formattedDate = job.interviewDate
          ? job.interviewDate.toLocaleString('en-US', {
              dateStyle: 'full',
              timeStyle: 'short',
            })
          : 'Tomorrow';

        // 1. Enqueue Email Reminder
        emailQueue.enqueueEmail({
          type: 'INTERVIEW_REMINDER',
          to: user.email,
          name: user.fullName || 'Candidate',
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          interviewDate: formattedDate,
          notes: job.notes,
        });

        // 2. Enqueue In-App Notification
        notificationQueue.enqueueNotification({
          userId: user._id.toString(),
          title: `Upcoming Interview: ${job.companyName}`,
          message: `You have an interview scheduled for "${job.jobTitle}" at "${job.companyName}" on ${formattedDate}.`,
          type: 'INTERVIEW_SCHEDULED',
          data: {
            jobId: job._id.toString(),
            interviewDate: job.interviewDate,
          },
        });

        remindersDispatched++;
      }

      logger.info(`⏰ [Cron: Reminders] Dispatched ${remindersDispatched} upcoming interview reminders.`);
      return remindersDispatched;
    } catch (error) {
      logger.error('❌ [Cron: Reminders] Error sending upcoming interview reminders:', { error });
      throw error;
    }
  }

  /**
   * Weekly candidate engagement reminder to track recent applications
   */
  public static async sendWeeklyApplicationDigest(): Promise<number> {
    try {
      const activeCandidates = await User.find({ role: 'candidate', accountStatus: 'active' }).exec();
      let digestsQueued = 0;

      for (const candidate of activeCandidates as IUserDocument[]) {
        const jobCount = await Job.countDocuments({ userId: candidate._id }).exec();
        if (jobCount > 0) {
          notificationQueue.enqueueNotification({
            userId: candidate._id.toString(),
            title: 'Weekly Application Progress',
            message: `You currently have ${jobCount} tracked job opportunities in your ATS pipeline. Keep momentum going!`,
            type: 'SYSTEM',
          });
          digestsQueued++;
        }
      }

      logger.info(`⏰ [Cron: Reminders] Queued ${digestsQueued} weekly progress updates.`);
      return digestsQueued;
    } catch (error) {
      logger.error('❌ [Cron: Reminders] Error in weekly digest scheduler:', { error });
      return 0;
    }
  }
}
