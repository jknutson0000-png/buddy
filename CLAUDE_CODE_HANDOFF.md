# Claude Code Handoff: Job Buddy

Project folder:

```text
C:\Users\jeffr\Desktop\comingle\adhd-handyman-task-app
```

Export zip:

```text
C:\Users\jeffr\Desktop\comingle\job-buddy-code-export-2026-04-16.zip
```

## What This Is

Job Buddy is a mobile-first task management app for handyman workers with ADHD.

The app helps with:

- Loud persistent reminders
- Multiple job timers
- Job-site location alerts
- Departure checklists
- Simple big-button mobile use

## Important Files

- `index.html` - main app page
- `styles.css` - visual design and mobile layout
- `app.js` - app behavior, timers, reminders, location, checklist, saved data
- `manifest.webmanifest` - phone install settings
- `service-worker.js` - offline/mobile app cache
- `assets/` - images and app icons
- `scripts/build-static.js` - copies app files into `dist`
- `dist/` - built app files
- `package.json` - build command
- `vercel.json` - Vercel deploy settings

## How To Run Locally

Use a local web server from this folder.

```powershell
python -m http.server 5177
```

Then open:

```text
http://127.0.0.1:5177/
```

## How To Build

Use:

```powershell
npm.cmd run build
```

This creates/updates the `dist` folder.

## Current Status

The app works as a browser prototype.

Tested:

- Mobile-size layout
- Timer display
- Departure checklist modal
- Arrival alert modal
- Browser console clean

## Known Limits

This is still a web app, not a true native phone app.

Important phone limits:

- Real background location alerts usually need a native iOS/Android app.
- Phone notifications and install work best from an HTTPS link.
- A temporary tunnel link only works while the local computer is awake.

## Best Next Improvements

Recommended order:

1. Improve mobile design even more.
2. Add a clearer "Today" screen.
3. Add job templates for common handyman jobs.
4. Add photo capture/checkoff items.
5. Turn it into a real mobile app if background location is required.

## User Preference

The user is not a coder.

Explain changes in simple language and keep answers short.

Use this format:

- What you did
- Why it matters
- What I need to do next

Do the work directly whenever possible.
