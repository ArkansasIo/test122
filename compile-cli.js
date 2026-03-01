/* eslint-disable global-require, @typescript-eslint/no-require-imports */
/**
 * Labyrinth of the Dragon - CLI Compile Tool
 * Can be packaged as .exe using pkg: npx pkg compile-cli.js
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

function log(level, message) {
  const levelColors = {
    'INFO': colors.cyan,
    'ERROR': colors.red,
    'SUCCESS': colors.green,
    'WARN': colors.yellow
  };
  
  const color = levelColors[level] || colors.reset;
  console.log(`${color}[${level}]${colors.reset} ${message}`);
}

function run(command, description) {
  try {
    log('INFO', description || `Running: ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      shell: 'cmd.exe',
      encoding: 'utf-8'
    });
    return true;
  } catch (error) {
    log('ERROR', `Failed: ${description || command}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  // Check working directory
  if (!fs.existsSync('package.json')) {
    log('ERROR', 'package.json not found. Run from project root');
    process.exit(1);
  }

  // Check dependencies
  try {
    execSync('npm --version', { stdio: 'pipe', shell: 'cmd.exe' });
  } catch {
    log('ERROR', 'npm not found. Please install Node.js');
    process.exit(1);
  }

  // Ensure dependencies
  if (!fs.existsSync('node_modules')) {
    log('INFO', 'Installing npm dependencies...');
    if (!run('npm install', 'Installing dependencies')) {
      process.exit(1);
    }
  }

  log('INFO', `Labyrinth of the Dragon Build System`);
  log('INFO', `Target: ${target}`);
  console.log('');

  let success = true;

  switch (target.toLowerCase()) {
    case 'all':
      log('INFO', 'Building all targets...');
      success = run('npm run build', 'Compiling TypeScript');
      if (success) {
        log('SUCCESS', 'TypeScript compiled');
        log('SUCCESS', 'Build complete! Outputs in ./dist and ./obj');
      }
      break;

    case 'ts':
      log('INFO', 'Compiling TypeScript only...');
      success = run('npm run build', 'Running TypeScript compiler');
      if (success) {
        log('SUCCESS', 'TypeScript compiled to ./dist');
      }
      break;

    case 'watch':
      log('INFO', 'Starting watch mode...');
      success = run('npm run build:watch', 'Watch mode');
      break;

    case 'clean':
      log('INFO', 'Cleaning build artifacts...');
      success = run('npm run clean', 'Cleaning');
      if (success) {
        log('SUCCESS', 'Clean complete');
      }
      break;

    case 'dev':
      log('INFO', 'Starting development mode...');
      success = run('npm run dev', 'Dev mode');
      break;

    case 'start':
      log('INFO', 'Building and starting...');
      success = run('npm run start', 'Start');
      break;

    case 'format':
      log('INFO', 'Formatting code...');
      success = run('npm run format', 'Code formatting');
      if (success) {
        log('SUCCESS', 'Code formatted');
      }
      break;

    case 'lint':
      log('INFO', 'Linting code...');
      success = run('npm run lint', 'Code linting');
      if (success) {
        log('SUCCESS', 'Linting complete');
      }
      break;

    case 'web':
    case 'webapp':
      log('INFO', 'Starting web development server...');
      log('INFO', 'Web IDE will be available at http://localhost:5000');
      log('INFO', 'Press Ctrl+C to stop the server');
      console.log('');
      success = run('npm run web', 'Web server');
      break;

    default:
      log('ERROR', `Unknown target: ${target}`);
      console.log('\nValid targets:');
      console.log('  all     - Build all targets');
      console.log('  ts      - Compile TypeScript only');
      console.log('  watch   - Watch mode (auto-rebuild on changes)');
      console.log('  clean   - Clean build artifacts');
      console.log('  dev     - Run in development mode');
      console.log('  start   - Build and start');
      console.log('  format  - Format code');
      console.log('  lint    - Lint code');
      console.log('  web     - Start web development server');
      process.exit(1);
  }

  if (success) {
    log('SUCCESS', 'Compilation finished successfully!');
    await organizeOutput();
    process.exit(0);
  } else {
    log('ERROR', 'Compilation failed!');
    process.exit(1);
  }
}

async function organizeOutput() {
  const outputDir = 'output';
  const subdirs = ['bin', 'builds', 'dist', 'obj', 'docs'];
  
  try {
    // Create output directory structure
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      log('INFO', `Created ${outputDir} folder`);
    }
    
    for (const subdir of subdirs) {
      const fullDir = path.join(outputDir, subdir);
      if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir, { recursive: true });
      }
    }
    
    // Move compile.exe to output/bin
    if (fs.existsSync('compile.exe')) {
      const destExe = path.join(outputDir, 'bin', 'compile.exe');
      fs.copyFileSync('compile.exe', destExe);
      log('SUCCESS', `Copied compile.exe to ${destExe}`);
    }
    
    // Move .gbc files to output/builds
    const gbcFiles = fs.readdirSync('.').filter(f => f.endsWith('.gbc') || f.endsWith('.gb'));
    for (const file of gbcFiles) {
      const dest = path.join(outputDir, 'builds', file);
      fs.copyFileSync(file, dest);
      log('INFO', `Copied ${file} to output/builds/`);
    }
    
    // Move documentation to output/docs
    const docFiles = fs.readdirSync('.').filter(f => f.endsWith('.md') && !f.includes('node_modules'));
    for (const file of docFiles.slice(0, 10)) { // Limit to first 10 docs
      const dest = path.join(outputDir, 'docs', file);
      fs.copyFileSync(file, dest);
    }
    log('SUCCESS', `Organized files in ${outputDir}/`);
  } catch (error) {
    log('WARN', `Could not organize output: ${error.message}`);
  }
}

main().catch(err => {
  log('ERROR', err.message);
  process.exit(1);
});
