/**
 * String table generator
 * Converts string definitions to C arrays with bank management
 */

import * as fs from "fs";

export interface StringTable {
  [key: string]: string;
}

export interface BankConfig {
  bankNumber: number;
  strings: string[];
}

/**
 * Generate C code for string table
 */
export function generateStringTable(
  strings: StringTable,
  tableName: string,
  bankNumber?: number
): string {
  let output = `// Generated string table: ${tableName}\n`;
  
  if (bankNumber !== undefined) {
    output += `#pragma bank ${bankNumber}\n\n`;
  }

  // Generate string data
  const stringIds: string[] = [];
  const stringData: string[] = [];

  for (const [key, value] of Object.entries(strings)) {
    const safeKey = key.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    stringIds.push(safeKey);

    // Escape string for C
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");

    stringData.push(`"${escaped}"`);
  }

  // Generate enum for string IDs
  output += `typedef enum {\n`;
  for (let i = 0; i < stringIds.length; i++) {
    output += `  ${tableName.toUpperCase()}_${stringIds[i]} = ${i}`;
    if (i < stringIds.length - 1) output += ",";
    output += "\n";
  }
  output += `} ${tableName}_id;\n\n`;

  // Generate string array
  output += `const char* const ${tableName}_strings[] = {\n`;
  for (let i = 0; i < stringData.length; i++) {
    output += `  ${stringData[i]}`;
    if (i < stringData.length - 1) output += ",";
    output += "\n";
  }
  output += `};\n\n`;

  // Generate count constant
  output += `#define ${tableName.toUpperCase()}_COUNT ${stringIds.length}\n`;

  return output;
}

/**
 * Load strings from JSON file
 */
export function loadStringsFromJSON(filePath: string): StringTable {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

/**
 * Save strings to C file
 */
export function saveStringTableToC(
  strings: StringTable,
  tableName: string,
  outputPath: string,
  bankNumber?: number
): void {
  const code = generateStringTable(strings, tableName, bankNumber);
  fs.writeFileSync(outputPath, code, "utf-8");
  console.log(`Generated string table: ${outputPath}`);
}

/**
 * Process multiple string files with bank assignments
 */
export function processStringFiles(configs: Array<{
  inputFile: string;
  outputFile: string;
  tableName: string;
  bankNumber?: number;
}>): void {
  for (const config of configs) {
    console.log(`Processing ${config.inputFile}...`);
    
    try {
      const strings = loadStringsFromJSON(config.inputFile);
      saveStringTableToC(strings, config.tableName, config.outputFile, config.bankNumber);
    } catch (error) {
      console.error(`Error processing ${config.inputFile}:`, error);
    }
  }
}

/**
 * Calculate string table size in bytes
 */
export function calculateStringTableSize(strings: StringTable): number {
  let size = 0;
  
  for (const value of Object.values(strings)) {
    size += value.length + 1; // +1 for null terminator
  }
  
  // Add pointer array size
  size += Object.keys(strings).length * 2; // 2 bytes per pointer
  
  return size;
}

/**
 * Split strings into banks based on size
 */
export function splitIntoBanks(
  strings: StringTable,
  maxBankSize: number = 0x4000 // 16KB per bank
): BankConfig[] {
  const banks: BankConfig[] = [];
  let currentBank: BankConfig = { bankNumber: 0, strings: [] };
  let currentSize = 0;

  for (const [key, value] of Object.entries(strings)) {
    const stringSize = value.length + 1 + 2; // string + null + pointer

    if (currentSize + stringSize > maxBankSize) {
      // Start new bank
      banks.push(currentBank);
      currentBank = { bankNumber: banks.length, strings: [] };
      currentSize = 0;
    }

    currentBank.strings.push(key);
    currentSize += stringSize;
  }

  // Add last bank
  if (currentBank.strings.length > 0) {
    banks.push(currentBank);
  }

  return banks;
}
