# AI-Powered ATS Resume Builder & Job Tracking Platform — Frontend

Production-ready modern Single Page Application (SPA) built with React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query, and Zustand.

---

## 🚀 Key Features

1. **Public SaaS Landing & Marketing**:
   - Modern hero section with dynamic ATS score and matching preview.
   - Interactive feature showcases for Resume Builder, AI ATS Analysis, and Job Pipeline.
   - Fully responsive public layout with theme toggle and mobile navigation drawer.

2. **Authentication & Session Security**:
   - JWT access token + HTTP-only refresh token rotation handling.
   - Automatic silent token refresh queue via Axios response interceptors.
   - State-preserving protected route redirects (`state: { from: location }`).
   - Email verification, password reset, and session management.

3. **Resume Management & Vault**:
   - Drag-and-drop upload for PDF, DOC, and DOCX files (5MB limit).
   - Real-time upload progress and Cloudinary asset management.
   - Live extracted text inspector, version history, and document replacement.

4. **Interactive Resume Builder**:
   - Multi-tab section editor (Personal Details, Summary, Experience, Education, Projects, Skills, Certifications).
   - Real-time preview with 3 recruiter-approved ATS templates (`Modern`, `Minimal`, `Executive`).
   - Unsaved changes browser guard (`beforeunload`).
   - Browser print stylesheet integration for instant PDF export.

5. **Gemini AI ATS Analysis**:
   - Direct integration with Google Gemini endpoints (`/api/v1/ai/analyze`).
   - Overall ATS score (0–100) and multidimensional breakdown (Keyword density, formatting, relevance).
   - Matched skills badges vs missing skills actionable chips.
   - Scan history with historical score inspection and deletion.

6. **Job Tracker & Kanban Pipeline**:
   - Dual view modes: Kanban pipeline stage board and tabular list view.
   - Comprehensive job metadata: company, role, workplace type, salary range, required skills, notes, and milestones.
   - Quick stage advancement buttons and status dropdowns.
   - Multi-field search, status filtering, priority filtering, and pagination.

7. **AI Resume-to-Job Matching**:
   - Semantic alignment analysis between candidate's active resume and target job requirements.
   - Overall match percentage, keyword score, ATS compatibility rating.
   - Matched competencies vs gap skills with direct links to optimize in Resume Builder.

8. **Analytics & Market Intelligence**:
   - Time-series monthly activity trends (applications vs resume uploads).
   - ATS score progression curve across evaluations.
   - Pipeline volume status distribution.
   - Market skill demand comparison (required skills vs candidate gaps).
   - Application recruitment funnel conversion analysis.

9. **Notifications & System Alerts**:
   - Central notifications hub with "All" and "Unread Only" filters.
   - Live unread notification count badge in sidebar and top header.
   - Automatic navigation linking to target job or resume upon click.
   - Mark individual as read, mark all as read, and delete actions.

10. **Profile & Settings**:
    - Candidate profile editor, contact information, career bio, and professional links.
    - Theme customizer: Light Mode, Dark Mode, System Preference.
    - Security settings with cryptographic password change.
    - Optional Bring-Your-Own-Key (BYOK) Google Gemini API key configuration.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript (~6.0)
- **Bundler & Tooling**: Vite 8 with HMR & code splitting
- **Styling**: Tailwind CSS + custom glassmorphic styling
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand (persisted state for auth, resume drafts, theme, UI)
- **Data Fetching & Cache**: TanStack React Query v5
- **Forms & Validation**: React Hook Form + Zod

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend` root based on `.env.example`:

```env
# Backend API Base URL (defaults to /api/v1 for reverse proxy)
VITE_API_URL=/api/v1
```

---

## 📦 Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Vite local development server on `http://localhost:5173` |
| **Production Build** | `npm run build` | Runs TypeScript compilation (`tsc -b`) and Vite production bundle |
| **Preview** | `npm run preview` | Previews the production build locally |
| **Linter** | `npm run lint` | Runs Oxlint linter checks across source code |

---

## 🚢 Production Deployment

### 1. Static Web Hosting (Vercel, Netlify, Cloudflare Pages)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- The `public/_redirects` and `vercel.json` files are preconfigured to route all SPA paths to `index.html`.

### 2. Docker / Nginx Static Serving
Configure Nginx to serve `dist/` with fallback routing:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
