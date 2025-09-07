# Ivaa AdSync Frontend

## Overview
Frontend dashboard application for Ivaa AdSync digital signage system. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Prerequisites
- Node.js 16+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```

Application will start on http://localhost:3000

## Features (Milestone 1)
- ✅ Login/Logout functionality
- ✅ Role-based routing (Admin/Owner)
- ✅ Admin Dashboard skeleton with navigation
- ✅ Owner Dashboard skeleton with navigation
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript support

## Dashboard Routes

### Admin Dashboard
- `/admin` - Main dashboard
- `/admin/shops` - Shop management
- `/admin/content` - Content approval
- `/admin/billing` - Billing overview
- `/admin/monitoring` - Live monitoring

### Owner Dashboard  
- `/owner` - Main dashboard
- `/owner/upload` - Content upload
- `/owner/screens` - Screen management
- `/owner/billing` - Billing & payments

## Authentication
- JWT token stored in localStorage
- Automatic redirection based on user role
- Route protection with role checking

## Default Test Users
After setting up backend:
- Admin: admin@ivaa.com / (set password)

## Build for Production
```bash
npm run build
npm start
```

## Project Structure
```
app/
├── admin/          # Admin dashboard pages
├── owner/          # Owner dashboard pages
├── login/          # Authentication
├── globals.css     # Global styles
└── layout.tsx      # Root layout

components/         # Reusable components (future)
lib/               # Utilities and configurations
```

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form (future)
- **State Management**: Zustand (future)

## Color Scheme (Ivaa Branding)
- Primary: `#6B46C1` (Purple)
- Secondary: `#9333EA` (Violet)
- Dark: `#1F2937` (Gray)
- Light: `#F3F4F6` (Light Gray)

## Development Notes
- Mobile-responsive design
- Clean component architecture
- TypeScript strict mode enabled
- ESLint configured for code quality