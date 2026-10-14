import * as React from 'react';
import { X, Plus, Sparkles, Building, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import type {
  IJobResponse,
  CreateJobDto,
  UpdateJobDto,
  JobStatus,
  WorkplaceType,
  EmploymentType,
  JobPriority,
} from '@/services/job.service';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobDto | UpdateJobDto) => Promise<void>;
  jobToEdit?: IJobResponse | null;
  initialStatus?: JobStatus;
  isLoading?: boolean;
}

export function JobFormModal({
  isOpen,
  onClose,
  onSubmit,
  jobToEdit,
  initialStatus = 'Saved',
  isLoading = false,
}: JobFormModalProps) {
  const [companyName, setCompanyName] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [jobDescription, setJobDescription] = React.useState('');
  const [jobUrl, setJobUrl] = React.useState('');
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>('Full-time');
  const [workplaceType, setWorkplaceType] = React.useState<WorkplaceType>('Remote');
  const [location, setLocation] = React.useState('');
  const [salaryMin, setSalaryMin] = React.useState('');
  const [salaryMax, setSalaryMax] = React.useState('');
  const [salaryCurrency, setSalaryCurrency] = React.useState('USD');
  const [salaryPeriod, setSalaryPeriod] = React.useState<'hourly' | 'monthly' | 'yearly'>('yearly');
  const [status, setStatus] = React.useState<JobStatus>(initialStatus);
  const [priority, setPriority] = React.useState<JobPriority>('Medium');
  const [notes, setNotes] = React.useState('');
  const [appliedDate, setAppliedDate] = React.useState('');
  const [interviewDate, setInterviewDate] = React.useState('');
  const [offerDate, setOfferDate] = React.useState('');
  const [rejectionDate, setRejectionDate] = React.useState('');

  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState('');
  const [errors, setErrors] = React.useState<{ companyName?: string; jobTitle?: string }>({});

  React.useEffect(() => {
    if (jobToEdit) {
      setCompanyName(jobToEdit.companyName || '');
      setJobTitle(jobToEdit.jobTitle || '');
      setJobDescription(jobToEdit.jobDescription || '');
      setJobUrl(jobToEdit.jobUrl || '');
      setEmploymentType(jobToEdit.employmentType || 'Full-time');
      setWorkplaceType(jobToEdit.workplaceType || 'Remote');
      setLocation(jobToEdit.location || '');
      setSalaryMin(jobToEdit.salary?.min ? String(jobToEdit.salary.min) : '');
      setSalaryMax(jobToEdit.salary?.max ? String(jobToEdit.salary.max) : '');
      setSalaryCurrency(jobToEdit.salary?.currency || 'USD');
      setSalaryPeriod(jobToEdit.salary?.period || 'yearly');
      setStatus(jobToEdit.status || 'Saved');
      setPriority(jobToEdit.priority || 'Medium');
      setNotes(jobToEdit.notes || '');
      setAppliedDate(jobToEdit.appliedDate ? new Date(jobToEdit.appliedDate).toISOString().split('T')[0] : '');
      setInterviewDate(jobToEdit.interviewDate ? new Date(jobToEdit.interviewDate).toISOString().split('T')[0] : '');
      setOfferDate(jobToEdit.offerDate ? new Date(jobToEdit.offerDate).toISOString().split('T')[0] : '');
      setRejectionDate(jobToEdit.rejectionDate ? new Date(jobToEdit.rejectionDate).toISOString().split('T')[0] : '');
      setSkills(jobToEdit.requiredSkills || []);
    } else {
      setCompanyName('');
      setJobTitle('');
      setJobDescription('');
      setJobUrl('');
      setEmploymentType('Full-time');
      setWorkplaceType('Remote');
      setLocation('');
      setSalaryMin('');
      setSalaryMax('');
      setSalaryCurrency('USD');
      setSalaryPeriod('yearly');
      setStatus(initialStatus);
      setPriority('Medium');
      setNotes('');
      setAppliedDate(initialStatus === 'Applied' ? new Date().toISOString().split('T')[0] : '');
      setInterviewDate('');
      setOfferDate('');
      setRejectionDate('');
      setSkills([]);
    }
    setErrors({});
  }, [jobToEdit, initialStatus, isOpen]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { companyName?: string; jobTitle?: string } = {};

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: CreateJobDto = {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim() || undefined,
      jobUrl: jobUrl.trim() || undefined,
      employmentType,
      workplaceType,
      location: location.trim() || undefined,
      salary:
        salaryMin || salaryMax
          ? {
              min: salaryMin ? Number(salaryMin) : undefined,
              max: salaryMax ? Number(salaryMax) : undefined,
              currency: salaryCurrency || 'USD',
              period: salaryPeriod || 'yearly',
            }
          : undefined,
      requiredSkills: skills,
      status,
      priority,
      notes: notes.trim() || undefined,
      appliedDate: appliedDate ? new Date(appliedDate).toISOString() : undefined,
      interviewDate: interviewDate ? new Date(interviewDate).toISOString() : undefined,
      offerDate: offerDate ? new Date(offerDate).toISOString() : undefined,
      rejectionDate: rejectionDate ? new Date(rejectionDate).toISOString() : undefined,
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jobToEdit ? 'Edit Job Opening' : 'Add New Job to Track'}
      description="Track application milestones, recruiter contacts, and evaluate ATS resume matching."
      size="lg"
    >
      <form onSubmit={handleSubmitForm} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Job Title *
            </label>
            <Input
              placeholder="e.g. Senior Full-Stack Engineer"
              leftIcon={<Briefcase className="h-4 w-4" />}
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (errors.jobTitle) setErrors((prev) => ({ ...prev, jobTitle: undefined }));
              }}
              error={errors.jobTitle}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Company Name *
            </label>
            <Input
              placeholder="e.g. Google, Stripe, OpenAI"
              leftIcon={<Building className="h-4 w-4" />}
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: undefined }));
              }}
              error={errors.companyName}
            />
          </div>
        </div>

        {/* URL and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Job Posting URL
            </label>
            <Input
              type="url"
              placeholder="https://jobs.lever.co/..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Location
            </label>
            <Input
              placeholder="e.g. San Francisco, CA or Remote"
              leftIcon={<MapPin className="h-4 w-4" />}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Types & Classification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Workplace Type
            </label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
              <option value="Temporary">Temporary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as JobPriority)}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority 🔥</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Status & Relevant Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Application Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Saved">Saved (Wishlist)</option>
              <option value="Applied">Applied</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Completed">Interview Completed</option>
              <option value="Offer Received">Offer Received 🎉</option>
              <option value="Accepted">Accepted ✅</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Applied Date
            </label>
            <Input
              type="date"
              leftIcon={<Calendar className="h-4 w-4" />}
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Compensation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Min Salary ($)
            </label>
            <Input
              type="number"
              placeholder="120000"
              leftIcon={<DollarSign className="h-4 w-4" />}
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Max Salary ($)
            </label>
            <Input
              type="number"
              placeholder="160000"
              leftIcon={<DollarSign className="h-4 w-4" />}
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Pay Period
            </label>
            <select
              value={salaryPeriod}
              onChange={(e) => setSalaryPeriod(e.target.value as 'hourly' | 'monthly' | 'yearly')}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="yearly">Per Year</option>
              <option value="monthly">Per Month</option>
              <option value="hourly">Per Hour</option>
            </select>
          </div>
        </div>

        {/* Required Skills Tag Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground">
            Target & Required Skills (Press Enter to add)
          </label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="e.g. React, TypeScript, Node.js, GraphQL, AWS"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleAddSkill} size="sm">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="gap-1.5 pr-1 text-xs py-1 cursor-pointer hover:bg-muted"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <span>{skill}</span>
                  <X className="h-3 w-3 hover:text-destructive" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Job Description (For Gemini AI Match) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-muted-foreground">
              Job Description
            </label>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              Powers AI Semantic ATS Match
            </span>
          </div>
          <Textarea
            rows={4}
            placeholder="Paste job requirements and role description to evaluate your resume ATS alignment..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Personal Notes & Follow-ups
          </label>
          <Textarea
            rows={2}
            placeholder="Recruiter contact names, referral details, salary expectations, next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {jobToEdit ? 'Save Changes' : 'Create Tracked Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
