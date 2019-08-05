module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build📦' ,'chore🔧', 'ci👷', 'docs📝', 'feat✨', 'fix🐛', 'perf⚡️', 'refactor♻️', 'revert⏪','style🎨', 'test🏁',
      'build' ,'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert','style', 'test',
      ],
    ],
  },
  parserPreset: './parser-preset'
};
