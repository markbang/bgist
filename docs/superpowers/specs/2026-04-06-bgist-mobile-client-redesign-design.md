# BGist Mobile Client Redesign Design

**Date:** 2026-04-06

## Goal

在保留 `React Native` 客户端形态的前提下，重构 BGist 的整体前端壳层、信息架构和视觉系统，参考 `HeroUI` 的设计语言自建一套 RN 组件体系，并完成一轮核心功能闭环：

- `GitHub OAuth PKCE` 登录
- 我的 / 公共 / 星标 gist 浏览
- gist 详情、文件查看、创建、编辑、删除
- 评论、star / unstar、fork、历史记录
- 当前用户与他人资料页
- 搜索、分享 / 复制链接

本轮目标是 **手机端优先**，同时设计和实现上兼顾 `Android + iOS`。

## Confirmed Decisions

- 保留 `React Native`，不迁到 Web React。
- 不直接引入 `HeroUI`，而是提炼其视觉与交互语言，手工实现 RN 版本。
- 登录方式从手输 `PAT` 改为 `GitHub OAuth Authorization Code + PKCE`。
- 底部导航调整为 `Home / Explore / Compose / Profile`。
- `Starred` 不再占用单独底部 Tab，而是折叠进 `Home` 的分段筛选。
- 本轮只做核心闭环，不追求一次性覆盖所有边角功能。

## Product Scope

### In Scope

#### 1. Authentication

- 使用系统浏览器发起 GitHub OAuth。
- 使用自定义 scheme 深链回调：`bgist://oauth/callback`。
- 使用 `code_verifier` 完成 `PKCE` 换 token。
- token 存入系统安全存储，不再使用普通本地缓存。
- App 启动时恢复会话，失效时统一退出。

#### 2. Navigation and App Structure

- 登录态外：仅显示 OAuth 登录页。
- 登录态内：
  - `Home`
  - `Explore`
  - `Compose`
  - `Profile`
- 二级页面：
  - `GistDetail`
  - `FileViewer`
  - `GistEditor`
  - `UserProfile`
  - `GistHistory`

#### 3. Gist Browsing

- `Home` 展示当前用户 gist 为主，并提供 `My / Starred` 分段切换。
- `Explore` 展示公共 gist 流，并提供搜索入口。
- 列表支持首次加载、下拉刷新、滚动分页。
- 列表项升级为卡片式摘要，不再是简单行列表。

#### 4. Gist Detail and Actions

- 详情页显示：
  - 描述
  - 可见性 badge
  - 作者信息
  - 文件列表
  - 评论流
  - revision 历史入口
- 详情页支持：
  - star / unstar
  - fork
  - edit
  - delete
  - copy link / share

#### 5. File Viewing

- 文件查看页支持代码阅读。
- 支持行号切换。
- 支持复制内容。
- 支持复制 gist / file 链接。

#### 6. Create and Edit

- 支持多文件 gist 创建。
- 支持编辑已有 gist。
- 支持文件新增、删除、重命名、内容修改。
- 支持公开 / 私密切换。
- 保存按钮固定在底部，提升移动端可达性。

#### 7. Comments and History

- 查看评论列表。
- 添加评论。
- 查看 gist revision 历史。

#### 8. Profile

- 当前用户资料页。
- 他人资料页。
- 资料统计、简介、公开 gist 列表。
- 设置入口至少包括语言切换、登出、打开 GitHub 页面。

### Explicit Non-Goals for This Round

- 不实现桌面级双栏 / 侧栏布局。
- 不新增 Web 端。
- 不做离线编辑或本地草稿同步系统。
- 不做复杂富文本评论或 markdown 渲染增强。
- 不追求完全复刻 GitHub 网页版每一个边角操作。

## Information Architecture

### 1. Home

`Home` 是客户端主入口，不再只是“我的 gist 列表”。

内容结构：

- 顶部欢迎区或当前用户摘要
- 分段切换：`My` / `Starred`
- gist 卡片列表
- 快捷动作：新建 gist

