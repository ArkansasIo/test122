/* global window */
/* eslint-disable no-undef */

/**
 * project-system.js
 * Manages project folder structure and organization like GB Studio
 */

class ProjectSystem {
  constructor() {
    this.currentProject = null;
    this.recentProjects = [];
    this.projectsRoot = 'projects'; // Default projects directory
    this.loadRecentProjects();
  }

  /**
   * Create a new project with GB Studio-like structure
   */
  createProject(projectData) {
    const project = {
      id: this.generateId(),
      name: projectData.name,
      author: projectData.author || 'Unknown',
      description: projectData.description || '',
      version: '1.0.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      path: `${this.projectsRoot}/${this.sanitizeName(projectData.name)}`,
      structure: {
        src: {
          actors: [],
          backgrounds: [],
          music: [],
          sounds: [],
          sprites: [],
          tilesets: [],
          game: [] // C and ASM files
        },
        assets: {
          art: [],
          tiles: [],
          tms_tilemaps: [],
          strings: []
        },
        scenes: [],
        build: {
          obj: [], // ASM object files
          rom: []  // Built ROMs
        },
        data: [] // Generated C files
      },
      settings: {
        cartridgeType: 'GBC',
        colorMode: true,
        playerSprite: null,
        startScene: null,
        worldMapEnabled: false
      },
      stats: {
        sceneCount: 0,
        actorCount: 0,
        backgroundCount: 0,
        scriptCount: 0
      }
    };

    this.currentProject = project;
    this.addToRecentProjects(project);
    this.saveProject();
    return project;
  }

  /**
   * Open an existing project
   */
  openProject(projectPath) {
    // In a real implementation, this would load from filesystem
    // For now, we simulate it with localStorage
    try {
      const saved = localStorage.getItem(`project_${projectPath}`);
      if (saved) {
        this.currentProject = JSON.parse(saved);
        this.currentProject.modified = new Date().toISOString();
        this.addToRecentProjects(this.currentProject);
        return this.currentProject;
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Failed to open project:', error);
      return null;
    }
  }

  /**
   * Save current project
   */
  saveProject() {
    if (!this.currentProject) return;

    this.currentProject.modified = new Date().toISOString();
    
    // Save to localStorage (in production, this would save to disk)
    try {
      localStorage.setItem(
        `project_${this.currentProject.path}`,
        JSON.stringify(this.currentProject)
      );
      console.log('Project saved:', this.currentProject.name);
      return true;
    } catch (error) {
      console.error('Failed to save project:', error);
      return false;
    }
  }

  /**
   * Add file to project structure
   */
  addFile(category, subcategory, fileData) {
    if (!this.currentProject) return;

    const targetArray = this.getStructureArray(category, subcategory);
    if (targetArray) {
      const file = {
        id: this.generateId(),
        name: fileData.name,
        type: fileData.type,
        path: fileData.path,
        size: fileData.size || 0,
        created: new Date().toISOString()
      };
      targetArray.push(file);
      this.saveProject();
      return file;
    }
    return null;
  }

  /**
   * Get structure array by category and subcategory
   */
  getStructureArray(category, subcategory) {
    if (!this.currentProject) return null;

    const structure = this.currentProject.structure;
    if (structure[category]) {
      if (subcategory && structure[category][subcategory]) {
        return structure[category][subcategory];
      } else if (Array.isArray(structure[category])) {
        return structure[category];
      }
    }
    return null;
  }

  /**
   * Add scene to project
   */
  addScene(sceneData) {
    if (!this.currentProject) return;

    const scene = {
      id: this.generateId(),
      name: sceneData.name || 'New Scene',
      background: sceneData.background || null,
      actors: [],
      triggers: [],
      collisions: [],
      scripts: [],
      created: new Date().toISOString()
    };

    this.currentProject.structure.scenes.push(scene);
    this.currentProject.stats.sceneCount++;
    this.saveProject();
    return scene;
  }

  /**
   * Update project stats
   */
  updateStats() {
    if (!this.currentProject) return;

    const stats = this.currentProject.stats;
    const structure = this.currentProject.structure;

    stats.sceneCount = structure.scenes.length;
    stats.backgroundCount = structure.src.backgrounds.length;
    stats.actorCount = structure.src.actors.length;
    
    // Count scripts across all scenes
    stats.scriptCount = structure.scenes.reduce((count, scene) => {
      return count + (scene.scripts ? scene.scripts.length : 0);
    }, 0);

    this.saveProject();
  }

  /**
   * Generate game files (C and ASM)
   */
  generateGameFiles() {
    if (!this.currentProject) return null;

    const files = {
      cFiles: [],
      asmFiles: [],
      dataFiles: []
    };

    // Generate C files for each scene
    this.currentProject.structure.scenes.forEach((scene, index) => {
      files.cFiles.push({
        name: `scene_${index}.c`,
        path: `${this.currentProject.path}/src/game/scene_${index}.c`,
        content: this.generateSceneC(scene)
      });
    });

    // Generate string data files
    files.dataFiles.push({
      name: 'strings_game.bank00.c',
      path: `${this.currentProject.path}/data/strings_game.bank00.c`,
      content: this.generateStringsC()
    });

    return files;
  }

  /**
   * Generate C code for a scene
   */
  generateSceneC(scene) {
    return `// Generated scene: ${scene.name}
#include <gb/gb.h>
#include "scene.h"

void scene_${scene.id}_init() {
    // Background: ${scene.background || 'none'}
    // Actors: ${scene.actors.length}
    // Initialize scene
}

void scene_${scene.id}_update() {
    // Update logic
}
`;
  }

  /**
   * Generate strings C file
   */
  generateStringsC() {
    return `// Generated string data
#pragma bank 0
const char * const game_strings[] = {
    "Labyrinth of the Dragon",
    "Press Start"
};
`;
  }

  /**
   * Recent projects management
   */
  loadRecentProjects() {
    try {
      const saved = localStorage.getItem('recentProjects');
      this.recentProjects = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load recent projects:', error);
      this.recentProjects = [];
    }
  }

  addToRecentProjects(project) {
    // Remove if already exists
    this.recentProjects = this.recentProjects.filter(p => p.path !== project.path);
    
    // Add to front
    this.recentProjects.unshift({
      name: project.name,
      path: project.path,
      modified: project.modified,
      icon: '🎮'
    });

    // Keep only last 10
    this.recentProjects = this.recentProjects.slice(0, 10);

    // Save
    try {
      localStorage.setItem('recentProjects', JSON.stringify(this.recentProjects));
    } catch (error) {
      console.error('Failed to save recent projects:', error);
    }
  }

  getRecentProjects() {
    return this.recentProjects;
  }

  /**
   * Utilities
   */
  generateId() {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  getCurrentProject() {
    return this.currentProject;
  }

  closeProject() {
    this.currentProject = null;
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ProjectSystem = ProjectSystem;
}
