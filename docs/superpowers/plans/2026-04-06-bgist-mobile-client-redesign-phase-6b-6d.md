# BGist Mobile Client Redesign Phase 6B-6D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成二级页面闭环，补齐 `GistViewer / GistHistory / GistEditor / UserProfile` 的 React Native 实现、关键回归测试、最终提交与推送。

**Architecture:** 在现有 `src/features/*` 新架构内继续扩展，不回退到旧 `src/screens/*`。数据读取统一走 `React Query + src/features/gists/api/gists.ts`，编辑与动作统一走 `useGistMutations()`，二级导航全部挂载到 `src/app/navigation/RootNavigator.tsx`。

**Tech Stack:** React Native, React Navigation Native Stack + Bottom Tabs, TanStack React Query, Jest, Testing Library for React Native

---

### Task 1: Harden Viewer And History

**Files:**
- Modify: `src/features/gists/screens/GistViewerScreen.tsx`
- Modify: `src/features/gists/screens/GistHistoryScreen.tsx`
- Modify: `__tests__/gists/GistViewerScreen.test.tsx`
- Create: `__tests__/gists/GistHistoryScreen.test.tsx`

- [ ] **Step 1: 先写失败测试，锁定复制按钮与远程内容状态**

```tsx
test('disables copy content while truncated file is still loading', () => {
  expect(screen.getByRole('button', {name: 'Copy content'})).toBeDisabled();
});

test('disables copy content when remote content fetch fails', async () => {
  expect(await screen.findByText('Could not load this file')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Copy content'})).toBeDisabled();
});
```

- [ ] **Step 2: 运行单测并确认先红**

Run: `npm test -- --runInBand __tests__/gists/GistViewerScreen.test.tsx`
Expected: FAIL，提示复制按钮仍可点击或错误态断言未满足

- [ ] **Step 3: 最小实现 Viewer 的可复制条件，并补 History 回归**

```tsx
const canCopyContent = !needsRemoteContent || fileContentQuery.isSuccess;

<AppButton
  label="Copy content"
  disabled={!canCopyContent}
  onPress={() => copyValue(resolvedContent, 'Content')}
  variant="secondary"
/>
```

```tsx
test('opens revision links using gist html url plus revision hash', async () => {
  expect(Linking.openURL).toHaveBeenCalledWith(
    'https://gist.github.com/octocat/gist-1/abc1234',
  );
});
```

- [ ] **Step 4: 运行聚焦测试并确认转绿**

Run: `npm test -- --runInBand __tests__/gists/GistViewerScreen.test.tsx __tests__/gists/GistHistoryScreen.test.tsx`
Expected: PASS

- [ ] **Step 5: 自查**

检查 `GistViewerScreen` 是否仍保留空文件不误判、远程加载成功时允许复制、失败时只局部降级。

### Task 2: Ship React Native Gist Editor

**Files:**
- Create: `src/features/gists/screens/GistEditorScreen.tsx`
- Modify: `src/features/gists/screens/ComposeScreen.tsx`
- Modify: `src/features/gists/hooks/useGistMutations.ts`
- Modify: `src/app/navigation/RootNavigator.tsx`
- Modify: `src/app/navigation/types.ts`
- Create: `__tests__/gists/GistEditorScreen.test.tsx`

- [ ] **Step 1: 先写失败测试，覆盖创建、编辑和底部保存**

```tsx
test('submits a new gist with draft files from create mode', async () => {
  await user.press(screen.getByRole('button', {name: 'Create gist'}));
  expect(createGistMutation.mutateAsync).toHaveBeenCalledWith({
    description: 'Demo gist',
    public: true,
    files: {'index.ts': {content: 'export {}'}},
  });
});

test('loads existing gist in edit mode and submits renamed or removed files', async () => {
  expect(screen.getByDisplayValue('hello.ts')).toBeTruthy();
});
```

- [ ] **Step 2: 运行编辑器单测并确认先红**

Run: `npm test -- --runInBand __tests__/gists/GistEditorScreen.test.tsx`
Expected: FAIL，缺少新屏幕或提交参数不匹配

- [ ] **Step 3: 实现新编辑器，复用 mutation 层，不走旧 API**

