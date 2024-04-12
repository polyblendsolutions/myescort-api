module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  ignorePatterns: ['.eslintrc.js', 'jest.config.js', 'jest.e2e.config.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: {
          memberTypes: [
            'public-field',
            'protected-field',
            'private-field',
            'field',
            'constructor',
            'method',
            'public-method',
            'protected-method',
            'private-method',
          ],
        },
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
        },
      },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'no-shadow': 'off',
    'node/no-extraneous-import': 'off',
    'security/detect-object-injection': 'off',
  },
  overrides: [
    {
      files: [
        '*.model.ts',
        '*.entity.ts',
        '*.enum.ts',
        '*.dto.ts',
        '*.input.ts',
        '*.interface.ts',
        '*.interfaces.ts',
        '*.type.ts',
        '*.types.ts',
      ],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            overrides: {
              constructors: 'no-public',
              properties: 'off',
            },
          },
        ],
        '@typescript-eslint/member-ordering': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
      rules: {
        'jest/expect-expect': 'off',
      },
    },
  ],
};