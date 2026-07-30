/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./test'],
  // msw@2 and several of its transitive deps (rettime, until-async,
  // @open-draft/deferred-promise, @bundled-es-modules/*, ...) ship ESM-only
  // builds, as does jose@6 (`"type": "module"`, no CommonJS build), which
  // @commercetools/connect-payments-sdk pulls in via jwks-rsa@4. jest runs
  // ts-jest in CommonJS, so those `.mjs`/ESM files fail to parse
  // ("Cannot use import statement outside a module"). We transpile them to
  // CommonJS by (1) un-ignoring those packages in transformIgnorePatterns and
  // (2) letting ts-jest handle .js/.mjs with `module: CommonJS`.
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true,
          module: 'CommonJS',
          moduleResolution: 'Node',
          isolatedModules: true,
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|@open-draft|@bundled-es-modules|@ungap|rettime|until-async|strict-event-emitter|headers-polyfill|outvariant|is-node-process|graphql|jose)/)',
  ],
};
