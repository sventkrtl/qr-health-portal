# QR Health Portal

🏥 **AI-Powered Health Record Management** by Quantum Rishi (SV Enterprises)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sventkrtl/qr-health-portal)

## Features

- 🔐 **Secure Authentication** - Supabase Auth with email confirmation
- 📁 **Health Record Upload** - Support for PDFs, images, documents
- 🤖 **AI Health Assistant** - Chat powered by Ollama (local LLM)
- 📧 **Email Notifications** - Powered by Resend
- 🔒 **Row Level Security** - Your data stays private
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Ollama (local) with gemma2 model
- **Email**: Resend
- **Deployment**: Vercel + Cloudflare DNS
- **CI/CD**: GitHub Actions

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/sventkrtl/qr-health-portal.git
cd qr-health-portal
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase, Resend, and Ollama credentials.

### 4. Set up Supabase

Run the migration in your Supabase dashboard:

```sql
-- Copy contents of supabase/migrations/001_initial_schema.sql
```

### 5. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `OLLAMA_BASE_URL` | Ollama API URL (default: http://127.0.0.1:11434) |
| `OLLAMA_MODEL` | Ollama model name (default: gemma2) |
| `RESEND_API_KEY` | Resend API key for emails |
| `EMAIL_FROM` | From email address |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Cloudflare DNS

Add CNAME record:
```
health.quantum-rishi.com -> cname.vercel-dns.com
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Auth callbacks
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
├── lib/                   # Utilities
│   ├── email/            # Resend integration
│   ├── ollama/           # Ollama AI client
│   └── supabase/         # Supabase clients
└── types/                 # TypeScript types
```

## License

MIT © 2025 SV Enterprises (Quantum Rishi)

---

**Subdomain**: [health.quantum-rishi.com](https://health.quantum-rishi.com)