```tsx
const submitPayload = Object.fromEntries(
  draftFiles.map(file => [file.filename, {content: file.content}]),
);

if (route.params.mode === 'edit') {
  await editGistMutation.mutateAsync({
    gistId: route.params.gistId,
    params: {description, files: diffedFiles},
  });
} else {
  await createGistMutation.mutateAsync({
    description,
    public: isPublic,
    files: submitPayload,
  });
}
```

- [ ] **Step 4: 接通导航入口**

```tsx
<Stack.Screen name="GistEditor" component={GistEditorScreen} />
```

```tsx
onPress={() => navigation.navigate('GistEditor', {mode: 'create'})}
```

- [ ] **Step 5: 运行聚焦测试**

Run: `npm test -- --runInBand __tests__/gists/GistEditorScreen.test.tsx __tests__/gists/useGistMutations.test.tsx`
Expected: PASS

### Task 3: Ship React Native User Profile

**Files:**
- Create: `src/features/profile/screens/UserProfileScreen.tsx`
- Modify: `src/app/navigation/RootNavigator.tsx`
- Modify: `src/app/navigation/types.ts`
- Create: `__tests__/profile/UserProfileScreen.test.tsx`

- [ ] **Step 1: 先写失败测试，覆盖资料、列表、跳转和错误态**

```tsx
test('renders user profile stats and public gists', async () => {
  expect(await screen.findByText('@octocat')).toBeTruthy();
  expect(screen.getByText('Public gists')).toBeTruthy();
  expect(screen.getByText('Useful gist')).toBeTruthy();
});

test('navigates to gist detail from profile list', async () => {
  await user.press(screen.getByText('Useful gist'));
  expect(navigation.navigate).toHaveBeenCalledWith('GistDetail', {gistId: 'gist-1'});
});
```

- [ ] **Step 2: 运行资料页单测并确认先红**

Run: `npm test -- --runInBand __tests__/profile/UserProfileScreen.test.tsx`
Expected: FAIL，缺少新屏幕或查询逻辑未实现

- [ ] **Step 3: 实现新资料页，按新视觉系统组织**

```tsx
const profileQuery = useQuery({
  queryKey: queryKeys.userProfile(username),
  queryFn: () => getUserInfo(username),
});

const gistListQuery = useQuery({
  queryKey: queryKeys.userGists(username),
  queryFn: () => getUserGists(username),
});
```

- [ ] **Step 4: 接通导航**

```tsx
<Stack.Screen name="UserProfile" component={UserProfileScreen} />
```

- [ ] **Step 5: 运行聚焦测试**

Run: `npm test -- --runInBand __tests__/profile/UserProfileScreen.test.tsx`
Expected: PASS

### Task 4: Regression Verification, Commit, Push

**Files:**
- Modify: `__tests__/gists/GistDetailScreen.test.tsx`
- Modify: `__tests__/auth/SessionProvider.test.tsx`
- Modify: `src/app/navigation/RootNavigator.tsx`
- Modify: `src/features/gists/screens/ComposeScreen.tsx`
- Modify: `src/features/profile/screens/ProfileScreen.tsx`

- [ ] **Step 1: 补关键闭环测试**

```tsx
test('detail more actions open editor route for owners', async () => {
  expect(navigation.navigate).toHaveBeenCalledWith('GistEditor', {
    mode: 'edit',
    gistId: 'gist-1',
  });
});
```

- [ ] **Step 2: 运行回归套件**

Run: `npm test -- --runInBand __tests__/gists/GistDetailScreen.test.tsx __tests__/gists/GistViewerScreen.test.tsx __tests__/gists/GistHistoryScreen.test.tsx __tests__/gists/GistEditorScreen.test.tsx __tests__/profile/UserProfileScreen.test.tsx __tests__/gists/useGistMutations.test.tsx __tests__/gists/useGistDetail.test.tsx __tests__/gists/loadGistSupport.test.ts __tests__/gists/HomeScreen.test.tsx __tests__/auth/SessionProvider.test.tsx __tests__/App.shell.test.tsx __tests__/ui/AppSegmentedControl.test.tsx __tests__/ui/AppPrimitives.test.tsx`
Expected: PASS

- [ ] **Step 3: 运行类型检查，记录现状**

Run: `npx tsc --noEmit`
Expected: 仅剩已知测试环境 typing 问题；若出现新增错误必须先修

- [ ] **Step 4: 提交并推送**

```bash
git add src app __tests__ docs/superpowers/plans
git commit -m "feat: finish mobile gist detail flows"
git push github feature/mobile-redesign-rn
```
