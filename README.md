# BGist

<div align="center">
  <p><strong>Mobile-first GitHub Gist client built with React Native.</strong></p>
  <p>
    <a href="README_CN.md">简体中文文档</a>
    ·
    <a href="https://github.com/markbang/bgist/releases">Releases</a>
    ·
    <a href="https://github.com/markbang/bgist/actions">Actions</a>
  </p>
  <p>
    <img alt="GitHub release" src="https://img.shields.io/github/v/release/markbang/bgist?label=release&labelColor=27303D&color=0D1117">
    <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.84.1-20232a?logo=react&logoColor=61DAFB">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white">
    <img alt="Platforms" src="https://img.shields.io/badge/platforms-Android%20%7C%20iOS-0D1117">
    <img alt="Auth" src="https://img.shields.io/badge/auth-GitHub%20Device%20Flow-0D1117">
    <img alt="CI" src="https://img.shields.io/badge/CI-lint%20%C2%B7%20typecheck%20%C2%B7%20test%20%C2%B7%20build-0D1117">
  </p>
</div>

## Overview

BGist is a React Native client for browsing, creating, editing, and managing GitHub Gists on mobile.
It is designed around a phone-first workflow instead of compressing the desktop GitHub UI onto a small screen.

Current highlights:

- GitHub Device Flow sign-in
- personal and starred gist feeds
- public gist exploration with gist URL parsing
- gist detail, comments, history, fork, star, edit, and delete actions
- rendered Markdown and HTML preview in the file viewer
- system, light, and dark appearance modes
- English and Simplified Chinese UI

## Features

- **Mobile navigation first**: home, explore, compose, profile, settings, gist detail, history, and file viewer are optimized for handheld use.
- **GitHub-native workflow**: open user profiles, open revision pages, copy or share gist links, and work directly against the GitHub Gist API.
- **Focused editing flow**: create or edit multi-file gists with a mobile-oriented editor, file switching, and fixed save actions.
- **Useful settings**: switch theme, switch language, sign out, and jump to the repository or GitHub profile from inside the app.

## Downloads

- Tagged releases publish split APKs on the [Releases](https://github.com/markbang/bgist/releases) page.
- The standard CI workflow uploads a build artifact on every run, so you can download a test APK directly from [Actions](https://github.com/markbang/bgist/actions).

## Development

```sh
npm install
npm run lint
npm run typecheck
npm test -- --runInBand --forceExit
```

## Project Structure

```text
src/
  app/          App shell, navigation, providers, theme
  features/     Auth, gists, profile screens and logic
  shared/       Reusable UI, hooks, API helpers
  i18n/         Translation and language context
__tests__/      App, feature, navigation, theme, and UI tests
android/        Android app, signing, and Gradle build config
.github/        CI and release workflows
```

## CI

The repository uses GitHub Actions for:

- lint
- TypeScript type checking
- Jest test runs
- Android APK builds with downloadable artifacts

Release signing in CI is optional. If no Android signing secrets are configured, release builds fall back to the debug key for testing-only distribution.

## Contributing

Issues and pull requests are welcome.

For larger UX or scope changes, open an issue first so the direction can be discussed before implementation.
When contributing, prefer keeping new work inside the `src/features` and `src/shared` structure instead of extending the older legacy screen layer.

## Disclaimer

BGist is an independent project and is not affiliated with GitHub.
The app does not host gist content and only works with data provided by GitHub and the authenticated user account.
