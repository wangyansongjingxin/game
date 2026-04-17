---
name: relax-room-release
description: Release and maintenance workflow for the 3分钟解压屋 web game in C:\Users\wchj\.openclaw\workspace\game. Use when editing the game, checking the root launcher vs `play/` split, validating meta tags or mobile behavior, running release checks, preparing GitHub Pages updates, or committing and pushing changes to `git@github.com:wangyansongjingxin/game.git`.
---

# Relax Room Release

## Overview

Use this skill to keep the 3分钟解压屋 repo release-ready and easy to ship.

## Repo invariants

- Keep `game/index.html` as the public launcher / GitHub Pages entry.
- Keep the game itself in `game/play/`:
  - `play/index.html`
  - `play/script.js`
  - `play/styles.css`
- Keep the launcher and the game page in sync when changing public-facing copy, meta tags, or links.
- Prefer small, in-place edits; do not restructure the repo unless the user asks.

## Workflow

1. Read `references/release-checklist.md` before changing anything.
2. Run `node scripts/check-release.mjs --root C:\Users\wchj\.openclaw\workspace\game` from the skill directory. If the skill is copied into the repo under `tools/relax-room-release/`, run `node tools/relax-room-release/scripts/check-release.mjs --root .` from the repo root.
3. Make the requested changes.
4. Re-run the checker and `node --check play/script.js` if the script changed.
5. If the user wants a release, commit on `main` with a short conventional message and push to `origin`.

## Release guidance

- Update both the launcher and the game page meta tags when public sharing matters.
- Keep the launcher link pointed at `play/index.html`.
- Keep GitHub Pages oriented around the repo root `index.html`.
- Mention the files changed, checks run, and whether the push succeeded.
