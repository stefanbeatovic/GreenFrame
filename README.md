# GreenFrame

GreenFrame is a calm, dark personal productivity workspace for keeping tasks, plans, lists, and daily priorities in one place.

**Live preview:** [stefanbeatovic.github.io/GreenFrame](https://stefanbeatovic.github.io/GreenFrame/)

## What GreenFrame does

GreenFrame is designed as a personal operating system rather than a basic checklist. The dashboard keeps the day visible without making the interface feel busy.

### Dashboard

- Live clock, date, greeting, and current week
- Daily progress indicator and weekly activity summary
- Compact front-page calendar with category-colored task dots
- Quick task entry from the dashboard

### Tasks

- Add, complete, edit, and delete tasks
- Assign tasks to lists such as Home, Studies, Shopping, Projects, or Inbox
- Set a task time and due date
- Move tasks between lists from the editor
- Keep completed tasks visible when reviewing a list
- Open a completed-only view when you want a clean history

### Lists

- Browse tasks by list
- Create custom lists
- Remove lists you no longer need
- See live task totals for each list
- Use category colors to scan the workspace quickly

### Calendar

- Full monthly calendar view
- Previous and next month navigation
- Today shortcut
- Color-coded task markers under their due dates
- Click a calendar task to toggle its completion state
- Edit a task's due date and see it move on the calendar

### Workspace tools

- Search tasks by title or list
- Notification center for daily task status
- Local profile and settings panel
- Responsive layout for desktop and mobile screens

## Local-first by design

GreenFrame currently stores tasks, lists, and profile details in the browser's local storage. This keeps the first version simple and private: no account or server is required to use it.

That also means data is currently tied to the browser and device where it was created. Clearing browser storage or switching devices will not carry the data across yet.

## Roadmap

- Real account registration and sign-in
- Cloud database and cross-device synchronization
- Task reminders and richer notifications
- Recurring tasks for chores and routines
- Subtasks, notes, tags, and attachments
- Drag-and-drop planning and additional task views
- Personal themes and dashboard customization

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

To preview the production build:

```bash
npm run build
npm run preview
```

## Deployment

The repository is configured to deploy automatically to GitHub Pages through [.github/workflows/deploy.yml](.github/workflows/deploy.yml). Every push to `main` builds the site and publishes the generated `dist` folder.

```bash
git add .
git commit -m "Describe the change"
git push
```

The live site is published at [stefanbeatovic.github.io/GreenFrame](https://stefanbeatovic.github.io/GreenFrame/).
