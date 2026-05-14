# Forge - A new way of building dashboards

![Dashboard Preview](/public/example_layout.png)

## Overview

Forge brings your most important dashboards and tools into a single self-hostable app, so you do not have to juggle multiple websites or programs. Track meetings and email, monitor GitHub activity, manage tasks, embed websites, follow crypto prices, check the weather, or write rich notes from one customizable workspace.

## Features

- **Customizable dashboards**: Drag, drop, and resize widgets to create layouts that match your workflow.
- **Multiple dashboards**: Organize widgets across separate contexts like work, personal, planning, or monitoring.
- **13 widgets**: Use Meetings, Inbox, GitHub, Todos, Kanban, Bookmarks, Crypto, Weather, and more.
- **Widget marketplace**: Search widgets by name, description, or tag, filter by category, and add them from one dialog.
- **Keyboard-friendly widget search**: Focus the search field, press `ArrowDown` to enter the results, and use arrow keys to move through widget cards.
- **Realtime notifications**: Receive and store user-scoped notification events through Upstash Redis and Realtime.
- **Theming**: Customize the dashboard experience with app themes.
- **Responsive design**: Use Forge from desktop, tablet, or mobile layouts.
- **Self-hosted**: Keep control over your data by hosting Forge on your own infrastructure.
- **OAuth integrations**: Connect services like Google, GitHub, Notion, and Coinbase where configured.

## Widgets

- **Meetings**: Connect your Google account and see upcoming meetings.
- **Inbox**: Connect Gmail and view email in one place.
- **Crypto**: Track Coinbase-backed crypto markets and price movement.
- **Weather**: View local forecasts.
- **GitHub**: Browse repositories, issues, and pull requests.
- **GitHub Heatmap**: Visualize GitHub contributions over time.
- **Markdown Editor**: Draft notes, documentation, or blog posts inline.
- **Bookmark**: Store favorite websites and quick links.
- **Todo**: Manage tasks and to-dos.
- **Kanban Board**: Organize tasks in a Kanban-style board.
- **Clock**: Keep track of the current time.
- **Countdown**: Count down to a future event.
- **Frame**: Embed content from another website in an iframe.

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Realtime Notifications**: Upstash Redis and Upstash Realtime
- **ORM**: Drizzle
- **Formatter/Linter**: Biome
- **Data Fetching**: React Query
- **Authentication**: BetterAuth
- **Validation**: Zod
- **API Reference**: Scalar

## Self-Hosting

Forge is designed to be fully self-hostable. Here's how you can set up your own instance.

### Prerequisites

- Node.js v18 or later
- A PostgreSQL database
- A Redis instance, for example Upstash Redis
- Optional OAuth applications for GitHub, Google, Notion, and Coinbase integrations

### Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/mvriu5/forge.git
    cd forge
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root of the project and fill it with the necessary values. See the table below for the supported environment variables.

4. **Run database migrations:**

    ```bash
    npx drizzle-kit push
    ```

5. **Start the application:**

    ```bash
    npm run dev
    ```

6. **Open Forge:**

    Visit the URL configured in `NEXT_PUBLIC_APP_URL`, usually `http://localhost:3000` during local development.

### Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | The public URL of your application, for example `http://localhost:3000`. | Yes |
| `BETTER_AUTH_SECRET` | Secret key for session encryption with BetterAuth. Generate a strong random string. | Yes |
| `BETTER_AUTH_URL` | Full BetterAuth URL, usually the same base URL as the application. | Yes |
| `DATABASE_URI` | PostgreSQL connection string. | Yes |
| `UPSTASH_REDIS_REST_URL` | REST URL for your Upstash Redis instance. | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Access token for your Upstash Redis instance. | Yes |
| `BLOB_READ_WRITE_TOKEN` | Token for your blob storage solution, for example Vercel Blob. Needed for file uploads. | Yes |
| `GITHUB_CLIENT_ID` | Client ID for the GitHub OAuth app used by GitHub widgets. | Optional |
| `GITHUB_CLIENT_SECRET` | Client secret for the GitHub OAuth app. | Optional |
| `GOOGLE_CLIENT_ID` | Client ID from Google Cloud for Calendar and Gmail integrations. | Optional |
| `GOOGLE_CLIENT_SECRET` | Client secret from Google Cloud. | Optional |
| `NOTION_CLIENT_ID` | Client ID for your Notion integration. | Optional |
| `NOTION_CLIENT_SECRET` | Client secret for your Notion integration. | Optional |
| `COINBASE_CLIENT_ID` | Client ID for your Coinbase OAuth2 application for crypto widgets. | Optional |
| `COINBASE_CLIENT_SECRET` | Client secret for your Coinbase OAuth2 application. | Optional |

## Development

Useful commands:

```bash
npm run dev        # Start the Next.js dev server
npm run build      # Create a production build
npm run typecheck  # Run TypeScript checks without emitting files
npm run lint       # Run Biome linting
npm run format     # Format files with Biome
npm run check      # Run Biome formatting/lint checks
```

## API Reference

Forge serves an interactive Scalar API reference at `/reference`. The reference reads its OpenAPI document from `/openapi.json`, so keep `public/openapi.json` in sync whenever API routes are added or changed.

During local development, start the app and open:

```text
http://localhost:3000/reference
```

## Contributing

Have a bug report, feature request, or question? Please open an issue in this repository:
<https://github.com/mvriu5/forge/issues>

## License

This project is licensed under the **MIT License**.

---

*Maintainer: [@mvriu5](https://github.com/mvriu5)*
