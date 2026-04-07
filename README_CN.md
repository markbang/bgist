# BGist

<div align="center">
  <p><strong>一个移动端优先的 GitHub Gist 客户端。</strong></p>
  <p>
    <a href="README.md">English README</a>
    ·
    <a href="https://github.com/markbang/bgist/releases">Releases</a>
    ·
    <a href="https://github.com/markbang/bgist/actions">Actions</a>
  </p>
</div>

## 项目简介

BGist 是一个基于 React Native 构建的 GitHub Gist 移动客户端，目标不是把桌面网页硬塞到手机里，而是提供真正适合触屏使用的工作流。

当前版本重点支持：

- GitHub Device Flow 登录
- 我的 Gist 与星标 Gist 信息流
- 公开 Gist 探索与 gist URL 直达
- Gist 详情、评论、历史、Fork、星标、编辑、删除
- Markdown / HTML 文件渲染预览
- 跟随系统、浅色、深色三种外观模式
- 英文 / 简体中文界面

## 主要特性

- **移动端优先导航**：首页、探索、创作、个人页、设置、详情、历史和文件查看器都按手机操作习惯设计。
- **贴近 GitHub 的工作流**：直接打开用户主页、查看 revision 页面、复制或分享 gist 链接，并直接调用 GitHub Gist API。
- **聚焦式编辑器**：支持多文件 gist 创建与编辑，提供文件切换、固定保存区和更适合手机的编辑结构。
- **实用设置页**：支持切换主题、切换语言、退出登录、打开仓库和 GitHub 个人主页。

## 下载

- 打标签发布后，拆分 APK 会出现在 [Releases](https://github.com/markbang/bgist/releases) 页面。
- 标准 CI 工作流每次运行都会上传 APK artifact，所以也可以直接从 [Actions](https://github.com/markbang/bgist/actions) 下载测试包。

## 开发

```sh
npm install
npm run lint
npm run typecheck
npm test -- --runInBand --forceExit
```

## 项目结构

```text
src/
  app/          应用壳层、导航、providers、主题
  features/     登录、gists、个人资料相关功能
  shared/       通用 UI、hooks、API 辅助层
  i18n/         多语言与翻译上下文
__tests__/      应用、功能、导航、主题、UI 测试
android/        Android 应用、签名和 Gradle 配置
.github/        CI 与发布工作流
```

## CI

仓库当前使用 GitHub Actions 执行：

- lint
- TypeScript 类型检查
- Jest 测试
- Android APK 构建与 artifact 上传

CI 中的正式签名是可选的。如果没有配置 Android 签名 secrets，release 构建会回退到 debug key，仅适合测试分发。

## 贡献

欢迎提交 issue 和 pull request。

如果是较大的功能或交互改动，建议先开 issue 讨论范围和方向。
新增代码优先放在 `src/features` 和 `src/shared` 这套新结构里，不再继续扩展旧的 legacy screen 层。

## 免责声明

BGist 是独立项目，与 GitHub 没有关联。
应用本身不托管任何 Gist 内容，只消费 GitHub 与用户账号提供的数据。
