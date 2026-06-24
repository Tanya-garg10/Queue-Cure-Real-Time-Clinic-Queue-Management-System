# 🏥 Queue Cure — Real-Time Clinic Queue Management System

> A smart, AI-powered clinic queue management system that eliminates patient waiting room chaos with real-time token tracking, intelligent wait time estimation, and a streamlined receptionist dashboard.

## ✨ Features

- 🎫 **Real-Time Token System** — Patients receive tokens and can track their position live
- ⏱️ **AI-Powered Wait Time Estimation** — Gemini AI predicts accurate wait times based on queue data
- 🖥️ **Receptionist Dashboard** — Manage patient flow, call next tokens, and update statuses
- 📊 **Analytics Section** — Visual insights into daily queue performance and patient load
- 👁️ **Patient View** — Clean interface for patients to monitor their turn
- 🔔 **Live Queue Updates** — Instant updates without page refresh
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Google Gemini API (`@google/genai`) |
| Charts | Recharts |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Build Tool | Vite |

## 🚀 Run Locally

### Prerequisites
- **Node.js** v18 or above
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tanya-garg10/Queue-Cure-Real-Time-Clinic-Queue-Management-System.git
   cd Queue-Cure-Real-Time-Clinic-Queue-Management-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY="your_actual_api_key_here"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open your browser and go to `http://localhost:5173`

## 📁 Project Structure

```
Queue-Cure/
├── src/
│   ├── components/
│   │   ├── Header.tsx            # App header with branding
│   │   ├── PatientView.tsx       # Patient-facing queue display
│   │   ├── ReceptionistView.tsx  # Admin/receptionist dashboard
│   │   ├── QueueListTable.tsx    # Queue table with status controls
│   │   ├── AnalyticsSection.tsx  # Charts and queue analytics
│   │   └── StatCard.tsx          # Reusable stat card component
│   ├── App.tsx                   # Root component & state management
│   ├── types.ts                  # TypeScript type definitions
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
├── server.ts                     # Express backend with Gemini API
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variable template
└── package.json                  # Project dependencies
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `APP_URL` | The URL where the app is hosted | Optional |

> ⚠️ **Never commit your `.env.local` file.** It is already listed in `.gitignore`.

## 👩‍💻 Author

**Tanya Garg**

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
