// webpack.config.js
/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const extensionKey = require("./extensionKey");

module.exports = (env, argv) => {
  const browser = (env.browser ? env.browser.toLowerCase() : 'unknown').trim();
  if (browser !== 'chrome' && browser !== 'firefox') {
    throw new Error(`unknown browser: ${browser}`);
  }
  const mode = (env.mode ? env.mode : 'development').trim();

  return {
    devtool: false,
    mode,
    entry: {
      popup: './popup/index.ts',
      background: './background/index.ts',
      contentScript: './contentScript/index.ts',
      redirectScript: './redirectScript/index.ts'
    },
    context: path.resolve(__dirname, 'src'),
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, `dist-${browser}`)
    },
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json', '.mjs'],
      alias: {
        '@': path.resolve(__dirname, 'src/popup'),
        // It seems the problem has been solve. https://github.com/vuejs/vue-cli/pull/5788
        // this isn't technically needed, since the default `vue` entry for bundlers
        // is a simple `export * from '@vue/runtime-dom`. However having this
        // extra re-export somehow causes webpack to always invalidate the module
        // on the first HMR update and causes the page to reload.
        // vue: '@vue/runtime-dom',
        storage: path.resolve(__dirname, `src/popup/platform/storage/${browser}/index.ts`),
        monkeyPatchApollo: path.resolve(__dirname, `src/popup/platform/monkeyPatchApollo/${browser}/index.ts`),
        onPageActionClicked: path.resolve(__dirname, `src/background/platform/onPageActionClicked/${browser}/index.ts`)
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
              options: { injectType: 'singletonStyleTag', attributes: { id: 'plussub-style' } }
            },
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            // {
            //   loader: 'file-loader',
            // },
            {
              loader: 'url-loader',
              options: {
                limit: 102400
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|ttf|eot)$/,
          use: 'file-loader?name=fonts/[name].[ext]!static'
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        {
          test: /\.html$/i,
          loader: 'html-loader'
        },
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: 'graphql-tag/loader'
        },
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false
          }
        }
      ]
    },
    optimization: {},
    plugins: [
      new VueLoaderPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: `manifest-${browser}.json`,
            to: 'manifest.json',
            transform(manifest) {
              return env.add_manifest_key
                ? JSON.stringify({
                  ...JSON.parse(manifest.toString()),
                  ...extensionKey
                }, null, 2)
                : manifest;
            }
          },
          { from: 'res', to: 'res' },
          { from: 'popup/font.css', to: 'font.css' },
          { from: 'contentScript/contentScript.css', to: 'contentScript.css' }
        ]
      }),
      new webpack.DefinePlugin({
        __VUE_PROD_DEVTOOLS__: 'false'
      })
    ]
  };
};
