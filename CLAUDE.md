# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` above is the canonical, tool-agnostic agent guide for this repo (architecture rules, required skills, current custom features, commands). Keep it as the single source of truth — don't duplicate its content here; add below only what's genuinely specific to Claude Code as a tool.

## Claude Code–specific notes

- Required skills live in `.agents/skills/` and are referenced from `AGENTS.md`; load them via the Skill tool before implementing Medusa backend/admin/storefront work — don't improvise the patterns.
- `.context/` is this repo's working memory (backlog, phase plans, per-feature changelogs, archived reports) — check `.context/index.md` and `.context/backlog.md` for state that isn't in the code or in `docs/`.
