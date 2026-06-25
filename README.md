# TOTJO Holocron Announcements

This repository hosts the static announcement feed consumed by the TOTJO Holocron PWA.

Production feed:

https://indubitablyodin.github.io/totjo-holocron-announcements/announcements.json

## Authoring workflow

1. Edit `announcements.json`.
2. Use a new `id` for new announcements.
3. Bump `version` to re-show an announcement that users already dismissed.
4. Keep `body` as plain text.
5. Use only internal app paths beginning with `/` or external `https` links.
6. Validate from the main app repo:
   ```sh
   pnpm check:announcements ../totjo-holocron-announcements/announcements.json
   ```
7. Commit and push.
8. Installed apps fetch the updated feed next time they open.

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
