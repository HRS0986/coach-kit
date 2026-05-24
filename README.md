# CoachKit

CoachKit is a Next.js web application designed for personal trainers and fitness coaches to streamline the creation of workout schedules. It transforms messy, unstructured text or client messages into beautifully formatted, ready-to-share PDF workout programs with the power of AI.

## 🚀 Features

- **AI-Powered Parsing**: Uses Google Gemini to intelligently parse unstructured workout texts and convert them into structured JSON schedules.
- **Interactive Schedule Editor**: Refine and adjust the generated workouts using a drag-and-drop interface powered by `@dnd-kit`.
- **PDF Generation**: Instantly export schedules to professional, clean PDF documents using `jspdf` and `jspdf-autotable`.
- **Secure Authentication**: Restricts access via Firebase Authentication (Google Sign-In) to authorized users only.
- **Modern UI**: Fast and beautiful interface built with React 19, Next.js App Router, Tailwind CSS 4, and shadcn/ui.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI/Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini Models)
- **Authentication**: [Firebase Auth](https://firebase.google.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

## 📝 Prerequisites

To run this project locally, you will need:
- Node.js (v20 or newer recommended)
- A Google Gemini API key
- A Firebase project configured for Google Authentication

## ⚙️ Getting Started

1. **Clone the repository** (or download the source):
   ```bash
   git clone <repository-url>
   cd coach-kit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory and add the following keys:
   ```env
   # Firebase configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   # Google Gemini AI Key
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *Note: Modify `ALLOWED_EMAILS` in `lib/auth-context.tsx` to include your email for authorized access if applicable.*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Usage

1. **Log in** using an authorized Google account.
2. Navigate to the **Dashboard**.
3. **Paste** a rough text description of a workout schedule into the provided input area.
4. Let the **AI parse** the instructions into organized days, sets, and reps.
5. **Review and adjust** the schedule in the interactive editor.
6. Click **Generate PDF** to export and share the finalized workout program with your clients.

