type Language = 'en' | 'zh';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.myGists': 'My Gists',
    'nav.explore': 'Explore',
    'nav.create': 'Create',
    'nav.starred': 'Starred',
    'nav.profile': 'Profile',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.noResults': 'No results found',
    'common.public': 'Public',
    'common.secret': 'Secret',
    'common.comments': 'Comments',
    'common.files': 'Files',
    'common.forks': 'Forks',
    'common.updated': 'Updated',
    'common.created': 'Created',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.lineNumbers': 'Lines',
    'common.star': 'Star',
    'common.starred': 'Starred',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signOut': 'Sign Out',
    'auth.signOutConfirm': 'Are you sure you want to sign out?',
    'auth.signInTitle': 'Sign in to GitHub',
    'auth.patLabel': 'Personal Access Token',
    'auth.patPlaceholder': 'ghp_xxxxxxxxxxxxxxxxxxxx',
    'auth.patHelp': 'Create a token at',
    'auth.patScope': 'with the',
    'auth.signingIn': 'Signing in...',
    'auth.invalidToken': 'Invalid token. Please check and try again.',
    'auth.enterToken': 'Please enter a Personal Access Token',
    'auth.classicToken': 'Please use Classic Personal Access Token',
    'auth.noFineGrained': 'Fine-grained tokens (github_pat_) do not support Gist API. Use Classic tokens (ghp_) from github.com/settings/tokens',

    // Gist
    'gist.description': 'Gist description (optional)',
    'gist.filename': 'filename.ext (e.g. script.js)',
    'gist.codePlaceholder': 'Write your code here...',
    'gist.createGist': 'Create Gist',
    'gist.editGist': 'Edit Gist',
    'gist.updateGist': 'Update Gist',
    'gist.saving': 'Saving...',
    'gist.noDescription': 'No description',
    'gist.addFile': '+ Add another file',
    'gist.file': 'File',
    'gist.emptyTitle': 'No gists yet',
    'gist.emptyText': 'Create your first gist to get started',
    'gist.moreFiles': 'more file',
    'gist.fileError': 'Each file needs a filename or content',
    'gist.filenameError': 'All files must have a filename',
    'gist.saveError': 'Failed to save gist',
    'gist.deleteConfirm': 'Are you sure you want to delete this gist? This action cannot be undone.',
    'gist.starError': 'Failed to update star',
    'gist.forkSuccess': 'Gist forked!',
    'gist.forkError': 'Failed to fork gist',
    'gist.loadError': 'Failed to load gist',

    // Explore
    'explore.searchPlaceholder': 'Search gists...',
    'explore.searchResults': 'Search results for',
    'explore.tryDifferent': 'Try different search terms',

    // Starred
    'starred.emptyTitle': 'No starred gists',
    'starred.emptyText': 'Star gists to save them here for quick access',

    // Profile
    'profile.gists': 'Gists',
    'profile.repos': 'Repos',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.openGitHub': 'Open GitHub Profile',

    // History
    'history.version': 'Version',
    'history.empty': 'No revision history available',

    // Viewer
    'viewer.filename': 'File',

    // User
    'user.noGists': 'No public gists',
  },
  zh: {
    // Navigation
    'nav.myGists': '我的 Gists',
    'nav.explore': '探索',
    'nav.create': '创建',
    'nav.starred': '星标',
    'nav.profile': '个人资料',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.search': '搜索',
    'common.noResults': '未找到结果',
    'common.public': '公开',
    'common.secret': '私密',
    'common.comments': '评论',
    'common.files': '文件',
    'common.forks': 'Fork',
    'common.updated': '更新于',
    'common.created': '创建于',
    'common.copy': '复制',
    'common.copied': '已复制！',
    'common.lineNumbers': '行号',
    'common.star': '星标',
    'common.starred': '已星标',

    // Auth
    'auth.signIn': '登录',
    'auth.signOut': '退出登录',
    'auth.signOutConfirm': '确定要退出登录吗？',
    'auth.signInTitle': '登录 GitHub',
    'auth.patLabel': '个人访问令牌',
    'auth.patPlaceholder': 'ghp_xxxxxxxxxxxxxxxxxxxx',
    'auth.patHelp': '前往',
    'auth.patScope': '创建令牌，勾选',
    'auth.signingIn': '登录中...',
    'auth.invalidToken': '令牌无效，请检查后重试',
    'auth.enterToken': '请输入个人访问令牌',
    'auth.classicToken': '请使用 Classic 类型的令牌',
    'auth.noFineGrained': 'Fine-grained 令牌 (github_pat_) 不支持 Gist API。请前往 github.com/settings/tokens 创建 Classic 令牌 (ghp_)',

    // Gist
    'gist.description': 'Gist 描述（可选）',
    'gist.filename': '文件名（如 script.js）',
    'gist.codePlaceholder': '在此编写代码...',
    'gist.createGist': '创建 Gist',
    'gist.editGist': '编辑 Gist',
    'gist.updateGist': '更新 Gist',
    'gist.saving': '保存中...',
    'gist.noDescription': '无描述',
    'gist.addFile': '+ 添加另一个文件',
    'gist.file': '文件',
    'gist.emptyTitle': '还没有 Gist',
    'gist.emptyText': '创建你的第一个 Gist 开始吧',
    'gist.moreFiles': '个更多文件',
    'gist.fileError': '每个文件需要有文件名或内容',
    'gist.filenameError': '所有文件必须有文件名',
    'gist.saveError': '保存 Gist 失败',
    'gist.deleteConfirm': '确定要删除此 Gist 吗？此操作无法撤销。',
    'gist.starError': '更新星标失败',
    'gist.forkSuccess': 'Gist 已 Fork！',
    'gist.forkError': 'Fork Gist 失败',
    'gist.loadError': '加载 Gist 失败',

    // Explore
    'explore.searchPlaceholder': '搜索 Gists...',
    'explore.searchResults': '搜索结果：',
    'explore.tryDifferent': '试试不同的搜索词',

    // Starred
    'starred.emptyTitle': '没有星标 Gist',
    'starred.emptyText': '星标 Gist 以便快速访问',

    // Profile
    'profile.gists': 'Gists',
    'profile.repos': '仓库',
    'profile.followers': '关注者',
    'profile.following': '正在关注',
    'profile.openGitHub': '打开 GitHub 主页',

    // History
    'history.version': '版本',
    'history.empty': '没有修订历史',

    // Viewer
    'viewer.filename': '文件',

    // User
    'user.noGists': '没有公开 Gist',
  },
};

export type {Language};
export {translations};