这样可以在保留“我的内容”主入口的同时，把之前独立的 `Starred` 页收进主工作流。

### 2. Explore

`Explore` 负责公共内容发现。

内容结构：

- 搜索入口
- 公共 gist 流
- 搜索结果态 / 空态 / 错误态

### 3. Compose

`Compose` 保持为独立底部 Tab，原因：

- 移动端新建动作需要足够近。
- 创建是该类客户端的高频核心操作，不应埋进二级页面。

### 4. Profile

`Profile` 统一承载：

- 当前用户信息
- 设置项
- 打开 GitHub
- 语言切换
- 登出

## Technical Architecture

### Directory Strategy

重构后按功能和共享层拆分，而不是继续把大部分逻辑塞在 `screens/` 下：

```text
src/
  app/
    navigation/
    providers/
    theme/
  features/
    auth/
    gists/
    profile/
  shared/
    api/
    hooks/
    storage/
    ui/
    utils/
```

### Responsibilities

- `app/`
  - 组装 Provider、导航、主题、全局壳层
- `features/auth`
  - OAuth PKCE、回调处理、session 恢复、登出
- `features/gists`
  - 列表、详情、编辑器、查看器、评论、历史、分享
- `features/profile`
  - 当前用户资料、他人资料、设置
- `shared/api`
  - GitHub API client、请求封装、错误归一化
- `shared/hooks`
  - 分页、远程状态、toast / alert 封装
- `shared/storage`
  - 安全存储与轻量本地偏好
- `shared/ui`
  - 基础 UI 组件与状态组件

## Session and Auth Model

### OAuth Flow

登录流程定义为：

1. 点击 `Sign in with GitHub`
2. App 打开系统浏览器，跳转 GitHub 授权页
3. GitHub 回调 `bgist://oauth/callback`
4. App 使用 `Authorization Code + PKCE` 换 access token
5. 将 token 写入安全存储
6. 拉取 `/user`
7. 进入主应用

### Storage Rules

- access token 存系统安全存储
- 语言、轻量 UI 偏好可继续存在普通持久化存储
- 启动时先恢复会话，再决定进登录流还是主应用

### Session Failure Rules

- `401` 或明确的 token 失效由 session 层统一接管
- UI 不在每个 screen 内各自实现“重新登录”逻辑

## Remote Data Model

当前项目的问题之一是页面自己维护请求、加载和错误状态，导致：

- 重复逻辑很多
- 页面间缓存不一致
- 次要请求容易拖垮主页面

新的数据层规则：

- 所有远程状态通过统一 query / cache 层管理
- 列表和详情分开缓存
- 编辑、删除、评论、star 后按目标失效对应缓存
- 屏幕组件只组合数据，不直接实现底层请求细节

## Gist Detail Failure Isolation

当前“只有 `Starred` 页能打开 gist，其他入口显示加载失败”的根因：

- 详情页把 `getGist()`、`isGistStarred()`、`getGistComments()` 放进同一个 `Promise.all`
- 对未 star 的 gist，请求 star 状态时会失败
- 附属请求失败把整个详情页一起打挂

重构后的规则：

- 主数据：gist 基础详情
- 附属数据：star 状态、评论、历史摘要

这些数据不能硬绑定成“一起成功或一起失败”。

预期行为：

- gist 主详情成功时，页面必须可显示
- `isStarred` 失败时，仅该控件降级
- 评论失败时，评论区显示局部错误态并允许重试

## Search Strategy

当前代码中的 `searchGists()` 使用 `/gists/search`，该接口并不存在，不能作为可靠能力继续保留。

本轮对“搜索”的明确解释：

- 支持在 `Explore` 中做 gist 发现与筛选
- 支持基于当前加载结果的客户端过滤
- 支持按 gist URL / gist ID 快速打开
- 对 GitHub 官方未提供稳定公共 API 的搜索能力，使用清晰的 UI 降级策略，而不是伪造一个不存在的接口

实现阶段可以在不突破当前轮范围的前提下选取最稳妥方案，但设计上不允许继续依赖不存在的 API。

## UI System

### Visual Direction

