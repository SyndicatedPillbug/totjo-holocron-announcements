# TOTJO Holocron Announcements

This repository hosts the static announcement feed consumed by the TOTJO Holocron PWA.

## Feed URL

```
https://syndicatedpillbug.github.io/totjo-holocron-announcements/announcements.json
```

## How to edit announcements

1. Open `announcements.json`.
2. Add or edit an entry in the `announcements` array.
3. Use a new `id` for new announcements.
4. Bump `version` to re-show a previously dismissed announcement.
5. Keep `body` as plain text.
6. Use only internal app paths (`/settings`) or `https://` external links.
7. Run validation locally:
   ```sh
   node scripts/validate.mjs
   ```
8. Commit and push.
9. GitHub Pages deploys the updated file (1–2 minutes).
10. Installed apps fetch the new feed next time they open.

> **Note:** A validation workflow (`.github/workflows/validate-announcements.yml`) is staged locally but not yet pushed. See "GitHub Actions setup" below.

## Validation

The repo includes a local validation script:

```sh
node scripts/validate.mjs
```

Or:

```sh
node scripts/validate.mjs path/to/announcements.json
```

### What the validator checks

- Valid JSON
- `schemaVersion` is `1`
- `updatedAt` is a valid date string
- `announcements` is an array
- Each entry has:
  - Non-empty `id` (no duplicates)
  - Positive integer `version`
  - Valid `kind`: `totjo`, `sermon`, `doctrine`, `event`, `app`, `practice`
  - Valid `priority`: `low`, `normal`, `high`, `urgent`
  - Valid `placement`: `badge`, `banner`, `modal`, `card`
  - Non-empty `title`
  - Non-empty `body`
  - Valid `publishedAt` date
  - `startsAt` and `expiresAt` are valid dates when present
  - `dismissible` is boolean when present
  - `action` has non-empty `label` and safe `href` (internal `/path` or `https://` only)
- No `javascript:`, `data:`, or unsafe links

## GitHub Actions

On every push or pull request that changes `announcements.json`, a workflow runs the validation script. If validation fails, the workflow fails and the file is not deployed.

## GitHub Actions setup

A validation workflow file exists locally at `.github/workflows/validate-announcements.yml`. It runs `node scripts/validate.mjs` on every push that changes `announcements.json`.

### To enable

The workflow file is not yet pushed because the current git token lacks the required `workflow` scope. To push it, use a token with that scope:

1. Create a [classic personal access token](https://github.com/settings/tokens) with the `workflow` scope.
2. Push from the repo root:
   ```sh
   git add .github/workflows/validate-announcements.yml
   git commit -m "ci: validate announcements feed on push"
   git remote set-url origin https://<YOUR_PAT>@github.com/SyndicatedPillbug/totjo-holocron-announcements.git
   git push origin main
   ```
3. After push, the workflow runs on every subsequent push that changes `announcements.json`.

### What it checks

The workflow runs the same validation as the local script — JSON structure, required fields, safe hrefs, no duplicate IDs. If validation fails, the workflow fails and the push is blocked from being deployed.

## How GitHub Pages publishes

1. Push to `main`.
2. GitHub Pages builds from the root of `main`.
3. The file is served at the feed URL above.
4. Deployment usually takes 1–2 minutes.

## Priority guidance

- `low`: passive notice
- `normal`: ordinary app or content update
- `high`: important TOTJO or app update
- `urgent`: rare time-sensitive notice

## Placement guidance

- `badge`: default, noninterruptive
- `banner`: visible but not blocking
- `modal`: high or urgent only
- `card`: future announcement-center or list use

## Safety rules

- No HTML.
- No scripts.
- No private user data.
- No secrets.
- No `javascript:`, `data:`, `blob:`, `file:`, `http:`, or protocol-relative links.
- Use `https` for external links.
