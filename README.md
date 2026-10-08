# Sprue Manager

Sprue Manager is a web application for miniature hobbyists who want to keep track of their collection, painting progress, hobby time and expenses in one place.

The project started as a small personal tool and is being developed progressively as a lightweight, browser-based hobby dashboard.

## Features

Sprue Manager currently allows users to:

- Manage a miniature collection
- Track the status of each miniature
- Filter the collection by game and status
- Record hobby expenses
- Track painting sessions and total painting time
- Monitor painting and budget statistics from the dashboard
- Use the application locally without creating an account
- Create an account and synchronize data across devices
- Sign in and sign out using Supabase authentication
- Recover and reset a forgotten password
- Migrate local guest data when creating a new account

## Guest mode

Sprue Manager can be used without an account.

In guest mode, data is stored locally in the browser using `localStorage`. This makes it possible to try and use the application without providing any personal information.

Creating an account enables cloud synchronization through Supabase.

## Tech stack

The project intentionally uses a lightweight stack:

- HTML
- CSS
- Vanilla JavaScript
- ES modules
- LocalStorage
- Supabase
  - Authentication
  - PostgreSQL
  - Row Level Security
- GitHub Pages

No frontend framework or build system is currently required.

## Data storage

Sprue Manager uses two persistence mechanisms:

**Guest users**

Data is stored locally in the browser.

**Authenticated users**

Application data is synchronized with Supabase and associated with the authenticated user.

Row Level Security policies ensure that authenticated users can only access their own application data.

## Project status

Sprue Manager is currently approaching its first stable version.

The current development focus is on:

- Authentication and UI polish
- Mobile usability
- End-to-end testing
- Code cleanup and stabilization

The next milestone is **v1.0.0**.

Future versions are expected to expand collection modelling, goals and hobby tracking while preserving the lightweight nature of the application.

## Live version

Sprue Manager is available on GitHub Pages:

https://sw3197.github.io/sprue-manager/

## Repository

Source code:

https://github.com/SW3197/sprue-manager

## Development

The application does not currently require a build step.

Clone the repository:

```bash
git clone https://github.com/SW3197/sprue-manager.git
```

Then serve the project through a local web server, such as VS Code Live Server.

Opening `index.html` directly through `file://` is not recommended because the application uses JavaScript ES modules.

## Security

Authentication and cloud persistence are handled through Supabase.

The frontend contains only the Supabase project URL and publishable key. Access to user data is protected server-side using PostgreSQL Row Level Security policies.

No service-role or other privileged Supabase credentials should be exposed in the frontend.

## License

No license has been specified for this project yet.
