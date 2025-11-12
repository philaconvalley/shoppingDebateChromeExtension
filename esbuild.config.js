const esbuild = require('esbuild');
const path = require('path');
require('dotenv').config();

const isWatch = process.argv.includes('--watch');

// Inject environment variables into the build
const define = {
  'process.env.OPENROUTER_API_KEY_PART1': JSON.stringify(process.env.OPENROUTER_API_KEY_PART1 || ''),
  'process.env.OPENROUTER_API_KEY_PART2': JSON.stringify(process.env.OPENROUTER_API_KEY_PART2 || ''),
  'process.env.OPENROUTER_API_KEY2_PART1': JSON.stringify(process.env.OPENROUTER_API_KEY2_PART1 || ''),
  'process.env.OPENROUTER_API_KEY2_PART2': JSON.stringify(process.env.OPENROUTER_API_KEY2_PART2 || '')
};

const buildOptions = {
  entryPoints: {
    'background': 'src/background/index.js',
    'content': 'src/content/index.js'
  },
  bundle: true,
  outdir: 'dist',
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  sourcemap: isWatch ? 'inline' : false,
  minify: !isWatch,
  logLevel: 'info',
  outExtension: { '.js': '.bundle.js' },
  define: define
};

async function build() {
  try {
    if (isWatch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('Watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
