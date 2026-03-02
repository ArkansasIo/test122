/**
 * Audio System
 * Manages music, sound effects, and audio playback with volume control
 */
/* global Audio */

class AudioTrack {
  constructor(name, url, type = 'sfx') {
    this.name = name;
    this.url = url;
    this.type = type; // 'music' or 'sfx'
    this.audio = new Audio(url);
    this.audio.preload = 'auto';
    this.volume = 1.0;
    this.playing = false;
    this.currentTime = 0;
    this.duration = 0;
    this.loop = type === 'music';
  }

  play(volume = 1.0) {
    this.volume = volume;
    this.audio.volume = volume;
    this.audio.loop = this.loop;
    this.audio.currentTime = 0;
    this.audio.play().catch(e => console.log('Audio play error:', e));
    this.playing = true;
  }

  pause() {
    this.audio.pause();
    this.playing = false;
  }

  resume() {
    this.audio.play().catch(e => console.log('Audio play error:', e));
    this.playing = true;
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.playing = false;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this.volume;
  }

  getVolume() {
    return this.volume;
  }

  getCurrentTime() {
    return this.audio.currentTime;
  }

  setCurrentTime(time) {
    this.audio.currentTime = time;
  }

  getDuration() {
    return this.audio.duration;
  }

  isPlaying() {
    return this.playing && !this.audio.paused;
  }

  serialize() {
    return {
      name: this.name,
      url: this.url,
      type: this.type,
      volume: this.volume,
      loop: this.loop
    };
  }
}

class AudioMixer {
  constructor() {
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.branches = {
      master: 1.0,
      music: 0.7,
      sfx: 0.8,
      UI: 0.6,
      ambient: 0.5
    };
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setBranchVolume(branch, volume) {
    volume = Math.max(0, Math.min(1, volume));
    this.branches[branch] = volume;
  }

  getVolume(branch = 'master') {
    if (branch === 'master') return this.masterVolume;
    let volume = this.branches[branch] || 1.0;
    return volume * this.masterVolume;
  }

  mute() {
    this.masterVolume = 0;
  }

  unmute() {
    this.masterVolume = 1.0;
  }

  serialize() {
    return {
      masterVolume: this.masterVolume,
      branches: { ...this.branches }
    };
  }
}

class AudioSystem {
  constructor() {
    this.tracks = new Map();
    this.currentTrack = null;
    this.mixer = new AudioMixer();
    this.soundQueue = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  addTrack(name, url, type = 'sfx') {
    const track = new AudioTrack(name, url, type);
    this.tracks.set(name, track);
    return track;
  }

  playMusic(name, _fadeInTime = 1.0) {
    if (!this.tracks.has(name)) {
      console.warn(`Music track not found: ${name}`);
      return;
    }

    if (this.currentTrack && this.currentTrack.isPlaying()) {
      this.currentTrack.stop();
    }

    const track = this.tracks.get(name);
    track.loop = true;
    track.play(this.mixer.getVolume('music'));
    this.currentTrack = track;
  }

  stopMusic(_fadeOutTime = 1.0) {
    if (this.currentTrack) {
      this.currentTrack.stop();
      this.currentTrack = null;
    }
  }

  pauseMusic() {
    if (this.currentTrack) {
      this.currentTrack.pause();
    }
  }

  resumeMusic() {
    if (this.currentTrack) {
      this.currentTrack.resume();
    }
  }

  playSFX(name, volume = 1.0) {
    if (!this.tracks.has(name)) {
      console.warn(`Sound effect not found: ${name}`);
      return;
    }

    const track = this.tracks.get(name);
    const finalVolume = volume * this.mixer.getVolume('sfx');
    track.loop = false;
    track.play(finalVolume);
  }

  playUISound(name, volume = 1.0) {
    if (!this.tracks.has(name)) {
      console.warn(`UI sound not found: ${name}`);
      return;
    }

    const track = this.tracks.get(name);
    const finalVolume = volume * this.mixer.getVolume('UI');
    track.loop = false;
    track.play(finalVolume);
  }

  playAmbient(name, volume = 1.0) {
    if (!this.tracks.has(name)) {
      console.warn(`Ambient sound not found: ${name}`);
      return;
    }

    const track = this.tracks.get(name);
    const finalVolume = volume * this.mixer.getVolume('ambient');
    track.loop = true;
    track.play(finalVolume);
  }

  stopAllSFX() {
    for (let [, track] of this.tracks) {
      if (track.type === 'sfx' && track.isPlaying()) {
        track.stop();
      }
    }
  }

  stopAllSounds() {
    for (let [, track] of this.tracks) {
      if (track.isPlaying()) {
        track.stop();
      }
    }
  }

  setTrackVolume(name, volume) {
    if (this.tracks.has(name)) {
      this.tracks.get(name).setVolume(volume);
    }
  }

  getTrackVolume(name) {
    if (this.tracks.has(name)) {
      return this.tracks.get(name).getVolume();
    }
    return 0;
  }

  getTrack(name) {
    return this.tracks.get(name);
  }

  getAllTracks() {
    return Array.from(this.tracks.values());
  }

  getPlayingTracks() {
    const playing = [];
    for (let [name, track] of this.tracks) {
      if (track.isPlaying()) {
        playing.push({ name, track });
      }
    }
    return playing;
  }

  setMasterVolume(volume) {
    this.mixer.setMasterVolume(volume);
    for (let track of this.tracks.values()) {
      if (track.isPlaying()) {
        track.setVolume(track.volume);
      }
    }
  }

  getMasterVolume() {
    return this.mixer.masterVolume;
  }

  setBranchVolume(branch, volume) {
    this.mixer.setBranchVolume(branch, volume);
  }

  getBranchVolume(branch) {
    return this.mixer.getBranchVolume(branch);
  }

  mute() {
    this.mixer.mute();
  }

  unmute() {
    this.mixer.unmute();
  }

  serialize() {
    return {
      tracks: Array.from(this.tracks.entries()).map(([name, track]) => [name, track.serialize()]),
      mixer: this.mixer.serialize(),
      version: '1.0'
    };
  }

  static deserialize(data) {
    const system = new AudioSystem();
    system.mixer = new AudioMixer();
    if (data.mixer) {
      system.mixer.masterVolume = data.mixer.masterVolume;
      Object.assign(system.mixer.branches, data.mixer.branches);
    }
    return system;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioTrack, AudioMixer, AudioSystem };
}
