# Luna 🌙

A calming, elegant, and intelligent cycle tracking application with personalized AI insights, fluid animations, and privacy-first architecture.

Live Deployment: [https://luna-track.netlify.app/](https://luna-track.netlify.app/)

---

## 🌟 Features

- **Personalized Cycle Tracking**: Automatically calculates current cycle phase (Period, Ovulation, PMS, Follicular/Safe days) and predictions.
- **Luna AI Health Companion**: Embedded AI assistant powered by Google Gemini 1.5 Flash to provide empathetic, evidence-based cycle analysis.
- **Adaptive Themes & Care Mode**: Includes Light, Soft Dark, and dynamic time-based Auto modes, plus a dedicated "Care Mode" with softened visuals and calming motion.
- **Heatmap Calendar & History Log**: Visual cycle calendar and searchable month-by-month history timeline.
- **Privacy & Security**: End-to-end data encryption with Supabase Row Level Security (RLS) and JSON data export capabilities.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Framer Motion, Lucide Icons, Vanilla CSS
- **Backend / Serverless**: Netlify Functions (`netlify/functions/`)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **Hosting**: Netlify

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your keys:
```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (Public) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key (Public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (Secret, Netlify Functions) |
| `GEMINI_API_KEY` | Your Google Gemini API key (Secret, Netlify Functions) |

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Netlify Deployment

1. Connect your repository to [Netlify](https://app.netlify.com).
2. Set Build Command to `npm run build` and Publish Directory to `dist`.
3. Configure Environment Variables in **Site Configuration → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
4. Netlify automatically deploys the frontend and serverless functions via `netlify.toml`.
