# Tangle

Tangle is a social app with personalized feeds, user profiles, posts with media, comments, likes, bookmarks, notifications, and direct messages.

[Open Tangle](https://tangle.yusuprd.com)

## Local development

Use the Node.js version in `.nvmrc`. Copy `.env.example` to `.env` and fill in the development values for PostgreSQL, Google OAuth, UploadThing, and Stream Chat.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For an empty development database, run `npx prisma db push` before starting the app.

## Checks

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

After building, install Chromium with `npx playwright install chromium` and run `npm run test:e2e`.
