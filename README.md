# Pocket Money

A simple mobile-first web app for tracking pocket money for kids. Each kid has an account with a running balance. You can record income (chores, pocket money) and expenses (purchases, cash payouts), and delete transactions if you make a mistake.

Built with Cloudflare Pages, Pages Functions, and D1 (SQLite). Access is protected by Cloudflare Access — no passwords to manage.

## Deployment

### Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Node.js](https://nodejs.org) installed

### 1. Install Wrangler

```
npm install -g wrangler
wrangler login
```

### 2. Create the D1 database

```
wrangler d1 create zsebcredit
```

Copy the `database_id` from the output and paste it into `wrangler.toml`, replacing `YOUR_D1_DATABASE_ID`.

### 3. Apply the schema

```
wrangler d1 execute zsebcredit --file=schema.sql
```

### 4. Deploy to Cloudflare Pages

```
wrangler pages deploy public --project-name=zsebcredit
```

The first run will prompt you to create the Pages project — confirm it.

### 5. Bind D1 to the Pages project

In the Cloudflare dashboard: **Pages → zsebcredit → Settings → Functions → D1 database bindings**

Add a binding with variable name `DB` pointing to your `zsebcredit` database, then redeploy:

```
wrangler pages deploy public --project-name=zsebcredit
```

### 6. Set up Cloudflare Access

In the Cloudflare dashboard: **Zero Trust → Access → Applications → Add an application → Self-hosted**

- Set the domain to your Pages URL (e.g. `zsebcredit.pages.dev`)
- Add yourself as an allowed user by email

Anyone hitting the URL will now get an SSO login prompt before they can access the app.

## Local development

```
wrangler pages dev public --d1 DB=zsebcredit
```

This runs the app locally against a local copy of the D1 database.
