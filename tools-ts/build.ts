/**
 * Build system utilities
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export interface BuildConfig {
  srcDir: string;
  dataDir: string;
  objDir: string;
  outputFile: string;
  compiler: string;
  linker: string;
  compilerFlags: string[];
  linkerFlags: string[];
}

/**
 * Default build configuration
 */
export const DEFAULT_BUILD_CONFIG: BuildConfig = {
  srcDir: "./src",
  dataDir: "./data",
  objDir: "./obj",
  outputFile: "./LabyrinthOfTheDragon.gbc",
  compiler: "sdcc",
  linker: "sdcc",
  compilerFlags: [
    "-c",
    "-mgbz80",
    "--opt-code-speed",
    "--max-allocs-per-node",
    "50000",
  ],
  linkerFlags: [
    "-mgbz80",
    "--no-std-crt0",
    "--data-loc",
    "0xC0A0",
  ],
};

/**
 * Get all C files from directory
 */
export function getCFiles(directory: string): string[] {
  const files: string[] = [];

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && path.extname(entry.name) === ".c") {
        files.push(fullPath);
      }
    }
  }

  scan(directory);
  return files;
}

/**
 * Compile a C file to object file
 */
export function compileFile(
  sourceFile: string,
  outputFile: string,
  config: BuildConfig
): boolean {
  const flags = config.compilerFlags.join(" ");
  const command = `${config.compiler} ${flags} -o ${outputFile} ${sourceFile}`;

  console.log(`Compiling ${sourceFile}...`);

  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`Failed to compile ${sourceFile}`);
    return false;
  }
}

/**
 * Link object files
 */
export function linkObjects(
  objectFiles: string[],
  outputFile: string,
  config: BuildConfig
): boolean {
  const flags = config.linkerFlags.join(" ");
  const objects = objectFiles.join(" ");
  const command = `${config.linker} ${flags} -o ${outputFile} ${objects}`;

  console.log("Linking...");

  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error("Linking failed");
    return false;
  }
}

/**
 * Build project
 */
export function buildProject(config: BuildConfig = DEFAULT_BUILD_CONFIG): boolean {
  console.log("Starting build...");

  // Ensure output directory exists
  if (!fs.existsSync(config.objDir)) {
    fs.mkdirSync(config.objDir, { recursive: true });
  }

  // Get all source files
  const srcFiles = getCFiles(config.srcDir);
  const dataFiles = getCFiles(config.dataDir);
  const allFiles = [...srcFiles, ...dataFiles];

  console.log(`Found ${allFiles.length} source files`);

  // Compile all files
  const objectFiles: string[] = [];
  let compileFailed = false;

  for (const srcFile of allFiles) {
    const baseName = path.basename(srcFile, ".c");
    const objFile = path.join(config.objDir, `${baseName}.o`);

    if (!compileFile(srcFile, objFile, config)) {
      compileFailed = true;
      break;
    }

    objectFiles.push(objFile);
  }

  if (compileFailed) {
    console.error("Build failed during compilation");
    return false;
  }

  // Link
  if (!linkObjects(objectFiles, config.outputFile, config)) {
    console.error("Build failed during linking");
    return false;
  }

  console.log(`Build successful: ${config.outputFile}`);
  return true;
}

/**
 * Clean build artifacts
 */
export function cleanBuild(config: BuildConfig = DEFAULT_BUILD_CONFIG): void {
  console.log("Cleaning build artifacts...");

  if (fs.existsSync(config.objDir)) {
    fs.rmSync(config.objDir, { recursive: true, force: true });
    console.log(`Removed ${config.objDir}`);
  }

  if (fs.existsSync(config.outputFile)) {
    fs.unlinkSync(config.outputFile);
    console.log(`Removed ${config.outputFile}`);
  }

  console.log("Clean complete");
}

/**
 * Watch for file changes and rebuild
 */
export function watchBuild(
  config: BuildConfig = DEFAULT_BUILD_CONFIG,
  directories: string[] = []
): void {
  const watchDirs = directories.length > 0 ? directories : [config.srcDir, config.dataDir];

  console.log(`Watching directories: ${watchDirs.join(", ")}`);
  console.log("Press Ctrl+C to stop");

  let building = false;

  for (const dir of watchDirs) {
    fs.watch(dir, { recursive: true }, (_eventType, filename) => {
      if (building) return;
      if (!filename || !filename.endsWith(".c")) return;

      console.log(`\nFile changed: ${filename}`);
      building = true;

      setTimeout(() => {
        buildProject(config);
        building = false;
      }, 100);
    });
  }
}

/**
 * Generate Makefile
 */
export function generateMakefile(config: BuildConfig = DEFAULT_BUILD_CONFIG): string {
  let makefile = `# Generated Makefile for Labyrinth of the Dragon\n\n`;

  makefile += `CC = ${config.compiler}\n`;
  makefile += `LD = ${config.linker}\n`;
  makefile += `CFLAGS = ${config.compilerFlags.join(" ")}\n`;
  makefile += `LDFLAGS = ${config.linkerFlags.join(" ")}\n\n`;

  makefile += `SRC_DIR = ${config.srcDir}\n`;
  makefile += `DATA_DIR = ${config.dataDir}\n`;
  makefile += `OBJ_DIR = ${config.objDir}\n`;
  makefile += `OUTPUT = ${config.outputFile}\n\n`;

  makefile += `SRC_FILES = $(wildcard $(SRC_DIR)/*.c)\n`;
  makefile += `DATA_FILES = $(wildcard $(DATA_DIR)/*.c)\n`;
  makefile += `ALL_SRC = $(SRC_FILES) $(DATA_FILES)\n`;
  makefile += `OBJ_FILES = $(patsubst %.c,$(OBJ_DIR)/%.o,$(notdir $(ALL_SRC)))\n\n`;

  makefile += `.PHONY: all clean\n\n`;

  makefile += `all: $(OUTPUT)\n\n`;

  makefile += `$(OUTPUT): $(OBJ_FILES)\n`;
  makefile += `\t$(LD) $(LDFLAGS) -o $@ $^\n\n`;

  makefile += `$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)\n`;
  makefile += `\t$(CC) $(CFLAGS) -o $@ $<\n\n`;

  makefile += `$(OBJ_DIR)/%.o: $(DATA_DIR)/%.c | $(OBJ_DIR)\n`;
  makefile += `\t$(CC) $(CFLAGS) -o $@ $<\n\n`;

  makefile += `$(OBJ_DIR):\n`;
  makefile += `\tmkdir -p $(OBJ_DIR)\n\n`;

  makefile += `clean:\n`;
  makefile += `\trm -rf $(OBJ_DIR) $(OUTPUT)\n`;

  return makefile;
}

/**
 * Save generated Makefile
 */
export function saveMakefile(
  outputPath: string = "./Makefile",
  config: BuildConfig = DEFAULT_BUILD_CONFIG
): void {
  const makefile = generateMakefile(config);
  fs.writeFileSync(outputPath, makefile, "utf-8");
  console.log(`Generated Makefile: ${outputPath}`);
}
