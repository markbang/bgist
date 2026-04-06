# BGist

<div align="center">
  <p><strong>Mobile-first GitHub Gist client built with React Native.</strong></p>
  <p><strong>一个移动端优先的 GitHub Gist 客户端。</strong></p>
  <p>
    <a href="#english">English</a>
    ·
    <a href="#简体中文">简体中文</a>
  </p>
  <p>
    <img alt="GitHub release" src="https://img.shields.io/github/v/release/markbang/bgist?label=release&labelColor=27303D&color=0D1117">
    <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.84.1-20232a?logo=react&logoColor=61DAFB">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white">
    <img alt="Platforms" src="https://img.shields.io/badge/platforms-Android%20%7C%20iOS-0D1117">
    <img alt="Languages" src="https://img.shields.io/badge/i18n-English%20%7C%20%E4%B8%AD%E6%96%87-0D1117">
    <img alt="Auth" src="https://img.shields.io/badge/auth-GitHub%20Device%20Flow-0D1117">
  </p>
</div>

## English

### About

BGist is a React Native client for browsing, creating, editing, and managing GitHub Gists on mobile.
It is designed around a phone-first UI instead of a compressed desktop workflow.

The current app focuses on:

- GitHub Device Flow sign-in
- personal and starred gist feeds
- public gist exploration with gist URL parsing
- full gist detail, comments, history, fork, star, edit, and delete actions
- markdown and HTML preview in the file viewer
- system, light, and dark appearance modes
- English and Simplified Chinese UI

### Features

- **Phone-first navigation**: home, explore, compose, profile, settings, gist detail, history, and file viewer are all optimized for mobile navigation.
- **GitHub-native workflow**: sign in with GitHub, open user profiles, open revision pages, copy/share gist links, and work directly against the GitHub Gist API.
- **Rendered file preview**: markdown and HTML files can be previewed directly in the viewer, while source mode stays available for raw inspection.
- **Useful account controls**: switch theme, switch language, sign out, and jump to the repository or GitHub profile from settings.

### Quick Start

#### Requirements

- Node.js `>= 22.11.0`
- A working [React Native development environment](https://reactnative.dev/docs/set-up-your-environment)
- Android Studio for Android builds
- Xcode and CocoaPods for iOS builds

#### Install dependencies

```sh
npm install
```

#### Start Metro

```sh
npm start
```

#### Run on Android

```sh
npm run android
```

#### Run on iOS

```sh
bundle install
bundle exec pod install
npm run ios
```

### GitHub OAuth Setup For Forks

BGist uses **GitHub Device Flow**, so you do **not** need a client secret in the app.

If you are building your own fork:

1. Create a GitHub OAuth App.
2. Enable **Device Flow** in the OAuth App settings.
3. Replace the client ID in `src/features/auth/config/oauth.ts`.
4. Keep the scopes aligned with the app: `gist` and `read:user`.

### Development

```sh
npm test
npm run lint
npx tsc --noEmit
```

### Project Structure

```text
src/
  app/          App shell, navigation, providers, theme
  features/     Auth, gists, profile screens and logic
  shared/       Reusable UI, hooks, API helpers
  i18n/         Translation and language context
__tests__/      App, feature, navigation, theme, and UI tests
```

### Contributing

Issues and pull requests are welcome.

For larger changes, open an issue first so the UX and scope can be discussed before implementation.
When contributing, prefer keeping new work inside the `src/features` and `src/shared` structure instead of extending the older legacy screen layer.

### Disclaimer

BGist is an independent project and is not affiliated with GitHub.
The app does not host gist content and only works with data provided by GitHub and the authenticated user account.

## 简体中文

### 项目简介

BGist 是一个基于 React Native 构建的 GitHub Gist 移动客户端，目标不是把桌面网页硬塞到手机里，而是提供真正适合触屏使用的工作流。

当前版本重点支持：

- GitHub Device Flow 登录
- 我的 Gist 与星标 Gist 信息流
- 公开 Gist 探索与 gist URL 直达
- Gist 详情、评论、历史、Fork、星标、编辑、删除
- Markdown / HTML 文件渲染预览
- 跟随系统、浅色、深色三种外观模式
- 英文 / 简体中文界面

### 主要特性

- **移动端优先导航**：首页、探索、创作、个人页、设置、详情、历史和文件查看器都按手机操作习惯设计。
- **贴近 GitHub 的工作流**：直接登录 GitHub、打开用户主页、查看 revision 页面、复制或分享 gist 链接，并直接调用 GitHub Gist API。
- **文件预览能力**：Markdown 和 HTML 文件可以直接预览渲染结果，也能随时切回源码模式。
- **实用设置页**：支持切换主题、切换语言、退出登录、打开仓库和 GitHub 个人主页。

### 快速开始

#### 环境要求

- Node.js `>= 22.11.0`
- 已完成 [React Native 环境配置](https://reactnative.dev/docs/set-up-your-environment)
- Android Studio
- Xcode 与 CocoaPods

#### 安装依赖

```sh
npm install
```

#### 启动 Metro

```sh
npm start
```

#### 运行 Android

```sh
npm run android
```

#### 运行 iOS

```sh
bundle install
bundle exec pod install
npm run ios
```

### Fork 项目的 GitHub OAuth 配置

BGist 现在使用的是 **GitHub Device Flow**，所以应用内**不需要** client secret。

如果你要构建自己的 fork：

1. 在 GitHub 创建一个 OAuth App。
2. 在 OAuth App 设置里启用 **Device Flow**。
3. 把 `src/features/auth/config/oauth.ts` 里的 client ID 改成你自己的。
4. 保持应用权限范围与当前实现一致：`gist` 和 `read:user`。

### 开发命令

```sh
npm test
npm run lint
npx tsc --noEmit
```

### 项目结构

```text
src/
  app/          应用壳层、导航、provider、主题
  features/     登录、gists、个人资料相关功能
  shared/       通用 UI、hooks、API 辅助层
  i18n/         多语言与翻译上下文
__tests__/      应用、功能、导航、主题、UI 测试
```

### 贡献

欢迎提交 issue 和 pull request。

如果是较大的功能或交互改动，建议先开 issue 讨论范围和方向。
新增代码优先放在 `src/features` 和 `src/shared` 这套新结构里，不再继续扩展旧的 legacy screen 层。

### 免责声明

BGist 是独立项目，与 GitHub 没有关联。
应用本身不托管任何 Gist 内容，只消费 GitHub 与用户账号提供的数据。

## Reference

This README structure was inspired by the presentation style of the Mihon project:
<https://github.com/mihonapp/mihon>
