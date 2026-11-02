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
wrangler d1 execute zsebcredit --remote --file=schema.sql
```

For an existing database, run this to create the new `admin_users` table. It uses `IF NOT EXISTS`, so existing kids and transactions are preserved.

Add your email address to the admin allowlist (replace the example address):

```
wrangler d1 execute zsebcredit --remote --command="INSERT OR IGNORE INTO admin_users (email) VALUES ('admin@example.com');"
```

Allowlisted users see the kid and transaction management controls. Other users allowed by Cloudflare Access can view every kid's account and transaction history without those controls. Add or remove admins by inserting or deleting their email in `admin_users`.

This is a user-interface distinction, not API authorization: the existing write endpoints do not check the admin allowlist, so an Access-authenticated user could still make changes by calling them directly. The browser reads the Access identity from `/cdn-cgi/access/get-identity`. The `/api/me` Pages Function looks up the supplied email in D1 and returns the role for the frontend; this does not protect the endpoint from a user supplying another email.

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
- Add each family member's email address to the Access allow policy. The admin allowlist above controls who can make changes.

Anyone hitting the URL will now get an SSO login prompt before they can access the app.

Protect every hostname that can serve the Pages project, including its `pages.dev` hostname, with Cloudflare Access, or disable public access to the unused hostname.

## Local development

```
wrangler pages dev public --d1 DB=zsebcredit
```

This runs the app locally against a local copy of the D1 database.

On localhost, `/identity.js` uses `dev@example.com` as a mock identity. Set `localStorage.setItem("pocket-money-dev-email", "admin@example.com")` in the browser console to test an admin role, and add that email to the local D1 `admin_users` table. The mock email can also be changed to any other local test user.
