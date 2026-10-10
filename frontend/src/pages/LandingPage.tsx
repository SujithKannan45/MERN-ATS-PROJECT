import * as React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Briefcase,
  TrendingUp,
  Brain,
  CheckCircle,
  ArrowRight,
  Shield,
  UploadCloud,
  FileCheck2,
  BarChart3,
  Search,
  Zap,
  Sliders,
  Award,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { staggerContainer, staggerItem } from '@/animations';

export function LandingPage() {
  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-16 md:pt-24 lg:pt-32 text-center container px-4 sm:px-8">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <motion.div variants={staggerItem}>
            <Badge variant="outline" className="px-3.5 py-1 text-xs gap-1.5 border-primary/30 bg-primary/5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Next-Generation AI ATS Resume Intelligence</span>
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={staggerItem}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
          >
            Optimize Your Resume for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              99% ATS Pass Rate
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            Leverage Google Gemini AI to analyze job descriptions, detect skill gaps, score keyword
            alignment, and track your interview pipeline from a single command center.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="gap-2 shadow-glow-primary">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="gap-2">
                Sign In to Platform
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-border/50 w-full max-w-3xl"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">94.8%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Average Match Accuracy</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">&lt; 3.2s</p>
              <p className="text-xs text-muted-foreground mt-0.5">AI Analysis Latency</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Applicant Privacy Protected</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">10x</p>
              <p className="text-xs text-muted-foreground mt-0.5">Faster Job Applications</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Four Comprehensive Pillars (Resume Builder, AI ATS Analysis, Job Tracking, Analytics) */}
      <section id="features" className="container px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="secondary">Engineered For High-Impact Candidates</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Complete Career Acceleration Suite
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Every feature is designed to beat automated recruiter screening and maximize interview callbacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Resume Builder */}
          <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle className="text-base">1. Intelligent Resume Vault</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Upload and version multiple resumes in PDF, DOC, and DOCX formats. Cloudinary asset storage ensures rapid downloads and text extraction.
              </p>
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-500/30">
                Multi-versioning
              </Badge>
            </CardContent>
          </Card>

          {/* Feature 2: AI ATS Analysis */}
          <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <CardTitle className="text-base">2. Gemini AI ATS Matcher</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Compare your resume against any job description. Receive instant 0-100% scoring, missing technical keywords, and actionable bullet rewrites.
              </p>
              <Badge variant="outline" className="text-xs text-purple-600 border-purple-500/30">
                Google Gemini API
              </Badge>
            </CardContent>
          </Card>

          {/* Feature 3: Job Tracking */}
          <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle className="text-base">3. Kanban Job Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Organize applications across Saved, Applied, Interview, Offer, and Rejected stages. Track deadlines, salaries, and interview logs.
              </p>
              <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-500/30">
                Pipeline Automation
              </Badge>
            </CardContent>
          </Card>

          {/* Feature 4: Analytics */}
          <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle className="text-base">4. Conversion Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Track application volume, conversion velocity, top missing skills across target roles, and monthly response trends with visual telemetry.
              </p>
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
                Actionable Insights
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Resume Analyzer Preview Section */}
      <section id="preview" className="container px-4 sm:px-8">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-6 md:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Description */}
            <div className="space-y-6">
              <Badge variant="info">Live ATS Scoring Preview</Badge>
              <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Beat the Automated Resume Screeners
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Most resumes are rejected by ATS systems (Workday, Greenhouse, Lever) before a human recruiter even sees them.
                Our scanner breaks down your match rate into keyword frequency, hard skills, soft skills, and section clarity.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Automated hard skill extraction (TypeScript, React, Node.js, MongoDB)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Instant tailored bullet point suggestions with impact verbs</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Cloudinary verified storage with instant encrypted streaming</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/register">
                  <Button className="gap-2">
                    Try Resume Scanner Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Interactive Mock Card */}
            <div className="rounded-xl border border-border bg-background p-6 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h4 className="font-semibold text-foreground">Senior Full Stack Engineer</h4>
                  <p className="text-xs text-muted-foreground">Target Role: Tech Innovations Corp</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-500">89%</span>
                  <p className="text-[11px] text-muted-foreground">ATS Match Score</p>
                </div>
              </div>

              {/* Match breakdown bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Required Tech Stack Match</span>
                    <span className="text-primary font-semibold">94%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Role Experience Relevance</span>
                    <span className="text-emerald-500 font-semibold">87%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Formatting & Parseability</span>
                    <span className="text-purple-500 font-semibold">98%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>

              {/* Detected Skills */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground">Identified Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="success">TypeScript</Badge>
                  <Badge variant="success">React</Badge>
                  <Badge variant="success">Node.js</Badge>
                  <Badge variant="success">Clean Architecture</Badge>
                  <Badge variant="success">REST APIs</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Job Application Pipeline Preview Section */}
      <section id="pipeline" className="container px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="secondary">Kanban Pipeline Preview</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            From Application to Offer Letter
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Never miss an interview follow-up or lose track of salary expectations again.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Saved (4)</span>
              <span className="h-2 w-2 rounded-full bg-slate-400" />
            </div>
            <div className="p-3 rounded-lg border border-border/80 bg-background space-y-1">
              <p className="text-xs font-bold text-foreground">Staff Infrastructure Engineer</p>
              <p className="text-[11px] text-muted-foreground">Stripe • Remote</p>
              <Badge variant="outline" className="text-[10px] py-0 mt-1">High Priority</Badge>
            </div>
            <div className="p-3 rounded-lg border border-border/80 bg-background space-y-1">
              <p className="text-xs font-bold text-foreground">Senior Frontend Developer</p>
              <p className="text-[11px] text-muted-foreground">Figma • San Francisco, CA</p>
              <Badge variant="outline" className="text-[10px] py-0 mt-1">Medium Priority</Badge>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Applied (6)</span>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <div className="p-3 rounded-lg border border-border/80 bg-background space-y-1">
              <p className="text-xs font-bold text-foreground">Principal React Architect</p>
              <p className="text-[11px] text-muted-foreground">Vercel • Applied 2d ago</p>
              <span className="inline-block text-[10px] font-semibold text-emerald-600">ATS Match: 94%</span>
            </div>
            <div className="p-3 rounded-lg border border-border/80 bg-background space-y-1">
              <p className="text-xs font-bold text-foreground">Backend Engineer (Node/Go)</p>
              <p className="text-[11px] text-muted-foreground">Datadog • Applied 4d ago</p>
              <span className="inline-block text-[10px] font-semibold text-emerald-600">ATS Match: 88%</span>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Interview (3)</span>
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
            </div>
            <div className="p-3 rounded-lg border border-border/80 bg-background space-y-1 ring-1 ring-indigo-500/30">
              <p className="text-xs font-bold text-foreground">Lead Full Stack Engineer</p>
              <p className="text-[11px] text-muted-foreground">GitHub • Round 2 Tech Screen</p>
              <Badge variant="info" className="text-[10px] py-0 mt-1">Tomorrow @ 2 PM</Badge>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Offers (2)</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <p className="text-xs font-bold text-foreground">Senior Systems Architect</p>
              <p className="text-[11px] text-muted-foreground">Supabase • $165k Base</p>
              <Badge variant="success" className="text-[10px] py-0 mt-1">Offer Accepted 🎉</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust & Value Proposition */}
      <section className="container px-4 sm:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto md:mx-0">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">100% Data Sovereignty</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your uploaded resumes are never used to train public LLM models. User-provided Gemini API keys are discarded immediately.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto md:mx-0">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">Instant Cloud Telemetry</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time MongoDB and Redis queues handle extraction and analysis without page freezing or timeouts.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto md:mx-0">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">Production Clean Code</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Architected following SOLID principles, clean modular architecture, and audited against enterprise security guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bottom CTA Section */}
      <section className="container px-4 sm:px-8 text-center">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-10 md:p-16 space-y-6 max-w-4xl mx-auto shadow-glow-primary">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Join candidates using AI-guided resume tailoring to bypass applicant tracking filters and secure high-paying roles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="gap-2 shadow-lg">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
