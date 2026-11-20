# NexaAI

**One Workspace. Smarter AI.**

NexaAI is a modern AI Tools Hub that brings eight Gemini-powered productivity tools into one professional SaaS-style workspace. It is designed as a portfolio-ready Next.js application with secure server-side AI integration, local history/usage tracking, and light/dark themes.

## Features

- **AI Chat** — multi-turn conversations with local conversation history
- **AI Writer** — blogs, articles, social posts, and more
- **Document Summarizer** — short, medium, and detailed summaries from pasted text
- **Translator** — multi-language translation with Auto Detect
- **Grammar Checker** — corrections, clarity improvements, and rewrite tones
- **Email Assistant** — purpose-driven email drafts with revise actions
- **Code Assistant** — explain, debug, improve, refactor, and generate (never executes code)
- **Resume & Cover Letter Builder** — honest drafts from user-supplied details only
- **History, Favorites & Usage** — browser-local activity tracking (not Gemini billing/quota)
- **Settings** — theme, AI defaults, profile, and data management

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Google Gen AI SDK (`@google/genai`)
- Lucide icons
- `react-markdown` for assistant/code output formatting

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and add your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey):

```bash
cp .env.example .env.local
```

Required values:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

Notes:

- Store the key only in `.env.local` (server-side).
- Never use a `NEXT_PUBLIC_` prefix for the API key.
- `.env.local` is gitignored and must not be committed.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build

```bash
npm run build
npm start
```

### Useful scripts

```bash
npm run lint
npm run build
npm run start
```

## Architecture Notes

- Chat requests go through `POST /api/chat`
- Tool requests go through `POST /api/tools`
- Gemini is called only on the server via `lib/gemini/*`
- Browser storage holds history, favorites, usage, preferences, and chat conversations locally
- Local usage metrics are informational only and are not official Gemini quota/billing data

## Deployment (Vercel)

1. Push the repository to GitHub/GitLab/Bitbucket (without `.env.local`).
2. Import the project in [Vercel](https://vercel.com/new).
3. Set environment variables in the Vercel project settings:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (recommended: `gemini-3.8-flash`)
4. Deploy. Vercel detects Next.js automatically; no special `vercel.json` is required for the default setup.
5. After deploy, open the site and verify Chat + one tool request succeed.

## Security

- API keys stay server-side.
- API routes validate payloads and return structured errors without stack traces.
- User content is rendered with React/`react-markdown` (no raw HTML plugin).
- Code Assistant never executes submitted code.

## License

Private project / portfolio demonstration.
