# Spec: Identify the current user in a Cloudflare Pages frontend (Cloudflare Access)

## Goal
Make the frontend aware of who the logged-in user is, using the identity that Cloudflare Access (Zero Trust) already provides. Use this to distinguish users in the UI (e.g. display name, per-user local state).

## Context
- Static frontend deployed on Cloudflare Pages. No server-side code, no Pages Functions, no separate backend.
- The app is already protected by a Cloudflare Access application restricting entry to specific email addresses. The user has authenticated before any app code loads, and the `CF_Authorization` cookie is set on the app's domain.
- Security is explicitly out of scope: the identity is used for UX/personalization only, not for authorization or protecting data. Do not add JWT verification or a backend.

## Mechanism
Make a same-origin GET request from the browser:

    GET /cdn-cgi/access/get-identity

- Sent with cookies (`credentials: "include"`; same-origin sends them by default).
- Returns JSON on success. Fields to use:
  - `email`: the user's email address
  - `user_uuid`: stable unique user ID (preferred as the user key)
  - `name`: display name, if the identity provider supplies one (may be absent)
- Returns a non-2xx response (or non-JSON) if there is no valid Access session.

## Requirements
1. Create a small module (e.g. `identity.ts`/`identity.js`) exporting:
   - `fetchIdentity(): Promise<Identity | null>` which calls the endpoint, returns `{ id, email, name? }` mapped from `user_uuid`, `email`, `name`, and returns `null` on any failure (network error, non-OK status, invalid JSON, missing `email`).
   - An `Identity` type.
2. Fetch once on app startup and cache the result in app state (a context/store/composable appropriate to the existing framework). Do not refetch on every render or navigation.
3. Expose the identity to components via the framework's idiomatic mechanism (hook, context, store, etc.), including a loading state.
4. Use `user_uuid` as the user key for anything per-user (e.g. namespacing localStorage keys); fall back to `email` if `user_uuid` is missing.
5. Display the user's name (falling back to email) somewhere sensible in the UI, such as the header. Match the existing UI conventions.
6. Handle failure gracefully: if the identity is `null`, the app should still render in an anonymous/default mode, with no crash and no infinite loading.

## Local development
`/cdn-cgi/access/get-identity` doesn't exist on localhost, so the request will 404.
- Add a dev fallback: when running in dev mode (e.g. `import.meta.env.DEV` or the equivalent), return a mock identity such as `{ id: "dev-user", email: "dev@example.com", name: "Dev User" }` instead of calling the endpoint.
- Make the mock easy to override (e.g. via an env variable).

## Out of scope
- JWT verification, Pages Functions, or any backend.
- Authorization or access control decisions based on the identity.
- Changing the Cloudflare Access configuration.

## Acceptance criteria
- In production (behind Access), the app displays the logged-in user's name/email and exposes `{ id, email, name? }` to components.
- In local dev, the app works using the mock identity with no failed network requests.
- If the endpoint fails, the app still loads in a default state.
- Only one identity request is made per page load.
- No new runtime dependencies are added unless the existing stack already requires them.

## Notes for the implementer
- The endpoint is only available on hostnames covered by the Access application. If the app is also reachable on `*.pages.dev` without Access in front of it, the request will fail there and the null-fallback path will apply. This is expected.
- Detect the framework, language, and state-management approach from the existing codebase and follow its conventions.