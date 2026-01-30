# Forge - A new way of building dashboards

![Dashboard Preview](/public/example_layout.png)

## Overview
Forge brings all your most important dashboards and tools into a single app, so you never have to juggle multiple websites or programs again. Track stock prices, check the weather, monitor GitHub activity, manage tasks, or write in Markdown—all from one place.

## Features
- **Customizable Dashboard**: Drag, drop, and resize widgets to create a layout that fits your workflow.
- **Multiple Dashboards**: Organize your widgets across multiple dashboards for different contexts.
- **12+ Widgets**: A wide range of widgets including Meetings, Inbox, GitHub, Todos, and more.
- **Real-time Updates**: Widgets like Stocks and Weather provide real-time information.
- **Theming**: Customize the look and feel of your dashboard with different themes.
- **Responsive Design**: Access your dashboard from any device, be it desktop, tablet, or mobile.
- **Self-Hosted**: Full control over your data by hosting Forge on your own infrastructure.
- **OAuth Integrations**: Connect to services like Google, GitHub, Notion, and Coinbase.

## Widgets
- **Meetings**: Connect your Google Account and see your next meetings
- **Inbox**: Connect your Gmail Account and see all your emails in one place
- **Stocks**: Real‑time prices, watchlists, and custom analyses
- **Weather**: Local forecasts and global weather maps
- **GitHub**: Browse repos, track issues & pull requests
- **Markdown Editor**: Draft notes, documentation, or blog posts inline
- **Bookmark**: Save all your favorite websites in one store to have them handy
- **Todo**: Manage your tasks and to-dos
- **Clock**: Keep track of time with a clock widget
- **Countdown**: See the time until a certain event is happening
- **GitHub Heatmap**: Visualize your GitHub contributions over time#
- **Kanban Board**: Organize tasks in a Kanban-style board

## Tech Stack
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Realtime Notifications**: Upstash Redis
- **ORM**: Drizzle
- **Formatter/Linter**: BiomeJS
- **Data Fetching**: React Query
- **Authentication**: BetterAuth
- **Validation**: Zod

## Self-Hosting

Forge is designed to be fully self-hostable. Here's how you can set up your own instance.

### Prerequisites

- Node.js (v18 or later recommended)
- A PostgreSQL database
- A Redis instance (e.g., Upstash)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mvriu5/forge.git
    cd forge
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and fill it with the necessary values. See the table below for a complete list of environment variables.

4.  **Run database migrations:**
    ```bash
    npx drizzle-kit push
    ```

5.  **Start the application:**
    ```bash
    npm run dev
    ```

### Environment Variables

| Variable                      | Description                                                                                                   | Required |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `NEXT_PUBLIC_APP_URL`         | The public URL of your application (e.g., `http://localhost:3000`).                                           | Yes      |
| `BETTER_AUTH_SECRET`          | A secret key for session encryption with BetterAuth. Generate a strong, random string.                        | Yes      |
| `BETTER_AUTH_URL`             | The full URL of your BetterAuth instance, which is your application's URL.                                    | Yes      |
| `DATABASE_URI`                | The connection string for your PostgreSQL database.                                                           | Yes      |
| `UPSTASH_REDIS_REST_URL`      | The REST URL for your Upstash Redis instance.                                                                 | Yes      |
| `UPSTASH_REDIS_REST_TOKEN`    | The access token for your Upstash Redis instance.                                                             | Yes      |
| `BLOB_READ_WRITE_TOKEN`       | A token for your blob storage solution (e.g., Vercel Blob). Needed for file uploads.                          | Yes      |
| `GITHUB_CLIENT_ID`            | The Client ID of your GitHub OAuth App for the GitHub widget integration.                                     | Optional |
| `GITHUB_CLIENT_SECRET`        | The Client Secret of your GitHub OAuth App.                                                                   | Optional |
| `GOOGLE_CLIENT_ID`            | The Client ID from your Google Cloud project for Google Calendar/Mail integration.                            | Optional |
| `GOOGLE_CLIENT_SECRET`        | The Client Secret from your Google Cloud project.                                                             | Optional |
| `NOTION_CLIENT_ID`            | The Client ID for your Notion integration.                                                                    | Optional |
| `NOTION_CLIENT_SECRET`        | The Client Secret for your Notion integration.                                                                | Optional |
| `COINBASE_CLIENT_ID`          | The Client ID for your Coinbase OAuth2 application for crypto widgets.                                        | Optional |
| `COINBASE_CLIENT_SECRET`      | The Client Secret for your Coinbase OAuth2 application.                                                       | Optional |

## Contributing
Have a bug report, feature request, or question? Please open an issue in this repository:  
<https://github.com/mvriu5/forge/issues>

## License
This project is licensed under the **MIT License**.

---

*Maintainer: [@mvriu5](https://github.com/mvriu5)*
