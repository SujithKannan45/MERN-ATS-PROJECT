export class ResumeAnalysisPrompt {
  public static buildSystemInstruction(): string {
    return `You are a Principal Technical Recruiter, Enterprise ATS (Applicant Tracking System) Architect, and Expert Resume Reviewer.
Your role is to deeply analyze resumes against industry standards, ATS parsing algorithms, and optional target job descriptions.
You must provide objective, highly specific, actionable feedback with zero fluff or generic filler.

You must ALWAYS respond with a single, valid JSON object matching the requested schema strictly. Do not include markdown code block markers (like \`\`\`json) outside the valid JSON object.`;
  }

  public static buildUserPrompt(
    resumeText: string,
    targetJobTitle?: string,
    jobDescription?: string
  ): string {
    const jobContext = jobDescription
      ? `\nTARGET JOB TITLE: ${targetJobTitle || 'Not specified'}\nTARGET JOB DESCRIPTION:\n"""\n${jobDescription}\n"""`
      : `\nTARGET JOB TITLE: ${targetJobTitle || 'General Industry Benchmark'}\nTARGET JOB DESCRIPTION: No specific job description provided. Evaluate against top industry benchmarks for this candidate's career level and domain.`;

    return `Please perform an exhaustive, multi-dimensional ATS evaluation of the following resume text:

RESUME TEXT:
"""
${resumeText}
"""
${jobContext}

You must return a complete, valid JSON object strictly adhering to this structure:

{
  "atsScore": {
    "overallScore": <number 0-100, aggregate weighted score>,
    "breakdown": {
      "formatting": <number 0-100>,
      "keywords": <number 0-100>,
      "skills": <number 0-100>,
      "experience": <number 0-100>,
      "education": <number 0-100>,
      "readability": <number 0-100>
    }
  },
  "professionalSummary": "<concise 3-4 sentence high-impact professional summary of this candidate>",
  "strengths": {
    "technicalSkills": ["<strength 1>", "<strength 2>"],
    "softSkills": ["<strength 1>", "<strength 2>"],
    "relevantExperience": ["<strength 1>", "<strength 2>"],
    "certifications": ["<strength 1>"],
    "projects": ["<strength 1>"],
    "leadership": ["<strength 1>"]
  },
  "weaknesses": {
    "missingInformation": ["<weakness 1>"],
    "weakDescriptions": ["<weakness 1>"],
    "formattingIssues": ["<weakness 1>"],
    "missingAchievements": ["<weakness 1>"],
    "poorReadability": ["<weakness 1>"]
  },
  "missingSkills": {
    "technicalSkills": ["<missing technical skill 1>"],
    "softSkills": ["<missing soft skill 1>"],
    "tools": ["<missing tool 1>"],
    "certifications": ["<missing certification 1>"]
  },
  "jobMatch": {
    "matchPercentage": <number 0-100>,
    "matchingSkills": ["<matching skill 1>", "<matching skill 2>"],
    "missingSkills": ["<missing skill 1>", "<missing skill 2>"],
    "matchExplanation": "<detailed 2-3 sentence paragraph explaining candidate alignment with the role>"
  },
  "suggestions": {
    "atsCompatibility": ["<actionable recommendation 1>"],
    "contentQuality": ["<actionable recommendation 1>"],
    "formatting": ["<actionable recommendation 1>"],
    "experienceDescriptions": ["<actionable recommendation 1>"],
    "skills": ["<actionable recommendation 1>"],
    "projects": ["<actionable recommendation 1>"],
    "education": ["<actionable recommendation 1>"]
  },
  "keywordAnalysis": {
    "missingKeywords": ["<keyword 1>", "<keyword 2>"],
    "frequentlyUsedKeywords": ["<keyword 1>", "<keyword 2>"],
    "recommendedKeywords": ["<keyword 1>", "<keyword 2>"]
  },
  "sectionAnalysis": {
    "contact": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] },
    "summary": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] },
    "skills": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] },
    "experience": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] },
    "education": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] },
    "projects": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] },
    "certifications": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] },
    "achievements": { "score": <0-100>, "status": "<excellent|good|needs_improvement|critical>", "feedback": "<text>", "suggestions": ["<text>"] }
  },
  "experienceAnalysis": {
    "relevance": "<assessment of career relevance>",
    "impact": "<assessment of business/technical impact>",
    "actionVerbsUsage": "<assessment of active vs passive verb usage>",
    "quantifiedAchievements": ["<metric/accomplishment identified>", "<metric 2>"],
    "careerProgression": "<assessment of promotions, growth, responsibility expansion>"
  },
  "educationAnalysis": {
    "completeness": "<assessment of degree, dates, institutions>",
    "relevance": "<assessment of coursework/degree to target role>",
    "certifications": ["<certification analysis>"],
    "academicDetails": "<GPA/honors/relevant coursework comments>"
  },
  "grammarAndWriting": {
    "grammarMistakes": [
      { "error": "<specific phrase with error>", "correction": "<corrected text>", "context": "<surrounding sentence>" }
    ],
    "spellingMistakes": [
      { "error": "<misspelled word>", "correction": "<correct spelling>", "context": "<surrounding sentence>" }
    ],
    "passiveVoiceInstances": [
      { "instance": "<passive sentence>", "activeAlternative": "<strong active voice version>" }
    ],
    "weakWording": [
      { "weakWord": "<weak word like 'helped', 'worked on'>", "strongAlternative": "<impact verb like 'spearheaded', 'architected'>", "reason": "<explanation>" }
    ],
    "overallWritingQuality": "<summary assessment of tone, clarity, and conciseness>"
  }
}

Return ONLY the raw JSON object with no enclosing text or extra explanations.`;
  }
}
