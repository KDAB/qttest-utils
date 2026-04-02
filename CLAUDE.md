# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`qttest-utils` is a Node.js TypeScript library (`@iamsergio/qttest-utils`) that discovers Qt Test executables from a CMake build directory and enumerates their individual test slots. It is consumed by the [vscode-qttest](https://github.com/KDAB/vscode-qttest) VS Code extension.

## Commands

### Build
```bash
npm install
npm run build   # runs tsc, outputs to out/
```

### Run tests
Tests require the Qt test fixtures to be built first:
```bash
cmake --preset=dev -S test/qt_test/
cmake --build test/qt_test/build-dev/
node out/test.js
```

Use preset `dev6` for Qt 6 builds.

### Run the example
```bash
node out/example.js test/qt_test/build-dev
```

## Architecture

All source is in `src/`, compiled output goes to `out/`.

- **`src/cmake.ts`** — `CMakeTests` runs `ctest --show-only=json-v1` to enumerate tests registered via `add_test()`. Also provides `cppFilesForExecutable()` and `targetNameForExecutable()` for querying the CMake codemodel JSON.
- **`src/qttest.ts`** — Core classes:
  - `QtTests`: top-level collection; discovers via `discoverViaCMake()`, filters with `removeNonLinking()` (Linux only, uses `ldd`) or `removeByRunningHelp()` (cross-platform), and supports `removeMatching()`/`maintainMatching()` regex filters.
  - `QtTest`: wraps a single test executable; runs it with `-functions` to enumerate slots, executes tests with TAP output, and parses `.tap` files to locate failures (file + line). Supports running the full suite or individual slots.
  - `QtTestSlot`: represents one test function within a `QtTest`.
- **`src/utils.ts`** — Helpers for detecting executables and libraries by extension/permissions.
- **`src/index.ts`** — Re-exports `QtTests`, `QtTest`, `QtTestSlot`, `CMakeTests`, `CMakeTest` as the public API.
- **`src/test.ts`** — Integration test suite (run directly with `node out/test.js`); relies on built Qt fixtures in `test/qt_test/build-dev/`.
- **`src/example.ts`** — Standalone usage example.

### Test result parsing

When a Qt test runs, the library invokes the executable with `-o <name>.tap,tap -o <name>.txt,txt -o -,txt`. The resulting `.tap` files are parsed with `tap-parser` to extract failing slots, their source file paths, and line numbers. XFAIL (expected failure, reported as `todo` in TAP) is treated as a pass; XPASS (unexpected pass) is treated as a failure.

### Qt test fixtures (`test/qt_test/`)

C++ test executables (`test1`, `test2`, `test3`, `non_qttest`) are pre-built into `test/qt_test/build-dev/`. The `non_qttest` executable exercises the non-QtTest filtering path. `CMakePresets.json` defines `dev` (Qt 5) and `dev6` (Qt 6) presets.

## Commit conventions

Commits must follow Conventional Commits (enforced by pre-commit hook). Allowed types: `fix`, `feat`, `ci`, `test`, `chore`, `refactor`, `docs`.
