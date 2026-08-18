# Donkey's Timetable

A multi-user timetable app. Each user creates one or more named timetables shown
as a month calendar; clicking a date lets them add subjects (name, time, optional
note) for that day, fill in a recurring weekly schedule in bulk, and download a
single day as a PDF. An admin account can view every user's timetables read-only
and reset passwords.

## Tech stack

- Next.js 14 (App Router), JavaScript
- Tailwind CSS
- MongoDB Atlas via Mongoose
- Custom email/password auth: bcrypt password hashing, JWT in an httpOnly cookie
  (verified with `jose` so it also works in Edge middleware)
- `pdfkit` for server-side single-day PDF export

## Local setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — a MongoDB Atlas (or any reachable MongoDB) connection string
   - `JWT_SECRET` — a long random string
2. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000

## Creating an admin account

The very first account ever signed up (i.e. the first user created when the
`users` collection is empty) is automatically made an admin. Every account
after that signs up as a regular user.

To promote a later account to admin manually, set that user's `role` field
directly in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Deployment (Render)

See the project plan for full step-by-step instructions. Summary:

1. Create a free MongoDB Atlas cluster, DB user, and whitelist `0.0.0.0/0`.
2. Push this repo to GitHub.
3. On Render: **New → Web Service**, connect the repo.
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_VERSION=20`
4. Deploy. Render auto-redeploys on every push to the connected branch.
