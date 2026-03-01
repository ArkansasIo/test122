/**
 * PNG to Game Boy tile converter
 * Converts PNG images to Game Boy tile format
 */

import { PNG } from "pngjs";
import * as fs from "fs";
import * as path from "path";

export interface TileData {
  width: number;
  height: number;
  tiles: number[][];
  palette: number[];
}

/**
 * Convert PNG to Game Boy tiles
 */
export async function pngToTiles(pngPath: string): Promise<TileData> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(pngPath)
      .pipe(new PNG())
      .on("parsed", function (this: PNG) {
        const tileData = convertImageToTiles(this);
        resolve(tileData);
      })
      .on("error", reject);
  });
}

/**
 * Convert image data to tiles
 */
function convertImageToTiles(png: PNG): TileData {
  const tileWidth = 8;
  const tileHeight = 8;
  const tilesX = Math.floor(png.width / tileWidth);
  const tilesY = Math.floor(png.height / tileHeight);

  const palette: number[] = [];
  const paletteMap = new Map<number, number>();
  const tiles: number[][] = [];

  // Extract tiles
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tile: number[] = [];

      for (let y = 0; y < tileHeight; y++) {
        for (let x = 0; x < tileWidth; x++) {
          const px = tx * tileWidth + x;
          const py = ty * tileHeight + y;
          const idx = (png.width * py + px) << 2;

          const r = png.data[idx];
          const g = png.data[idx + 1];
          const b = png.data[idx + 2];
          // const a = png.data[idx + 3];

          // Convert to Game Boy color (5-5-5)
          const color = rgbToGBC(r, g, b);

          // Add to palette if not exists
          if (!paletteMap.has(color)) {
            if (palette.length >= 4) {
              console.warn("More than 4 colors in tile, using first 4");
            } else {
              paletteMap.set(color, palette.length);
              palette.push(color);
            }
          }

          const colorIndex = paletteMap.get(color) || 0;
          tile.push(colorIndex);
        }
      }

      tiles.push(tile);
    }
  }

  return {
    width: tilesX,
    height: tilesY,
    tiles: tiles,
    palette: palette,
  };
}

/**
 * Convert RGB to Game Boy Color format (15-bit)
 */
function rgbToGBC(r: number, g: number, b: number): number {
  const r5 = Math.floor((r * 31) / 255);
  const g5 = Math.floor((g * 31) / 255);
  const b5 = Math.floor((b * 31) / 255);
  return (b5 << 10) | (g5 << 5) | r5;
}

/**
 * Convert Game Boy Color to RGB
 * @internal Reserved for future use
 */
// @ts-expect-error - Reserved for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _gbcToRGB(color: number): { r: number; g: number; b: number } {
  const r5 = color & 0x1f;
  const g5 = (color >> 5) & 0x1f;
  const b5 = (color >> 10) & 0x1f;

  return {
    r: Math.floor((r5 * 255) / 31),
    g: Math.floor((g5 * 255) / 31),
    b: Math.floor((b5 * 255) / 31),
  };
}

/**
 * Export tiles to C array format
 */
export function tilesToCArray(tileData: TileData, variableName: string): string {
  let output = `// Generated tile data\n`;
  output += `// ${tileData.width}x${tileData.height} tiles\n\n`;

  // Export palette
  output += `const unsigned short ${variableName}_palette[] = {\n`;
  for (let i = 0; i < tileData.palette.length; i++) {
    output += `  0x${tileData.palette[i].toString(16).padStart(4, "0")}`;
    if (i < tileData.palette.length - 1) output += ",";
    output += "\n";
  }
  output += `};\n\n`;

  // Export tile data
  output += `const unsigned char ${variableName}_data[] = {\n`;
  for (let i = 0; i < tileData.tiles.length; i++) {
    const tile = tileData.tiles[i];
    output += `  // Tile ${i}\n`;

    // Convert tile to Game Boy 2bpp format
    for (let y = 0; y < 8; y++) {
      let byte1 = 0;
      let byte2 = 0;

      for (let x = 0; x < 8; x++) {
        const colorIndex = tile[y * 8 + x];
        if (colorIndex & 1) byte1 |= 1 << (7 - x);
        if (colorIndex & 2) byte2 |= 1 << (7 - x);
      }

      output += `  0x${byte1.toString(16).padStart(2, "0")}, 0x${byte2.toString(16).padStart(2, "0")},\n`;
    }
  }
  output += `};\n`;

  return output;
}

/**
 * Process directory of PNGs
 */
export async function processDirectory(inputDir: string, outputDir: string): Promise<void> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".png") {
      const inputPath = path.join(inputDir, file);
      const baseName = path.basename(file, ".png");
      const outputPath = path.join(outputDir, `${baseName}.c`);

      console.log(`Processing ${file}...`);

      try {
        const tileData = await pngToTiles(inputPath);
        const cCode = tilesToCArray(tileData, baseName);
        fs.writeFileSync(outputPath, cCode, "utf-8");
        console.log(`  Generated ${outputPath}`);
      } catch (error) {
        console.error(`  Error processing ${file}:`, error);
      }
    }
  }
}
