# Secure Web App

A full-stack web application built with Next.js that implements role-based access control and secure file upload functionality. This project was created to demonstrate modern web development practices with a focus on security and user management.

## What This App Does

This application provides a secure dashboard where users can:

- **Upload and manage files** with real-time progress tracking
- **View user activities** and system statistics  
- **Manage user roles and permissions** (if you're an admin)
- **Access different features** based on your assigned role

The app uses Clerk for authentication and implements a custom RBAC system with 5 different user roles: SuperAdmin, Admin, Manager, User, and Guest.

## Features

### File Upload System
- Drag & drop file uploads with progress bars
- Support for images (JPG, PNG), JSON, and CSV files
- File validation and basic security scanning
- File management with download/delete options

### User Management
- Role-based access to different features
- User role assignment and management
- Activity logging for all user actions
- Dashboard with statistics and recent activity

### Security Features
- Authentication handled by Clerk
- Permission-based API endpoints
- File upload validation and scanning
- Complete audit trail of user actions

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with ShadCN/UI components
- **Authentication**: Clerk (handles sign-up, sign-in, user management)
- **Database**: MySQL with Prisma ORM
- **File Storage**: Local storage for development, Cloudinary for production
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites
- Node.js 18 or higher
- MySQL database (I used Railway for the free tier)
- Clerk account (free tier works fine)

### Installation

1. Clone the repository and install dependencies:
```bash
git clone <your-repo-url>
cd secure-web-app
npm install
```

2. Set up your environment variables in `.env.local`:
```env
# Database
DATABASE_URL="mysql://username:password@host:port/database"

# Clerk Authentication  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Cloudinary (optional for production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── api/               # API routes
│   │   ├── upload/        # File upload endpoint
│   │   ├── users/         # User management
│   │   ├── roles/         # Role management  
│   │   ├── files/         # File operations
│   │   └── activity/      # Activity logs
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/               # ShadCN/UI components
│   ├── dashboard/        # Dashboard components
│   ├── upload/           # File upload components
│   ├── users/            # User management
│   ├── roles/            # Role management
│   └── activity/         # Activity logging
└── lib/                  # Utilities
    ├── prisma.ts         # Database client
    ├── rbac.ts          # Role-based access control
    ├── file-upload.ts   # File upload utilities
    └── storage.ts       # Storage abstraction
```

## User Roles

The app implements 5 user roles with different permissions:

- **SuperAdmin**: Full system access, can do everything
- **Admin**: Can manage users and roles, full file access
- **Manager**: Can view users and manage files, access activity logs
- **User**: Can upload and view files, access dashboard
- **Guest**: Can only view the dashboard

## API Endpoints

- `POST /api/upload` - Upload files (requires authentication)
- `GET /api/users` - Get users (requires admin permissions)
- `GET /api/roles` - Get roles (requires admin permissions)
- `GET /api/files` - Get uploaded files
- `GET /api/activity` - Get activity logs (requires manager+ permissions)

All endpoints are protected by Clerk authentication and role-based permissions.

## Database Schema

The app uses MySQL with these main tables:
- `users` - User accounts linked to Clerk
- `roles` - Role definitions with permissions
- `file_uploads` - Uploaded files with metadata
- `activity_logs` - Audit trail of user actions

## Development

### Database Commands
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:seed        # Seed with initial data
npm run db:studio      # Open Prisma Studio
```

### Building for Production
```bash
npm run build
npm start
```

## Deployment

I deployed this to Vercel. You'll need to:
1. Set up environment variables in Vercel dashboard
2. Make sure your database is accessible from production
3. Configure Cloudinary for file storage in production

## Notes

- The file upload system stores files locally during development and uses Cloudinary in production
- All user actions are logged in the activity_logs table for audit purposes
- The RBAC system is implemented in the `rbac.ts` file and used throughout the app
- Clerk handles all authentication, so no need to build login/signup forms

## License

MIT License