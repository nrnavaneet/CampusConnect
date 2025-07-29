# Campus Placement Portal

## Overview

This is a comprehensive campus placement portal designed to streamline the job application process for students and placement administration. The application is built with React/TypeScript frontend, Express.js backend, and uses PostgreSQL with Drizzle ORM for data management. The portal features student registration, job listings, application tracking, and grievance handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo architecture with clear separation between client and server code:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Radix UI primitives and Tailwind CSS
- **Authentication**: Session-based authentication with Passport.js
- **File Storage**: Supabase for resume uploads

## Key Components

### Frontend Architecture
- **Component Structure**: Organized into feature-based folders (auth, admin, student, grievance)
- **UI Components**: Comprehensive shadcn/ui component library in `/components/ui`
- **Routing**: Uses Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with dark/light theme support
- **Interactive Features**: Mouse trail effects, theme switching

### Backend Architecture
- **API Structure**: RESTful endpoints organized in `/server/routes.ts`
- **Database Layer**: Abstracted through storage interface in `/server/storage.ts`
- **Authentication**: Passport.js with local strategy for email/password authentication
- **Session Management**: Express sessions with PostgreSQL session store

### Database Schema
The database schema includes:
- **Users**: Authentication and role management (student/admin)
- **Student Details**: Comprehensive student profiles with academic information
- **Jobs**: Job postings with eligibility criteria
- **Applications**: Job application tracking with status management
- **Grievances**: Issue reporting and tracking system

### Authentication System
- **Student Registration**: Validates college email format (22xxxxx@domain.com)
- **Multi-step Registration**: Collects comprehensive student information
- **Role-based Access**: Separate dashboards for students and admins
- **Session Management**: Persistent login sessions

## Data Flow

1. **Student Registration**: Multi-step form collecting personal, academic, and contact information
2. **Job Discovery**: Students browse available positions with eligibility filtering
3. **Application Process**: Students apply to jobs with automatic eligibility checking
4. **Application Tracking**: Real-time status updates through application pipeline
5. **Admin Management**: Administrators manage job postings and review applications
6. **Grievance Handling**: Dedicated system for handling student complaints and issues

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web server framework
- **Drizzle ORM**: Type-safe database ORM for PostgreSQL
- **Neon Database**: PostgreSQL hosting service

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Authentication and Session Management
- **Passport.js**: Authentication middleware
- **express-session**: Session management
- **bcrypt**: Password hashing
- **connect-pg-simple**: PostgreSQL session store

### File Storage
- **Supabase**: Cloud storage for resume files
- Organized storage structure: `/placements/resumes/{branch}/{reg_no}.pdf`

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Backend bundling for production

## Deployment Strategy

The application is configured for deployment with:

- **Development**: `npm run dev` - Runs both frontend and backend in development mode
- **Build**: `npm run build` - Creates production builds for both client and server
- **Production**: `npm start` - Serves the built application
- **Database Migration**: `npm run db:push` - Applies schema changes to database

The build process creates:
- Static frontend assets in `/dist/public`
- Bundled server code in `/dist/index.js`
- Shared TypeScript types accessible to both client and server

The application supports both development and production environments with appropriate configuration for each, including Replit-specific development features and optimizations.