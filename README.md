# Tangle Social Media App

Tangle is a modern, full-featured social media platform built with Next.js 15 and an array of powerful technologies. It provides a rich user experience, optimized performance, and real-time interactivity.

## Features

- **User Authentication**: Secure username/password authentication with Google OAuth2 (Lucia).
- **Dynamic Social Interactions**:
  - Like, follow, comment, and bookmarking systems.
  - Real-time notifications and a direct messaging system (powered by Stream).
- **Content Creation**:
  - Drag & drop and copy-paste support for media uploads (UploadThing).
  - Tiptap editor for rich text editing.
  - Supports hashtags, mentions, and full-text search.
- **Advanced UI & UX**:
  - Infinite scrolling feeds with optimistic updates for seamless experience.
  - Mobile-responsive layout, dark/light/system themes with Tailwind CSS & Shadcn UI.
  - Real-time form validation using React Hook Form and Zod.
- **Server Actions**: Utilize Next.js server actions and components for high efficiency and seamless data fetching.
- **Data Management**: 
  - Postgres DB with Prisma ORM.
  - TanStack React Query for advanced caching, data fetching, and revalidation.
- **Media Management**: 
  - User profile avatars with cropping and resizing.
  - Cron job to delete orphaned uploads (Vercel).

---

## Technologies Used

- **Frontend**: Next.js 15, Tailwind CSS, Shadcn UI components, TanStack React Query, React Hook Form, Zod, TipTap editor.
- **Backend**: Next.js Server Actions and Server Components, Prisma ORM, Postgres DB.
- **Authentication**: Lucia (username/password & Google OAuth2).
- **Real-time Features**: Stream Chat for DM system.
- **Media Handling**: UploadThing (drag & drop, copy-paste uploads).
- **Hosting and Deployment**: Vercel with a custom cron job for periodic maintenance.
