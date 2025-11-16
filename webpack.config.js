const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
require('dotenv').config();

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'inline-source-map',

    entry: {
      background: './src/background/index.js',
      content: './src/content/index.js',
      'popup/controller': './src/popup/controller.js',
      'options/controller': './src/options/controller.js'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js',
      clean: true
    },

    resolve: {
      extensions: ['.js', '.mjs', '.json'],
      extensionAlias: {
        '.js': ['.js', '.ts']
      },
      fallback: {
        // Chrome extensions don't have Node.js modules
        "process": false,
        "buffer": false,
        "crypto": false,
        "stream": false,
        "util": false,
        "path": false,
        "fs": false
      }
    },

    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false
          }
        }
      ]
    },

    plugins: [
      // Inject environment variables from .env file
      new webpack.DefinePlugin({
        'process.env.OPENROUTER_API_KEY_PART1': JSON.stringify(process.env.OPENROUTER_API_KEY_PART1 || ''),
        'process.env.OPENROUTER_API_KEY_PART2': JSON.stringify(process.env.OPENROUTER_API_KEY_PART2 || ''),
        'process.env.OPENROUTER_API_KEY2_PART1': JSON.stringify(process.env.OPENROUTER_API_KEY2_PART1 || ''),
        'process.env.OPENROUTER_API_KEY2_PART2': JSON.stringify(process.env.OPENROUTER_API_KEY2_PART2 || ''),
        'process.env.ELEVENLABS_API_KEY': JSON.stringify(process.env.ELEVENLABS_API_KEY || '')
      }),

      // Copy static assets to dist
      new CopyPlugin({
        patterns: [
          { from: 'manifest.json', to: 'manifest.json' },
          { from: 'src/popup/*.html', to: 'popup/[name][ext]' },
          { from: 'src/popup/*.css', to: 'popup/[name][ext]' },
          { from: 'src/options/*.html', to: 'options/[name][ext]' },
          { from: 'src/options/*.css', to: 'options/[name][ext]' },
          { from: 'src/content/*.css', to: 'content/[name][ext]', noErrorOnMissing: true },
          { from: 'src/themes/styles', to: 'themes/styles', noErrorOnMissing: true },
          { from: 'icons', to: 'icons', noErrorOnMissing: true }
        ]
      })
    ],

    optimization: {
      minimize: isProduction,
      // Avoid splitting chunks for Chrome extension
      splitChunks: false
    },

    performance: {
      // Chrome extensions can be larger
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};
