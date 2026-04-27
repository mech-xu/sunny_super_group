module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 禁止硬编码字符串（除了组件模板中的简单文本）
    'no-magic-numbers': ['error', { 
      ignore: [-1, 0, 1, 2], 
      ignoreArrayIndexes: true 
    }],
    'no-undef': 'error',
    'no-unused-vars': 'warn',
    'prefer-const': 'error'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // 在Vue文件中允许模板中的简单字符串
        'no-magic-numbers': 'off'
      }
    }
  ]
};