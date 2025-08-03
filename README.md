

# Hostel Management System

Modern, full-featured hostel management web application for universities and colleges. Built with React, TypeScript, Vite, shadcn-ui, and Tailwind CSS.

## Features

- Student registration and profile management
- Attendance tracking and leave requests
- Fee calculation and payment management
- Role-based access: Admin, Warden, Student, Monitor
- Request management and digital workflow
- Configurable hostel settings

## Technologies Used

- **React** (with TypeScript)
- **Vite** (fast build tool)
- **shadcn-ui** (UI components)
- **Tailwind CSS** (utility-first styling)
- **React Hook Form** & **Zod** (form validation)
- **TanStack React Query** (data fetching)
- **Radix UI** (accessible primitives)
- **Lucide Icons** (icon set)

## Getting Started

### Prerequisites
- Node.js & npm (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation
```sh
git clone <YOUR_GIT_URL>
cd hostel-management-system-frontend
npm install
```

### Development
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```sh
npm run build
```

### Linting
```sh
npm run lint
```

## Project Structure

- `src/pages/` — Main pages (Index, Login, Dashboard, Registration, Admin, Warden, Student, Monitor)
- `src/components/` — Reusable UI components
- `src/contexts/` — React context providers (e.g., Auth)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions and API logic
- `src/types/` — TypeScript types and interfaces

## Usage

- Register as a student, login, and access your dashboard
- Admins and wardens can manage students, payments, requests, and settings
- Monitors have additional privileges for routine approvals

## Contributing

Pull requests and suggestions are welcome! Please open an issue for major changes.

## License

MIT
