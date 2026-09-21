import { Types } from 'mongoose';

export const mockCandidateUser = {
  _id: new Types.ObjectId(),
  fullName: 'Jane Candidate',
  email: 'candidate@example.com',
  password: 'hashed_password_123',
  role: 'candidate',
  isEmailVerified: true,
  accountStatus: 'active',
  provider: 'local',
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdminUser = {
  _id: new Types.ObjectId(),
  fullName: 'Alice Admin',
  email: 'admin@example.com',
  password: 'hashed_password_456',
  role: 'admin',
  isEmailVerified: true,
  accountStatus: 'active',
  provider: 'local',
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockResumeData = {
  _id: new Types.ObjectId(),
  userId: mockCandidateUser._id,
  fileName: 'Jane_Candidate_Resume.pdf',
  fileType: 'pdf',
  mimeType: 'application/pdf',
  fileSize: 1024 * 250, // 250KB
  fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
  cloudinaryPublicId: 'ats_resumes/sample_123',
  extractedText: 'Jane Candidate. Experienced Software Engineer in Node.js, Express, React, TypeScript, and MongoDB with 5 years experience.',
  version: 1,
  fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockJobData = {
  _id: new Types.ObjectId(),
  userId: mockCandidateUser._id,
  companyName: 'Tech Innovations Corp',
  jobTitle: 'Senior Full Stack Developer',
  jobDescription: 'Seeking a talented full stack developer with expertise in TypeScript, React, Node.js, and cloud architectures.',
  jobUrl: 'https://careers.techinnovations.com/jobs/101',
  employmentType: 'Full-time',
  workplaceType: 'Remote',
  location: 'San Francisco, CA',
  salary: { min: 130000, max: 160000, currency: 'USD', period: 'yearly' },
  requiredSkills: ['TypeScript', 'Node.js', 'React', 'MongoDB'],
  status: 'Saved',
  priority: 'High',
  notes: 'Applied via referral',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockNotificationData = {
  _id: new Types.ObjectId(),
  userId: mockCandidateUser._id,
  title: 'Resume Uploaded Successfully',
  message: 'Your resume document has been parsed and is ready for ATS analysis.',
  type: 'RESUME_UPLOADED',
  isRead: false,
  data: { resumeId: mockResumeData._id.toString() },
  createdAt: new Date(),
  updatedAt: new Date(),
};
