# LMS Client

Student portal and admin dashboard for the Coaching LMS platform.

## Tech Stack

- **React 19** with Vite
- **React Router v7** — client-side routing
- **TanStack React Query** — server state & caching
- **Zustand** — auth state management
- **Axios** — HTTP client with token refresh interceptor
- **Tailwind CSS v4** — utility-first styling
- **Lucide React** — icons

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs on `http://localhost:5173`. The API base URL is set via `VITE_API_BASE_URL` in `.env`.

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview with `npm run preview`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API URL (include `/api` suffix), e.g. `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client ID for social login |

## Project Structure

```
src/
├── api/client.js          # Axios instance with auth interceptor
├── components/
│   ├── ui/                # shadcn-style primitives (button, input, card, etc.)
│   ├── AdminRoute.jsx     # Admin role guard
│   ├── EmptyState.jsx     # Reusable empty state display
│   ├── ErrorBoundary.jsx  # App-level crash fallback
│   ├── ProtectedRoute.jsx # Auth guard
│   └── Toast.jsx          # Toast notification context
├── layouts/
│   ├── AdminLayout.jsx    # Admin sidebar + header layout
│   └── StudentLayout.jsx  # Student portal layout
├── pages/
│   ├── admin/             # Admin dashboard pages
│   │   ├── AdminBatches.jsx
│   │   ├── AdminCourseContent.jsx
│   │   ├── AdminCourses.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminEnrollments.jsx
│   │   ├── AdminExams.jsx
│   │   ├── AdminLiveClasses.jsx
│   │   ├── AdminStudents.jsx
│   │   └── AdminSubjects.jsx
│   └── student/           # Student portal pages
│       ├── AddCourse.jsx
│       ├── Checkout.jsx
│       ├── Community.jsx
│       ├── CourseContent.jsx
│       ├── ExamView.jsx
│       ├── Exams.jsx
│       ├── LessonView.jsx
│       ├── MasterClass.jsx
│       ├── PastClasses.jsx
│       ├── Payments.jsx
│       ├── Performance.jsx
│       ├── PlaceholderPage.jsx
│       ├── QA.jsx
│       ├── SolveSheet.jsx
│       └── StudentDashboard.jsx
├── store/authStore.js     # Zustand auth store
├── App.jsx                # Route definitions
├── index.css              # Tailwind entry + custom styles
└── main.jsx               # App entry point
```

## Features

### Admin
- Dashboard with enrollment & course stats
- Student management (create, edit, deactivate, search)
- Batch management (create, edit, toggle active)
- Subject management (create, edit, soft-delete)
- Course CRUD with thumbnail upload
- Chapter & lesson management with drag-free reorder (up/down)
- Exam management with inline question editing
- Enrollment management with inline status & payment edits
- Live class scheduling

### Student
- Course catalog with class & category filters
- Enroll in programs
- View enrolled course content (chapters & lessons)
- Video & article lesson viewer
- Take exams (MCQ + written)
- View results with practice mode (correct answers + reference answers)
- Payment history & bKash payment modal
- Profile photo upload
- Past live classes
- Performance overview

## Deployment

Deploy on Vercel:

1. Push to GitHub
2. Import project in Vercel (Framework: Vite)
3. Set `VITE_API_BASE_URL` to production backend URL
4. Deploy

Update the server's `CLIENT_URL` env var to match the Vercel URL for CORS.
