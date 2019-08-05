'format cjs';

module.exports = {
  types: [
    {
      value: 'WIP',
      name: '在制:     💪  临时提交工作正在处理中(WIP)',
    },
    {
      value: 'feat',
      name: '特性:     ✨  添加新特性或者功能(feat)',
    },
    {
      value: 'fix',
      name: '修复:     🐞  修补错误(fix)',
    },
    {
      value: 'docs',
      name: '文档:     📚  只变更了文档说明(docs)',
    },
    {
      value: 'style',
      name: '样式:     💅  代码样式，不影响代码含义的更改(style)',
    },
    {
      value: 'refactor',
      name: '重构:     ♻️  既不修复错误也不添加功能的代码更改(refactor)',
    },
    {
      value: 'perf',
      name: '性能:     ⚡️  提高性能的代码更改(perf)',
    },
    {
      value: 'test',
      name: '测试:     🏁  添加缺少的测试用例或更正现有测试用例(test)',
    },
    {
      value: 'build',
      name: '构建:     📦  影响构建系统或外部依赖关系的更改(build)',
    },
    {
      value: 'ci',
      name: '集成:     👷  对CI配置文件和脚本的更改(ci)',
    },
    {
      value: 'chore',
      name: '其他:     🔖  不涉及源码、测试文件、说明文档或集成脚本的变更(chore)',
    },
    {
      value: 'revert',
      name: '滚回:     ⏪  恢复以前的提交(revert)',
    },
  ],

  scopes: [],
  scopeOverrides: {
    fix: [{ name: 'merge' }, { name: 'style' }, { name: 'e2eTest' }, { name: 'unitTest' }],
    build: [{ name: 'pack' }, { name: 'theme' }, { name: 'angular' }, { name: 'npm' }, { name: 'cli' }],
    ci: [{ name: 'travis' }, { name: 'gitlab-ci' }],
  },
  messages: {
    type: '请选择本次commit的类型:',
    scope: '\n本次commit的范围定义 (选填):',
    customScope: '\n请填写自定义范围名称:',
    subject: '简单粗暴的说明本次commit:\n',
    body: '填写关于本次commit的详细说明 (选填). 需要换行请使用 "|":\n',
    breaking: '列出所有不兼容的变更 (选填):\n',
    footer:
      '列出本次commit需要关闭的ISSUES (选填).\n关键字: \nClose, Closes, Closed, Closing, close, closes, closed, closing\nFix, Fixes, Fixed, Fixing, fix, fixes, fixed, fixing\nResolve, Resolves, Resolved, Resolving, resolve, resolves, resolved, resolving\nImplement, Implements, Implemented, Implementing, implement, implements, implemented, implementing\n',
    confirmCommit: '您确认要提交这个commit吗?',
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
};
