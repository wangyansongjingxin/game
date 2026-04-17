# Release checklist for 3分钟解压屋

## Repo map

- `game/index.html` — public launcher / landing page
- `game/play/index.html` — game shell
- `game/play/script.js` — gameplay logic
- `game/play/styles.css` — game styling
- `game/README.md` — short repo notes

## Before editing

1. Confirm the requested change is for the `game` repo.
2. Check whether the user wants a local fix, a GitHub push, or a public release.
3. Keep the root launcher and `play/` split intact unless the user explicitly asks to change it.

## Before release

1. Run `node tools/relax-room-release/scripts/check-release.mjs --root .` from the repo root, or run the same script from the standalone skill folder with `--root` pointed at the repo.
2. Fix any missing files, broken launcher links, missing meta tags, or script syntax errors.
3. Run `node --check play/script.js` if JavaScript changed.
4. Re-open the pages locally if the change affects layout, copy, or mobile behavior.

## Commit and push

- Use short conventional commit messages: `feat: ...`, `perf: ...`, `fix: ...`.
- Push to `main` on `origin` unless the user asks for a branch or PR.
- If the release is public-facing, keep `game/index.html` pointing at `play/index.html`.

## Common gotchas

- Do not leave the launcher pointing at an old path after moving files.
- Do not update only `play/index.html` when the public copy should also change.
- Do not touch unrelated workspace folders unless the user asks.
