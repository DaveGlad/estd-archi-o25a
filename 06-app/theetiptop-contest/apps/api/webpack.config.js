const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      // Third-party packages stay external (the default). Bundling them was tried and
      // abandoned: @nestjs/terminus carries optional peer dependencies it never uses here
      // — TypeORM, Mongoose, Sequelize — and webpack cannot resolve what is not installed,
      // producing 20 unresolved-module errors. Suppressing each one individually would be a
      // list to maintain for no benefit.
      externalDependencies: 'all',

      // Emits a package.json next to the bundle listing exactly the packages the bundle
      // actually requires, at the versions the workspace resolved.
      //
      // This is what makes a small production image possible. In an npm workspace, neither
      // `npm ci --omit=dev -w <app>` nor `npm prune --omit=dev` restricts the install to
      // one app's dependencies — both were measured installing the whole 936 MB tree,
      // TypeScript and Next included. Installing from this generated manifest instead gives
      // the API's ~20 runtime packages and nothing else.
      generatePackageJson: true,
      sourceMap: true,
    }),
  ],
};
