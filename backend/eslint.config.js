const js = require('@eslint/js');

module.exports = [
  { ignores: ['node_modules', 'coverage', 'uploads'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next$' }],
      'no-console': 'off',
    },
  },
  // Jest test files: make jest globals available so lint doesn't fail
  {
    files: ['tests/**/*.js', '**/*.test.js', 'tests/**/*.test.js', 'backend/tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // tests often intentionally use dev-only globals
      'no-unused-expressions': 'off',
    },
  },

];
