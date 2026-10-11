import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  technologies: string;
  link?: string;
  description: string;
  highlights: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
}

export interface ResumeData {
  personalDetails: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary: string;
  experience: WorkExperienceItem[];
  education: EducationItem[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export const initialResumeData: ResumeData = {
  personalDetails: {
    fullName: 'Alex Vance',
    jobTitle: 'Senior Full Stack Software Engineer',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/alexvance',
    githubUrl: 'https://github.com/alexvance',
    portfolioUrl: 'https://alexvance.dev',
  },
  summary:
    'Results-driven Senior Full Stack Engineer with 6+ years of experience architecting high-throughput distributed systems and responsive user applications using TypeScript, React, Node.js, and cloud native architectures. Proven success optimizing CI/CD pipelines, increasing application performance by 40%, and leading agile engineering squads.',
  experience: [
    {
      id: 'exp-1',
      company: 'CloudSphere Technologies',
      role: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: '',
      current: true,
      highlights: [
        'Architected and deployed a multi-tenant SaaS dashboard serving 120,000 daily active users with 99.98% uptime.',
        'Spearheaded transition from legacy monolith to microservices using Node.js, TypeScript, and MongoDB, cutting latency by 35%.',
        'Implemented automated ATS resume parsing pipeline utilizing Google Gemini AI and serverless workers.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Apex Systems',
      role: 'Full Stack Developer',
      location: 'Austin, TX',
      startDate: '2020-06',
      endDate: '2022-12',
      current: false,
      highlights: [
        'Built modern React user interfaces with Tailwind CSS and TanStack Query, accelerating load times by 45%.',
        'Engineered secure JWT authentication, rate limiting, and RBAC authorization handling 5M requests weekly.',
        'Mentored 4 junior engineers on clean architecture patterns, code reviews, and automated integration testing.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      gpa: '3.85',
      highlights: ['Dean’s Honor List', 'President of ACM Student Chapter'],
    },
  ],
  skills: {
    technical: ['TypeScript', 'JavaScript (ESNext)', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'RESTful APIs', 'GraphQL'],
    soft: ['Agile Leadership', 'Technical Mentorship', 'System Design', 'Cross-functional Collaboration'],
    tools: ['Docker', 'Git', 'Vite', 'Tailwind CSS', 'Jest', 'Supertest', 'AWS', 'Google Cloud Platform'],
  },
  projects: [
    {
      id: 'proj-1',
      name: 'AI-Powered ATS Platform',
      technologies: 'React, TypeScript, Express, MongoDB, Google Gemini AI',
      link: 'https://github.com/alexvance/ats-platform',
      description: 'End-to-end applicant tracking and resume optimization engine with AI semantic scoring.',
      highlights: [
        'Engineered automated PDF/DOCX parser and keyword extractor scoring resumes against job descriptions.',
        'Integrated live Kanban pipeline tracker for managing multiple interview timelines.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023-04',
      credentialId: 'AWS-ASA-849102',
    },
  ],
};

interface ResumeBuilderState {
  resumeData: ResumeData;
  activeTemplate: 'modern' | 'minimal' | 'executive';
  hasUnsavedChanges: boolean;
  setResumeData: (data: ResumeData) => void;
  updatePersonalDetails: (details: Partial<ResumeData['personalDetails']>) => void;
  updateSummary: (summary: string) => void;
  addExperience: (exp: WorkExperienceItem) => void;
  updateExperience: (id: string, exp: Partial<WorkExperienceItem>) => void;
  removeExperience: (id: string) => void;
  addEducation: (edu: EducationItem) => void;
  updateEducation: (id: string, edu: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  addProject: (proj: ProjectItem) => void;
  updateProject: (id: string, proj: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;
  addCertification: (cert: CertificationItem) => void;
  removeCertification: (id: string) => void;
  updateSkills: (skills: Partial<ResumeData['skills']>) => void;
  setActiveTemplate: (template: 'modern' | 'minimal' | 'executive') => void;
  markSaved: () => void;
  loadFromText: (text: string) => void;
  resetToDefault: () => void;
}

export const useResumeBuilderStore = create<ResumeBuilderState>()(
  persist(
    (set, get) => ({
      resumeData: initialResumeData,
      activeTemplate: 'modern',
      hasUnsavedChanges: false,

      setResumeData: (data) => set({ resumeData: data, hasUnsavedChanges: true }),

      updatePersonalDetails: (details) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            personalDetails: { ...state.resumeData.personalDetails, ...details },
          },
          hasUnsavedChanges: true,
        })),

      updateSummary: (summary) =>
        set((state) => ({
          resumeData: { ...state.resumeData, summary },
          hasUnsavedChanges: true,
        })),

      addExperience: (exp) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: [exp, ...state.resumeData.experience],
          },
          hasUnsavedChanges: true,
        })),

      updateExperience: (id, exp) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.map((item) =>
              item.id === id ? { ...item, ...exp } : item
            ),
          },
          hasUnsavedChanges: true,
        })),

      removeExperience: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.filter((item) => item.id !== id),
          },
          hasUnsavedChanges: true,
        })),

      addEducation: (edu) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: [edu, ...state.resumeData.education],
          },
          hasUnsavedChanges: true,
        })),

      updateEducation: (id, edu) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.map((item) =>
              item.id === id ? { ...item, ...edu } : item
            ),
          },
          hasUnsavedChanges: true,
        })),

      removeEducation: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.filter((item) => item.id !== id),
          },
          hasUnsavedChanges: true,
        })),

      addProject: (proj) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: [proj, ...state.resumeData.projects],
          },
          hasUnsavedChanges: true,
        })),

      updateProject: (id, proj) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: state.resumeData.projects.map((item) =>
              item.id === id ? { ...item, ...proj } : item
            ),
          },
          hasUnsavedChanges: true,
        })),

      removeProject: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: state.resumeData.projects.filter((item) => item.id !== id),
          },
          hasUnsavedChanges: true,
        })),

      addCertification: (cert) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            certifications: [cert, ...state.resumeData.certifications],
          },
          hasUnsavedChanges: true,
        })),

      removeCertification: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            certifications: state.resumeData.certifications.filter((item) => item.id !== id),
          },
          hasUnsavedChanges: true,
        })),

      updateSkills: (skills) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: { ...state.resumeData.skills, ...skills },
          },
          hasUnsavedChanges: true,
        })),

      setActiveTemplate: (activeTemplate) => set({ activeTemplate }),

      markSaved: () => set({ hasUnsavedChanges: false }),

      loadFromText: (text) => {
        // Automatically populate summary and basic details from extracted text
        const state = get();
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        const nameGuess = lines[0]?.slice(0, 40) || state.resumeData.personalDetails.fullName;
        set({
          resumeData: {
            ...state.resumeData,
            personalDetails: {
              ...state.resumeData.personalDetails,
              fullName: nameGuess,
            },
            summary: text.slice(0, 600),
          },
          hasUnsavedChanges: true,
        });
      },

      resetToDefault: () => set({ resumeData: initialResumeData, hasUnsavedChanges: false }),
    }),
    {
      name: 'ats-resume-builder-data',
    }
  )
);
