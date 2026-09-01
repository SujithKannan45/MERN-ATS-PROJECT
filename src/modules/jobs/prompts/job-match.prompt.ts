export class JobMatchPrompt {
  public static buildSystemInstruction(): string {
    return `You are a Principal AI Talent Matching Engine and Enterprise ATS Architect.
Your task is to perform an objective, deep semantic comparison between a candidate's resume and a target job opening.
You must assess skill overlaps, missing qualifications, experience alignment, education fit, and ATS keyword parsing compatibility.

You must ALWAYS respond with a single, valid JSON object matching the requested schema strictly. Do not enclose the output in markdown code blocks.`;
  }

  public static buildUserPrompt(
    resumeText: string,
    jobTitle: string,
    companyName: string,
    jobDescription: string,
    requiredSkills: string[] = []
  ): string {
    const skillsText =
      requiredSkills.length > 0
        ? `\nEXPLICIT REQUIRED SKILLS: ${requiredSkills.join(', ')}`
        : '';

    return `Please evaluate the following candidate resume against the target job posting:

TARGET JOB DETAILS:
Company: ${companyName}
Title: ${jobTitle}${skillsText}
Job Description:
"""
${jobDescription}
"""

CANDIDATE RESUME:
"""
${resumeText}
"""

You must return a valid JSON object matching this exact JSON specification:

{
  "overallMatchPercentage": <number 0-100, weighted composite score of skills, experience, and domain relevance>,
  "matchingSkills": ["<skill 1 from resume matching the job>", "<skill 2>"],
  "missingSkills": ["<important skill from job description not evident in resume>", "<skill 2>"],
  "matchingExperience": [
    "<specific experience/project from resume that directly proves suitability for this job>",
    "<another relevant experience point>"
  ],
  "missingExperience": [
    "<experience gap or domain knowledge expected in the job description that is missing in the resume>"
  ],
  "matchingEducation": [
    "<degree/coursework/certification from resume that satisfies or aligns with job requirements>"
  ],
  "keywordMatchScore": <number 0-100, ATS keyword density and alignment score>,
  "atsCompatibility": {
    "score": <number 0-100, formatting and keyword parsing probability>,
    "feedback": "<specific 1-2 sentence advice on tailoring this resume for this job's ATS parser>"
  },
  "matchExplanation": "<detailed 2-3 sentence assessment summarizing why the candidate is or is not a strong fit for this position>"
}

Return ONLY the raw JSON object.`;
  }
}
