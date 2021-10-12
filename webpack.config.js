// webpack.config.js
/* eslint @typescript-eslint/no-var-requires: "off" */
import { resolve, dirname, join } from 'path';
import { VueLoaderPlugin } from 'vue-loader';
import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import extensionKey from './extensionKey.js';
import { readFileSync, copyFileSync, existsSync, mkdirSync, rmSync, readdirSync, lstatSync } from 'fs';
import EventHooksPlugin from 'event-hooks-webpack-plugin';
import { createHash } from 'crypto';

const setObject = (object, key, value) => ({
  ...object,
  [key]: value
});

const whenSetObject = (predicate, object, key, value) => (predicate() ? setObject(object, key, value) : { ...object });

const toPrettyJson = (obj) => JSON.stringify(obj, null, 2);

const sameHash = (source, dest) => createHash('sha256').update(source()).digest('hex') === createHash('sha256').update(dest()).digest('hex');

function ensureDirectoryExistence(filePath) {
  if (existsSync(dirname(filePath))) {
    return true;
  }
  ensureDirectoryExistence(dirname(filePath));
  mkdirSync(dirname(filePath));
}

export default (env) => {
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
      redirectScript: './redirectScript/index.ts'
    },
    context: resolve('src'),
    output: {
      filename: '[name].js',
      path: resolve(`dist-${browser}`)
    },
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json', '.mjs'],
      alias: {
        '@': resolve('src/popup'),
        // It seems the problem has been solve. https://github.com/vuejs/vue-cli/pull/5788
        // this isn't technically needed, since the default `vue` entry for bundlers
        // is a simple `export * from '@vue/runtime-dom`. However having this
        // extra re-export somehow causes webpack to always invalidate the module
        // on the first HMR update and causes the page to reload.
        // vue: '@vue/runtime-dom',
        storage: resolve(`src/popup/platform/storage/${browser}/index.ts`),
        monkeyPatchApollo: resolve(`src/popup/platform/monkeyPatchApollo/${browser}/index.ts`),
        onPageActionClicked: resolve(`src/background/platform/onPageActionClicked/${browser}/index.ts`)
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
      new EventHooksPlugin({
        beforeRun: () => rmSync(resolve('src/popup/foundation'), { recursive: true, force: true }),
        beforeCompile: () => {
          const addPopupFoundationFile = (file) => {
            const thisPath = 'src/popup/foundation';
            ensureDirectoryExistence(`${thisPath}/${file}`);

            const source = resolve(`node_modules/@plussub/extension/src/popup/${file}`);
            const dest = resolve(`${thisPath}/${file}`);

            if (existsSync(dest) && sameHash(() => readFileSync(source), () => readFileSync(dest))) {
              return;
            }
            copyFileSync(source, dest);
          };
          const getFoundationFiles = (baseFolder, fn) => {
            const basePath = `node_modules/@plussub/extension/src/popup/${baseFolder}`;
            readdirSync(basePath)
              .map((e) => {
                const path = join(basePath, e);
                return {
                  path,
                  filename: e,
                  isFile: lstatSync(path).isFile(),
                  baseFolder
                };
              })
              .filter((e) => e.isFile)
              .map((e) => `${baseFolder}/${e.filename}`)
              .forEach((e) => fn(e));
          }
          getFoundationFiles('composables', (e) => addPopupFoundationFile(e));
          getFoundationFiles('components', (e) => addPopupFoundationFile(e));
          getFoundationFiles('components/FontAwesomeIcon', (e) => addPopupFoundationFile(e));
          getFoundationFiles('components/LanguageSelect', (e) => addPopupFoundationFile(e));
        }
      }),
      new VueLoaderPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: `manifest-${browser}.json`,
            to: 'manifest.json',
            transform: (manifest) =>
              toPrettyJson(
                whenSetObject(() => env.add_manifest_key, setObject(JSON.parse(manifest.toString()), 'version', JSON.parse(readFileSync(resolve('package.json'))).version), 'key', extensionKey.key)
              )
          },
          { from: 'res', to: 'res' },
          { from: 'popup/font.css', to: 'font.css' },
          { from: '../node_modules/@plussub/extension/dist-chrome/contentScript.css', to: 'contentScript.css' },
          { from: '../node_modules/@plussub/extension/dist-chrome/contentScript.js', to: 'contentScript.js' }
        ]
      }),
      new webpack.DefinePlugin({
        __VUE_PROD_DEVTOOLS__: 'false'
      })
    ]
  };
};
