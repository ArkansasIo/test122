/**
 * GB Studio Music Tracker - Simple Game Boy music composition tool
 */

/* eslint-disable no-undef */
/* global window, document */

(function(window) {
  'use strict';

  // Note and octave constants for future use
  // const NOTES = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
  // const OCTAVES = [2, 3, 4, 5, 6, 7];
  
  /**
   * Music Tracker - Pattern-based music editor
   */
  class MusicTracker {
    constructor(containerId, project) {
      this.container = document.getElementById(containerId);
      this.project = project;
      this.currentMusic = null;
      this.currentRow = 0;
      this.currentChannel = 0;
      this.pattern = [];
      this.isPlaying = false;
      
      // Initialize empty pattern (64 rows, 4 channels)
      for (let i = 0; i < 64; i++) {
        this.pattern.push([
          { note: '---', octave: '-', instrument: '00', volume: 'F', effect: '---' },
          { note: '---', octave: '-', instrument: '00', volume: 'F', effect: '---' },
          { note: '---', octave: '-', instrument: '00', volume: 'F', effect: '---' },
          { note: '---', octave: '-', instrument: '00', volume: 'F', effect: '---' }
        ]);
      }
      
      this.init();
    }
    
    init() {
      this.render();
      this.attachEvents();
    }
    
    setMusic(musicId) {
      this.currentMusic = this.project.getAssetById(musicId);
      if (this.currentMusic && this.currentMusic.data) {
        try {
          this.pattern = JSON.parse(this.currentMusic.data);
        } catch(e) {
          console.warn('Failed to load music data');
        }
      }
      this.render();
    }
    
    render() {
      if (!this.currentMusic) {
        this.container.innerHTML = `
          <div class="music-tracker">
            <div class="prop-empty">
              <div style="font-size:48px;margin-bottom:12px;">🎵</div>
              <div>Select a music track to edit</div>
            </div>
          </div>
        `;
        return;
      }
      
      this.container.innerHTML = `
        <div class="music-tracker">
          <div class="tracker-toolbar">
            <button class="scene-tool-btn" id="playMusicBtn">
              ${this.isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button class="scene-tool-btn" id="stopMusicBtn">⏹️ Stop</button>
            <button class="scene-tool-btn" id="clearPatternBtn">🗑️ Clear</button>
            
            <div style="flex:1"></div>
            
            <span style="color:var(--text2);font-size:11px;">BPM:</span>
            <input type="number" value="120" min="60" max="240" 
                   style="width:60px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border);border-radius:3px;color:var(--text);margin:0 8px;" />
            
            <button class="scene-tool-btn" id="saveMusicBtn">💾 Save</button>
          </div>
          
          <div class="tracker-pattern">
            ${this.renderPattern()}
          </div>
          
          <div class="tracker-piano">
            ${this.renderPiano()}
          </div>
        </div>
      `;
      
      this.attachTrackerEvents();
    }
    
    renderPattern() {
      return `
        <div style="font-family:'Courier New',monospace;font-size:11px;line-height:1.4">
          <div style="display:flex;padding:8px;background:var(--bg2);border-bottom:1px solid var(--border);font-weight:600;">
            <div style="width:40px;text-align:right;padding-right:12px;color:var(--text2);">Row</div>
            <div style="width:100px;padding:0 8px;border-left:1px solid var(--border);">Channel 1 (Square)</div>
            <div style="width:100px;padding:0 8px;border-left:1px solid var(--border);">Channel 2 (Square)</div>
            <div style="width:100px;padding:0 8px;border-left:1px solid var(--border);">Channel 3 (Wave)</div>
            <div style="width:100px;padding:0 8px;border-left:1px solid var(--border);">Channel 4 (Noise)</div>
          </div>
          <div style="overflow-y:auto;max-height:400px;">
            ${this.pattern.map((row, rowIdx) => `
              <div class="tracker-row ${rowIdx === this.currentRow ? 'current' : ''}" data-row="${rowIdx}">
                <div class="tracker-row-num">${rowIdx.toString(16).toUpperCase().padStart(2, '0')}</div>
                ${row.map((cell, channelIdx) => `
                  <div class="tracker-channel" data-channel="${channelIdx}">
                    <span class="${cell.note !== '---' ? 'note-active' : ''}" style="color:${this.getNoteColor(cell.note)}">${cell.note}</span>
                    <span>${cell.octave}</span>
                    <span style="color:var(--text2)">${cell.instrument}</span>
                    <span style="color:#58a6ff">${cell.volume}</span>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    getNoteColor(note) {
      if (note === '---') return 'var(--text2)';
      if (note.includes('#')) return '#ffeb3b';
      return '#3fb950';
    }
    
    renderPiano() {
      const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const blackKeys = { 1: 'C#', 2: 'D#', 4: 'F#', 5: 'G#', 6: 'A#' };
      
      return `
        <div style="display:flex;align-items:flex-end;height:100%;padding:8px;gap:2px;">
          ${whiteKeys.map((key, idx) => `
            <div style="position:relative;flex:1;">
              <button class="piano-key" data-note="${key}-" data-octave="4">
                <div style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:10px;color:#000;">
                  ${key}
                </div>
              </button>
              ${blackKeys[idx] ? `
                <button class="piano-key black" data-note="${blackKeys[idx]}" data-octave="4"
                        style="position:absolute;top:0;left:70%;transform:translateX(-50%);width:60%;z-index:1;">
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    attachTrackerEvents() {
      // Play/Pause
      const playBtn = document.getElementById('playMusicBtn');
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          this.isPlaying = !this.isPlaying;
          if (this.isPlaying) {
            this.play();
          } else {
            this.pause();
          }
          this.render();
        });
      }
      
      // Stop
      const stopBtn = document.getElementById('stopMusicBtn');
      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          this.stop();
        });
      }
      
      // Clear pattern
      const clearBtn = document.getElementById('clearPatternBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (confirm('Clear entire pattern?')) {
            this.clearPattern();
          }
        });
      }
      
      // Save
      const saveBtn = document.getElementById('saveMusicBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.save();
        });
      }
      
      // Piano keys
      document.querySelectorAll('.piano-key').forEach(key => {
        key.addEventListener('mousedown', () => {
          const note = key.dataset.note;
          const octave = key.dataset.octave;
          this.insertNote(note, octave);
          this.playSound(note, octave);
        });
      });
      
      // Pattern rows
      document.querySelectorAll('.tracker-row').forEach(row => {
        row.addEventListener('click', (e) => {
          const rowIdx = parseInt(row.dataset.row);
          this.currentRow = rowIdx;
          
          const channel = e.target.closest('.tracker-channel');
          if (channel) {
            this.currentChannel = parseInt(channel.dataset.channel);
          }
          
          this.render();
        });
      });
      
      // Keyboard input
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        this.handleKeyInput(e);
      });
    }
    
    handleKeyInput(e) {
      const keyToNote = {
        'z': 'C-', 's': 'C#', 'x': 'D-', 'd': 'D#', 'c': 'E-',
        'v': 'F-', 'g': 'F#', 'b': 'G-', 'h': 'G#', 'n': 'A-', 'j': 'A#', 'm': 'B-'
      };
      
      const note = keyToNote[e.key.toLowerCase()];
      if (note) {
        e.preventDefault();
        this.insertNote(note, '4');
        this.playSound(note, '4');
        this.currentRow = (this.currentRow + 1) % 64;
        this.render();
      }
      
      // Arrow keys
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.currentRow = Math.max(0, this.currentRow - 1);
        this.render();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.currentRow = Math.min(63, this.currentRow + 1);
        this.render();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.currentChannel = Math.max(0, this.currentChannel - 1);
        this.render();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.currentChannel = Math.min(3, this.currentChannel + 1);
        this.render();
      }
      
      // Delete note
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.deleteNote();
      }
    }
    
    insertNote(note, octave) {
      const cell = this.pattern[this.currentRow][this.currentChannel];
      cell.note = note;
      cell.octave = octave;
      cell.volume = 'F';
    }
    
    deleteNote() {
      const cell = this.pattern[this.currentRow][this.currentChannel];
      cell.note = '---';
      cell.octave = '-';
      cell.volume = 'F';
      this.render();
    }
    
    clearPattern() {
      for (let i = 0; i < 64; i++) {
        for (let j = 0; j < 4; j++) {
          this.pattern[i][j] = {
            note: '---',
            octave: '-',
            instrument: '00',
            volume: 'F',
            effect: '---'
          };
        }
      }
      this.render();
    }
    
    playSound(note, octave) {
      // Simple Web Audio API implementation for preview
      if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const freq = this.noteToFrequency(note, octave);
      const osc = window.audioContext.createOscillator();
      const gain = window.audioContext.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      
      osc.connect(gain);
      gain.connect(window.audioContext.destination);
      
      osc.start();
      setTimeout(() => osc.stop(), 200);
    }
    
    noteToFrequency(note, octave) {
      const noteMap = {
        'C-': 0, 'C#': 1, 'D-': 2, 'D#': 3, 'E-': 4, 'F-': 5,
        'F#': 6, 'G-': 7, 'G#': 8, 'A-': 9, 'A#': 10, 'B-': 11
      };
      
      const semitone = noteMap[note];
      if (semitone === undefined) return 440;
      
      const oct = parseInt(octave) || 4;
      return 440 * Math.pow(2, (oct - 4) + (semitone - 9) / 12);
    }
    
    play() {
      // Implement playback
      console.log('▶️ Playing music...');
    }
    
    pause() {
      console.log('⏸️ Paused');
    }
    
    stop() {
      this.isPlaying = false;
      this.currentRow = 0;
      this.render();
      console.log('⏹️ Stopped');
    }
    
    save() {
      if (!this.currentMusic) return;
      
      this.currentMusic.data = JSON.stringify(this.pattern);
      console.log('💾 Music saved:', this.currentMusic.name);
      alert('Music track saved!');
    }
    
    attachEvents() {
      // Additional event handlers
    }
  }
  
  // Export to global scope
  window.GBStudio = window.GBStudio || {};
  window.GBStudio.MusicTracker = MusicTracker;
  
})(window);
