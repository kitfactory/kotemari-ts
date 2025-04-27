import tseslint from 'typescript-eslint';

export default [
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { project: true } },
  },
];