/**
 * Game Boy Color specific types and constants
 */

export interface GBCMemoryMap {
  ROM_BANK_0: 0x0000;
  ROM_BANK_N: 0x4000;
  VRAM: 0x8000;
  EXTERNAL_RAM: 0xa000;
  WORK_RAM_0: 0xc000;
  WORK_RAM_N: 0xd000;
  ECHO_RAM: 0xe000;
  OAM: 0xfe00;
  IO_REGISTERS: 0xff00;
  HIGH_RAM: 0xff80;
  INTERRUPT_ENABLE: 0xffff;
}

export interface GBCRegisters {
  JOYP: 0xff00; // Joypad
  SB: 0xff01; // Serial transfer data
  SC: 0xff02; // Serial transfer control
  DIV: 0xff04; // Divider register
  TIMA: 0xff05; // Timer counter
  TMA: 0xff06; // Timer modulo
  TAC: 0xff07; // Timer control
  IF: 0xff0f; // Interrupt flag
  NR10: 0xff10; // Sound channel 1 sweep
  NR11: 0xff11; // Sound channel 1 length/wave pattern
  NR12: 0xff12; // Sound channel 1 volume envelope
  NR13: 0xff13; // Sound channel 1 frequency lo
  NR14: 0xff14; // Sound channel 1 frequency hi
  LCDC: 0xff40; // LCD control
  STAT: 0xff41; // LCD status
  SCY: 0xff42; // Scroll Y
  SCX: 0xff43; // Scroll X
  LY: 0xff44; // LCD Y coordinate
  LYC: 0xff45; // LY compare
  DMA: 0xff46; // DMA transfer
  BGP: 0xff47; // BG palette data
  OBP0: 0xff48; // Object palette 0 data
  OBP1: 0xff49; // Object palette 1 data
  WY: 0xff4a; // Window Y position
  WX: 0xff4b; // Window X position
  KEY1: 0xff4d; // CPU speed (CGB only)
  VBK: 0xff4f; // VRAM bank (CGB only)
  HDMA1: 0xff51; // HDMA source high (CGB only)
  HDMA2: 0xff52; // HDMA source low (CGB only)
  HDMA3: 0xff53; // HDMA dest high (CGB only)
  HDMA4: 0xff54; // HDMA dest low (CGB only)
  HDMA5: 0xff55; // HDMA length/mode/start (CGB only)
  BCPS: 0xff68; // Background palette specification (CGB only)
  BCPD: 0xff69; // Background palette data (CGB only)
  OCPS: 0xff6a; // Object palette specification (CGB only)
  OCPD: 0xff6b; // Object palette data (CGB only)
  SVBK: 0xff70; // WRAM bank (CGB only)
  IE: 0xffff; // Interrupt enable
}

export const GBC_CONSTANTS = {
  SCREEN_WIDTH: 160,
  SCREEN_HEIGHT: 144,
  TILE_WIDTH: 8,
  TILE_HEIGHT: 8,
  TILES_X: 20,
  TILES_Y: 18,
  SPRITE_LIMIT: 40,
  SPRITES_PER_LINE: 10,
  ROM_BANK_SIZE: 0x4000,
  RAM_BANK_SIZE: 0x2000,
  VRAM_SIZE: 0x2000,
  WRAM_SIZE: 0x1000,
  OAM_SIZE: 0xa0,
  HRAM_SIZE: 0x7f,
  MAX_ROM_BANKS: 512,
  MAX_RAM_BANKS: 16,
  CPU_SPEED_NORMAL: 4194304, // Hz
  CPU_SPEED_DOUBLE: 8388608, // Hz (CGB only)
  VBLANK_FREQUENCY: 59.7275, // Hz
} as const;

export type GBCButton = "A" | "B" | "START" | "SELECT" | "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface GBCInputState {
  a: boolean;
  b: boolean;
  start: boolean;
  select: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
