# Shelter of Light (SoL) Web Platform

A comprehensive digital platform for pet adoption and shelter management. This application provides a seamless public-facing interface for potential adopters to view animals and donate, alongside a secure, authenticated admin dashboard for shelter staff to manage inventory and applications.

## 🏗️ Architecture & Tech Stack

This project is built with a modern, full-stack JavaScript ecosystem.

* **Framework:** [Next.js](https://nextjs.org/) (App Router architecture)
* **Language:** TypeScript (`tsconfig.json`)
* **Styling:** Tailwind CSS (`tailwind.config.ts`, `postcss.config.mjs`)
* **Backend / Database / Auth:** Supabase (`src/lib/supabase/client.ts`, `server.ts`)
* **Emails:** Custom email action integrations (`src/app/actions/email.ts`)

## 📂 Project Structure

The codebase utilizes Next.js Route Groups to separate public pages from the secure staff portal cleanly. All main development happens inside the `sol-platform` directory.

### Core Directories
* `src/app/(public)/`: Contains all client-facing pages.
    * `/adopt`: Animal gallery and individual animal profiles.
    * `/adopt/[id]/apply`: Adoption application forms.
    * `/donate`: Donation page supporting multiple payment methods.
    * `/about`: Information about the shelter.
* `src/app/(admin)/`: Contains the secure staff portal.
    * `/dashboard`: High-level overview and metrics.
    * `/animals`: Inventory management (Create, Read, Update, Delete records).
    * `/adoptions` & `/applications`: Application tracking and processing.
* `src/app/login/` & `/reset-password`: Authentication routes.
* `src/components/`: Reusable UI components, split into `/admin` and `/public` directories.
* `src/services/`: Backend logic, such as data fetching (`animals.ts`).
* `public/`: Static assets like logos and payment QR codes (GCash, Maya, PayPal).

## 🚀 Getting Started

Follow these steps to run the development server on your local machine.

### Prerequisites
* Node.js installed (v18 or higher recommended).
* A Supabase account with an active project.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Shelter-Of-Light-Web.git

2. **Navigate to the working directory:**
   ```bash
   cd Shelter-Of-Light-Web/sol-platform

3. **Install dependencies:**
   ```bash
   npm install

4. **Configure Environment Variables:**
   Create a `.env.local` file in the root of the `sol-platform` folder and add your specific connection strings:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key

5. **Start the development server:**
   ```bash
   npm run dev

6. **View the application:**
   Open http://localhost:3000 in your browser to see the public site. To access the admin interface, navigate to http://localhost:3000/login.
