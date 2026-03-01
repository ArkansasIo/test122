/**
 * Tools entry point
 * Re-exports all build tools
 */

export * from "./png-to-tiles";
export * from "./string-generator";
export * from "./map-converter";
export * from "./build";

import { processDirectory as processPngDirectory } from "./png-to-tiles";
import {
  loadStringsFromJSON,
  saveStringTableToC,
} from "./string-generator";
import {
  processMapDirectory,
} from "./map-converter";
import {
  buildProject,
  cleanBuild,
  watchBuild,
  saveMakefile,
} from "./build";

/**
 * Command-line interface for tools
 */
export function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "build":
      console.log("Building project...");
      buildProject();
      break;

    case "clean":
      console.log("Cleaning build artifacts...");
      cleanBuild();
      break;

    case "watch":
      console.log("Starting watch mode...");
      watchBuild();
      break;

    case "makefile":
      console.log("Generating Makefile...");
      saveMakefile();
      break;

    case "convert-png":
      if (args.length < 3) {
        console.error("Usage: convert-png <input-dir> <output-dir>");
        process.exit(1);
      }
      processPngDirectory(args[1], args[2]);
      break;

    case "convert-map":
      if (args.length < 3) {
        console.error("Usage: convert-map <input-dir> <output-dir>");
        process.exit(1);
      }
      processMapDirectory(args[1], args[2]);
      break;

    case "generate-strings": {
      if (args.length < 4) {
        console.error("Usage: generate-strings <input-json> <output-c> <table-name> [bank]");
        process.exit(1);
      }
      const strings = loadStringsFromJSON(args[1]);
      const bankNum = args[4] ? parseInt(args[4]) : undefined;
      saveStringTableToC(strings, args[3], args[2], bankNum);
      break;
    }

    case "help":
    default:
      console.log(`
Labyrinth of the Dragon - Build Tools

Usage: npm run tools <command> [options]

Commands:
  build              Build the project
  clean              Clean build artifacts
  watch              Watch for changes and rebuild
  makefile           Generate Makefile
  convert-png        Convert PNG images to tiles
  convert-map        Convert map JSON to C format
  generate-strings   Generate string tables from JSON
  help               Show this help message

Examples:
  npm run tools build
  npm run tools convert-png ./assets/tiles ./data
  npm run tools convert-map ./res/maps ./data
  npm run tools generate-strings ./assets/strings.json ./data/strings.c strings 0
      `);
      break;
  }
}

// Run CLI if this is the main module
if (require.main === module) {
  runCLI();
}
