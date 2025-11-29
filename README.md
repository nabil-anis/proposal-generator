
# JobGenie — Your wish is one proposal away

An AI-powered web application designed to help freelancers craft high-converting, personalized Upwork proposals in seconds. Built with a focus on "Apple-like" aesthetics, privacy, and professional utility.

![App Screenshot](/jobgenie-bg.png)

## 🚀 Features

-   **AI-Powered Generation**: Uses Google's Gemini 2.5 Flash model to analyze job descriptions and generate winning proposals.
-   **Strict Frameworks**: Adheres to proven "Consultative Narrative" and "Action Plan" formats to ensure quality.
-   **Model Training (Few-Shot Prompting)**: Users can "train" the AI by providing custom instructions and examples of their previous winning proposals.
-   **Cross-Device Sync**: Integrates with Supabase Auth & Database to sync training data across devices (optional).
-   **History**: Automatically saves generated proposals to a history sidebar for easy retrieval.
-   **Apple-Inspired UI**: Features premium glassmorphism, smooth physics-based animations, and dark mode support.
-   **Mobile Optimized**: Responsive design with a floating navigation bar and touch-friendly interactions.
-   **Privacy Focused**: Proposals are generated on demand; training data is stored locally first, then synced to the cloud only if logged in.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS (with custom Glassmorphism utilities)
-   **AI**: Google Gemini API (@google/genai)
-   **Backend/Auth**: Supabase (PostgreSQL, Auth)
-   **Build/Deploy**: Vercel

## ⚙️ Setup & Installation

### 1. Environment Variables
Create a `.env` file in the root directory (or configure in your deployment platform):

```env
# Google Gemini API Key
API_KEY=your_gemini_api_key_here
```

### 2. Supabase Configuration (Optional)
To enable cross-device sync and history, you need a Supabase project.

1.  **Create a Project**: Go to [Supabase](https://supabase.com) and create a new project.
2.  **Run SQL Setup**: Execute the following SQL in your Supabase SQL Editor to create the necessary tables and security policies:

```sql
-- 1. Create the table to store training data
create table public.training_data (
  user_id uuid references auth.users not null primary key,
  custom_instructions text default '',
  examples jsonb default '[]'::jsonb,
  is_locked boolean default false,
  api_config jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for training_data
alter table public.training_data enable row level security;

-- Policies for training_data
create policy "Users can view their own data" 
  on public.training_data for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own data" 
  on public.training_data for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own data" 
  on public.training_data for update 
  using (auth.uid() = user_id);

-- 2. Create the table to store proposal history
create table public.proposals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  job_description text not null,
  proposal_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for proposals
alter table public.proposals enable row level security;

-- Policies for proposals
create policy "Users can view their own proposals"
  on public.proposals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own proposals"
  on public.proposals for insert
  with check (auth.uid() = user_id);
```

3.  **Update Constants**: Open `constants.ts` and replace the placeholder values with your project details:

```typescript
export const SUPABASE_URL = "https://your-project-id.supabase.co";
export const SUPABASE_ANON_KEY = "your-anon-key";
```

### 3. Run Locally
If you are using a standard React build setup (e.g., Vite/CRA):

```bash
npm install
npm start
```

*Note: This project structure is designed for a direct-to-Vercel drop, but works with standard tooling.*

## 📖 Usage Guide

1.  **Paste Job Description**: Copy the client's post from Upwork and paste it into the main text area.
2.  **Add Instructions (Optional)**: Open the "Additional Instructions" tab to add specific details for *this* proposal (e.g., "Mention my React certification").
3.  **Customize/Train**: Click the **Customize** button in the navbar to:
    *   Set global "System Instructions" (e.g., "Always sound casual").
    *   Add "Winning Examples" to the library so the AI mimics your voice.
4.  **Generate**: Click "Generate".
5.  **Review & Copy**: The result appears in a polished window. Click "Copy" and paste it into Upwork.
6.  **History**: Click the History icon in the navbar to view and restore past proposals.

## 🎨 Theme System

The app defaults to **Light Mode** but respects user toggles.
-   **Dark Mode**: Deep charcoal/zinc palette (`#09090b`) with high-contrast text.
-   **Light Mode**: Clean white/gray palette (`#fafafa`).
-   **Glassmorphism**: Uses a custom `.glass-panel` CSS class that adapts blur and opacity based on the active theme.

## 📄 License

This project is open-source. Feel free to fork and modify.
