import * as React from 'react';
import type { ResumeData } from '@/stores/resume-builder.store';

interface ResumePreviewProps {
  data: ResumeData;
  template?: 'modern' | 'minimal' | 'executive';
}

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, template = 'modern' }, ref) => {
    const { personalDetails, summary, experience, education, skills, projects, certifications } = data;

    if (template === 'minimal') {
      return (
        <div
          ref={ref}
          id="resume-print-area"
          className="w-full bg-white text-slate-900 p-8 sm:p-12 shadow-md rounded-md font-sans text-sm leading-relaxed max-w-[800px] mx-auto border border-slate-200"
          style={{ minHeight: '1050px' }}
        >
          {/* Header */}
          <div className="border-b border-slate-300 pb-4 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase">
              {personalDetails.fullName || 'Your Name'}
            </h1>
            <p className="text-base text-slate-600 font-medium">{personalDetails.jobTitle}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
              {personalDetails.email && <span>{personalDetails.email}</span>}
              {personalDetails.phone && <span>{personalDetails.phone}</span>}
              {personalDetails.location && <span>{personalDetails.location}</span>}
              {personalDetails.linkedinUrl && <span>{personalDetails.linkedinUrl}</span>}
              {personalDetails.githubUrl && <span>{personalDetails.githubUrl}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {summary && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Professional Summary
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-900 text-sm">{exp.role}</span>
                      <span className="text-xs text-slate-500">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mb-1.5">
                      {exp.company} {exp.location ? `• ${exp.location}` : ''}
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-900 text-sm">
                        {edu.degree} in {edu.fieldOfStudy}
                      </span>
                      <span className="text-xs text-slate-500">
                        {edu.startDate} – {edu.endDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {edu.institution} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {(skills.technical.length > 0 || skills.tools.length > 0) && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Core Competencies
              </h2>
              <div className="text-xs text-slate-700 space-y-1">
                {skills.technical.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-900">Technical Skills: </span>
                    {skills.technical.join(', ')}
                  </div>
                )}
                {skills.tools.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-900">Technologies & Tools: </span>
                    {skills.tools.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (template === 'executive') {
      return (
        <div
          ref={ref}
          id="resume-print-area"
          className="w-full bg-white text-slate-900 p-8 sm:p-12 shadow-md rounded-md font-serif text-sm leading-relaxed max-w-[800px] mx-auto border border-slate-200"
          style={{ minHeight: '1050px' }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5 mb-6">
            <h1 className="text-3xl font-bold tracking-wide text-slate-900">
              {personalDetails.fullName || 'Your Name'}
            </h1>
            <p className="text-sm font-sans uppercase tracking-widest text-slate-600 mt-1 font-semibold">
              {personalDetails.jobTitle}
            </p>
            <div className="flex justify-center flex-wrap gap-3 font-sans text-xs text-slate-500 mt-2">
              {personalDetails.email && <span>{personalDetails.email}</span>}
              {personalDetails.phone && <span>• {personalDetails.phone}</span>}
              {personalDetails.location && <span>• {personalDetails.location}</span>}
              {personalDetails.linkedinUrl && <span>• {personalDetails.linkedinUrl}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mb-6">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 mb-2">
                Executive Profile
              </h2>
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 mb-3">
                Leadership & Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline font-sans">
                      <span className="font-bold text-slate-950 text-sm">{exp.role}</span>
                      <span className="text-xs text-slate-600 italic">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mb-1">
                      {exp.company} {exp.location ? `, ${exp.location}` : ''}
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-800">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 mb-3">
                Key Initiatives & Projects
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline font-sans">
                      <span className="font-bold text-slate-950 text-xs sm:text-sm">{proj.name}</span>
                      <span className="text-[11px] text-slate-500 italic">{proj.technologies}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Certs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {education.length > 0 && (
              <div>
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 mb-2">
                  Education
                </h2>
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs text-slate-800">
                    <p className="font-bold">{edu.institution}</p>
                    <p>{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-slate-500">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            )}
            {skills.technical.length > 0 && (
              <div>
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1 mb-2">
                  Core Skills
                </h2>
                <p className="text-xs text-slate-800">{skills.technical.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default: 'modern' template
    return (
      <div
        ref={ref}
        id="resume-print-area"
        className="w-full bg-white text-slate-900 p-8 sm:p-12 shadow-lg rounded-md font-sans text-sm leading-relaxed max-w-[800px] mx-auto border border-slate-200"
        style={{ minHeight: '1050px' }}
      >
        {/* Modern Accent Header */}
        <div className="border-l-4 border-blue-600 pl-4 py-1 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            {personalDetails.fullName || 'Your Name'}
          </h1>
          <p className="text-base text-blue-600 font-semibold">{personalDetails.jobTitle}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
            {personalDetails.email && <span>{personalDetails.email}</span>}
            {personalDetails.phone && <span>• {personalDetails.phone}</span>}
            {personalDetails.location && <span>• {personalDetails.location}</span>}
            {personalDetails.linkedinUrl && <span>• {personalDetails.linkedinUrl}</span>}
            {personalDetails.githubUrl && <span>• {personalDetails.githubUrl}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-3">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 font-semibold mb-1">
                    {exp.company} {exp.location ? `• ${exp.location}` : ''}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-3">
              Featured Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{proj.name}</span>
                    <span className="text-[11px] text-blue-600 font-medium">{proj.technologies}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-600 mt-1">
                      {proj.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certifications Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="text-xs text-slate-800">
                  <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-600">{edu.institution}</p>
                  <p className="text-[11px] text-slate-500">{edu.startDate} – {edu.endDate} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}</p>
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
                Certifications
              </h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="text-xs text-slate-800 mb-1">
                  <p className="font-semibold text-slate-900">{cert.name}</p>
                  <p className="text-[11px] text-slate-600">{cert.issuer} • {cert.issueDate}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        {(skills.technical.length > 0 || skills.tools.length > 0 || skills.soft.length > 0) && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
              Skills & Proficiencies
            </h2>
            <div className="text-xs text-slate-700 space-y-1">
              {skills.technical.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900">Technical Skills: </span>
                  {skills.technical.join(', ')}
                </div>
              )}
              {skills.tools.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900">Developer Tools: </span>
                  {skills.tools.join(', ')}
                </div>
              )}
              {skills.soft.length > 0 && (
                <div>
                  <span className="font-bold text-slate-900">Leadership & Soft Skills: </span>
                  {skills.soft.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
ResumePreview.displayName = 'ResumePreview';
