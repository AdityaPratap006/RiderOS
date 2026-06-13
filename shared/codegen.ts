import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/schema.graphql',
  documents: ['../frontend/src/**/*.{ts,tsx}'],
  generates: {
    '../frontend/src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        scalars: { JSON: 'unknown' },
      },
    },
  },
};

export default config;
