import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Download,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Printer,
  Eye,
  Sliders,
} from 'lucide-react';
import { useResumeBuilderStore, type WorkExperienceItem, type EducationItem, type ProjectItem } from '@/stores/resume-builder.store';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { toast } from '@/components/ui/Toast';

export function ResumeBuilderPage() {
  const {
    resumeData,
    activeTemplate,
    hasUnsavedChanges,
    updatePersonalDetails,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    updateSkills,
    setActiveTemplate,
    markSaved,
    resetToDefault,
  } = useResumeBuilderStore();

  const [activeTab, setActiveTab] = React.useState('personal');
  const [skillInput, setSkillInput] = React.useState('');
  const previewPrintRef = React.useRef<HTMLDivElement>(null);

  // Prevent accidental navigation when there are unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveDraft = () => {
    markSaved();
    toast.success('Resume draft saved securely to local cache!');
  };

  const handlePrintDownload = () => {
    window.print();
  };

  const handleAddExperienceItem = () => {
    const newExp: WorkExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Role Title',
      location: 'City, Country',
      startDate: '2023-01',
      endDate: '',
      current: true,
      highlights: ['Key achievement or impact bullet point.'],
    };
    addExperience(newExp);
  };

  const handleAddEducationItem = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: 'University / College',
      degree: 'Degree / Certificate',
      fieldOfStudy: 'Field of Study',
      startDate: '2019',
      endDate: '2023',
    };
    addEducation(newEdu);
  };

  const handleAddProjectItem = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: 'Project Name',
      technologies: 'Tech stack used',
      description: 'Concise overview of what this project accomplished.',
      highlights: [],
    };
    addProject(newProj);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const updated = Array.from(new Set([...resumeData.skills.technical, skillInput.trim()]));
      updateSkills({ technical: updated });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = resumeData.skills.technical.filter((s) => s !== skillToRemove);
    updateSkills({ technical: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header with Template Selector & Actions */}
      <PageHeader
        title="Interactive Resume Builder"
        description="Craft, format, and fine-tune an ATS-compliant resume with live multi-template rendering."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resumes', href: '/resumes' }, { label: 'Builder' }]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="warning" className="text-xs">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleSaveDraft} className="gap-2">
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button size="sm" onClick={handlePrintDownload} className="gap-2">
              <Printer className="h-4 w-4" /> Print / Export PDF
            </Button>
          </div>
        }
      />

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Section Forms (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-muted border border-border">
            {[
              { id: 'personal', label: 'Personal' },
              { id: 'summary', label: 'Summary' },
              { id: 'experience', label: 'Experience' },
              { id: 'education', label: 'Education' },
              { id: 'skills', label: 'Skills' },
              { id: 'projects', label: 'Projects' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Personal Details */}
          {activeTab === 'personal' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personal Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Full Name
                  </label>
                  <Input
                    value={resumeData.personalDetails.fullName}
                    onChange={(e) => updatePersonalDetails({ fullName: e.target.value })}
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Professional Job Title
                  </label>
                  <Input
                    value={resumeData.personalDetails.jobTitle}
                    onChange={(e) => updatePersonalDetails({ jobTitle: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={resumeData.personalDetails.email}
                      onChange={(e) => updatePersonalDetails({ email: e.target.value })}
                      placeholder="e.g. jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Phone Number
                    </label>
                    <Input
                      value={resumeData.personalDetails.phone}
                      onChange={(e) => updatePersonalDetails({ phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Location
                  </label>
                  <Input
                    value={resumeData.personalDetails.location}
                    onChange={(e) => updatePersonalDetails({ location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      LinkedIn URL
                    </label>
                    <Input
                      value={resumeData.personalDetails.linkedinUrl || ''}
                      onChange={(e) => updatePersonalDetails({ linkedinUrl: e.target.value })}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      GitHub URL
                    </label>
                    <Input
                      value={resumeData.personalDetails.githubUrl || ''}
                      onChange={(e) => updatePersonalDetails({ githubUrl: e.target.value })}
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 2: Professional Summary */}
          {activeTab === 'summary' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Professional Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Highlight your years of experience, core technical specialties, and primary accomplishments.
                </p>
                <Textarea
                  rows={7}
                  value={resumeData.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="Results-driven engineer with 5+ years building..."
                />
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Work Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Work History ({resumeData.experience.length})</span>
                <Button size="sm" onClick={handleAddExperienceItem} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </Button>
              </div>

              {resumeData.experience.map((exp, idx) => (
                <Card key={exp.id} className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold">Position #{idx + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(exp.id)}
                      className="text-destructive h-8 w-8 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Company
                        </label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Job Role
                        </label>
                        <Input
                          value={exp.role}
                          onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Start Date
                        </label>
                        <Input
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          placeholder="YYYY-MM"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          End Date
                        </label>
                        <Input
                          value={exp.endDate}
                          disabled={exp.current}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          placeholder={exp.current ? 'Present' : 'YYYY-MM'}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Location
                        </label>
                        <Input
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Accomplishment Highlights (One per line)
                      </label>
                      <Textarea
                        rows={4}
                        value={exp.highlights.join('\n')}
                        onChange={(e) =>
                          updateExperience(exp.id, {
                            highlights: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                          })
                        }
                        placeholder="Bullet points describing quantitative impact..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tab 4: Education */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Education ({resumeData.education.length})</span>
                <Button size="sm" onClick={handleAddEducationItem} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add School
                </Button>
              </div>

              {resumeData.education.map((edu) => (
                <Card key={edu.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold">{edu.institution || 'School'}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                      className="text-destructive h-8 w-8 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Institution
                        </label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Degree & Major
                        </label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                          placeholder="e.g. B.S. in Computer Science"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Start & Graduation Years
                        </label>
                        <Input
                          value={`${edu.startDate} – ${edu.endDate}`}
                          onChange={(e) => {
                            const [start, end] = e.target.value.split('–').map((s) => s.trim());
                            updateEducation(edu.id, { startDate: start || '', endDate: end || '' });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          GPA / Honors (Optional)
                        </label>
                        <Input
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                          placeholder="3.8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tab 5: Skills */}
          {activeTab === 'skills' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Technical Skills & Competencies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Type a skill and press Enter to add:
                  </label>
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Docker, TypeScript, GraphQL..."
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {resumeData.skills.technical.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 py-1 px-2.5">
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 6: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Featured Projects ({resumeData.projects.length})</span>
                <Button size="sm" onClick={handleAddProjectItem} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </Button>
              </div>

              {resumeData.projects.map((proj) => (
                <Card key={proj.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold">{proj.name || 'Project'}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProject(proj.id)}
                      className="text-destructive h-8 w-8 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Project Name
                      </label>
                      <Input
                        value={proj.name}
                        onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Tech Stack
                      </label>
                      <Input
                        value={proj.technologies}
                        onChange={(e) => updateProject(proj.id, { technologies: e.target.value })}
                        placeholder="React, TypeScript, Express..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Description
                      </label>
                      <Textarea
                        rows={3}
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Live Template Preview (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Live ATS Preview</span>
            </div>

            {/* Template Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Template:</span>
              {(['modern', 'minimal', 'executive'] as const).map((tmpl) => (
                <Button
                  key={tmpl}
                  size="sm"
                  variant={activeTemplate === tmpl ? 'default' : 'outline'}
                  onClick={() => setActiveTemplate(tmpl)}
                  className="capitalize text-xs h-7 px-2.5"
                >
                  {tmpl}
                </Button>
              ))}
            </div>
          </div>

          {/* Actual Rendered Resume Template */}
          <div className="overflow-x-auto rounded-lg border border-border bg-muted/20 p-4">
            <ResumePreview ref={previewPrintRef} data={resumeData} template={activeTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}