UI 方向定义为：

**GitHub 工具气质 + HeroUI 层次感**

具体表现：

- 明亮、干净、结构化
- 保留开发者工具产品的克制
- 使用更柔和的圆角和卡片层次
- 减少当前 UI 的系统默认控件感
- 强化点击反馈、空态、错态和分段切换

不追求：

- 夸张插画风
- 霓虹或过强装饰
- 完全照抄 GitHub Web 视觉

### Component Layer

需要抽出的基础组件至少包括：

- `AppButton`
- `AppCard`
- `AppInput`
- `AppBadge`
- `AppSegmentedControl`
- `AppBanner`
- `AppEmptyState`
- `AppLoadingState`
- `AppErrorState`
- `AppCodeBlock`
- `AppActionSheet`

这些组件承担统一视觉、交互反馈和状态表达，不再让每个 screen 自己拼装。

## Screen-Level UX Rules

### List Screens

- gist 列表使用卡片摘要
- 卡片包含：
  - 描述
  - public / secret badge
  - owner
  - 更新时间
  - 文件摘要
  - 评论 / star / fork 等轻量统计
- 支持按压反馈
- 首屏、空态、错误态统一

### Detail Screen

- 顶部先展示 gist 核心信息
- 主操作集中呈现：star、fork、edit、history
- 次级或危险操作进入 `ActionSheet`
- 文件区和评论区明确分段

### Editor

- 多文件编辑器按文件块组织
- 底部固定保存按钮
- 删除、重命名等动作具备明确反馈

### File Viewer

- 使用统一代码块风格
- 支持复制、链接分享、行号切换

### Profile

- 资料卡 + 设置列表
- 不再使用散乱的信息堆叠

## Error Handling

错误处理分 3 类：

### 1. Page-Level Error

用于首屏关键数据无法加载：

- 完整错误态
- 明确文案
- 提供重试按钮

### 2. Section-Level Error

用于评论区、历史区、star 状态等局部失败：

- 局部 banner / inline error
- 不影响其他区块可用

### 3. Action-Level Error

用于 star、delete、comment、save 等动作失败：

- toast / alert 反馈
- 不覆盖整个页面

## Platform Requirements

本轮实现同时考虑 `Android + iOS`：

- Android 添加深链 intent-filter
- iOS 配置 URL scheme
- 导航与安全存储方案必须双平台可用
- 交互默认按竖屏手机优化

## Testing Strategy

测试范围至少覆盖：

### 1. Session

- 会话恢复
- 登录成功
- 登录失败
- 登出
- token 失效回退

### 2. Gist Data

- 我的 gist 列表加载
- Explore 列表加载
- gist 详情主数据成功而附属数据失败时的降级行为
- 创建 / 编辑 / 删除后的缓存更新

### 3. UI States

- 空态
- 错误态
- 加载态
- 评论区局部错误态

### 4. Regression

- 修复“非 starred gist 无法打开详情”并建立回归测试

## Rollout Plan Shape

实现应按以下顺序推进：

1. 打地基：导航壳层、主题、组件基础层
2. 上会话：OAuth PKCE、深链、安全存储
3. 上数据：统一 API client 和 query / cache 层
4. 修核心缺陷：gist detail 解耦主数据与附属数据
5. 重做主要页面：Home、Explore、Compose、Profile
6. 重做二级页面：Detail、Viewer、Editor、UserProfile、History
7. 补测试和回归验证

## Open Interpretation Already Resolved

以下原始需求里的模糊点已在本设计中明确：

- “使用 HeroUI” 被解释为：借鉴设计语言，不直接引入 Web 组件库
- “支持网页版所有功能” 被解释为：本轮完成核心闭环，而非无限扩大范围
- “客户端” 被解释为：继续做原生 `React Native` App，而不是 Web App

## References

- HeroUI 官方文档：
  - `https://heroui.com/docs/react/getting-started`
- GitHub OAuth 授权文档：
  - `https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps`
- GitHub OAuth 最佳实践：
  - `https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/best-practices-for-creating-an-oauth-app`
