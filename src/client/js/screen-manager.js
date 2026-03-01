/* global window, document */
/* eslint-disable no-undef */

/**
 * screen-manager.js
 * Manages splash screen, project manager, and title screen flow
 */

class ScreenManager {
  constructor() {
    this.projectSystem = null;
    this.currentScreen = null;
    
    this.screens = {
      splash: null,
      projectManager: null,
      titleScreen: null,
      editor: null
    };

    this.initializeScreens();
  }

  /**
   * Initialize all screen elements
   */
  initializeScreens() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createScreens());
    } else {
      this.createScreens();
    }
  }

  /**
   * Create screen elements
   */
  createScreens() {
    this.createSplashScreen();
    this.createProjectManagerScreen();
    this.createTitleScreen();
    this.screens.editor = document.getElementById('app');
  }

  /**
   * Create splash screen
   */
  createSplashScreen() {
    const splash = document.createElement('div');
    splash.className = 'splash-screen';
    splash.id = 'splashScreen';
    splash.innerHTML = `
      <div class="splash-logo">🐉</div>
      <div class="splash-title">Enchantment Engine</div>
      <div class="splash-subtitle">Game Boy Color Development Studio</div>
      <div class="splash-loader">
        <div class="splash-loader-bar"></div>
      </div>
      <div class="splash-version">Version 1.0.0 | March 2026</div>
    `;
    document.body.appendChild(splash);
    this.screens.splash = splash;
  }

  /**
   * Create project manager screen
   */
  createProjectManagerScreen() {
    const pm = document.createElement('div');
    pm.className = 'project-manager-screen';
    pm.id = 'projectManager';
    pm.innerHTML = `
      <div class="pm-header">
        <div class="pm-header-logo">🐉</div>
        <div class="pm-header-text">
          <h1>Enchantment Engine</h1>
          <p>Create amazing Game Boy Color games with visual tools</p>
        </div>
      </div>
      
      <div class="pm-content">
        <div class="pm-sidebar">
          <button class="pm-button primary" id="pmNewProject">
            <span class="pm-button-icon">✨</span>
            <span>New Project</span>
          </button>
          <button class="pm-button" id="pmOpenProject">
            <span class="pm-button-icon">📂</span>
            <span>Open Project</span>
          </button>
          <button class="pm-button" id="pmImportProject">
            <span class="pm-button-icon">📥</span>
            <span>Import Project</span>
          </button>
          <button class="pm-button" id="pmExamples">
            <span class="pm-button-icon">🎮</span>
            <span>Example Projects</span>
          </button>
        </div>
        
        <div class="pm-main">
          <div class="pm-section">
            <div class="pm-section-title">Recent Projects</div>
            <div class="pm-recent-projects" id="pmRecentList">
              <div class="pm-empty-state">
                <div class="pm-empty-icon">📦</div>
                <div class="pm-empty-text">No recent projects</div>
                <div style="color: var(--text2); font-size: 14px;">Create a new project to get started</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pm-footer">
        <div>© 2026 Enchantment Engine | Game Boy is a trademark of Nintendo</div>
        <div>Press Ctrl+Q to quit</div>
      </div>
    `;
    document.body.appendChild(pm);
    this.screens.projectManager = pm;
    this.setupProjectManagerEvents();
  }

  /**
   * Create new project dialog
   */
  createNewProjectDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'pm-dialog-overlay';
    dialog.id = 'pmNewProjectDialog';
    dialog.innerHTML = `
      <div class="pm-dialog">
        <div class="pm-dialog-title">Create New Project</div>
        <form id="pmNewProjectForm">
          <div class="pm-form-group">
            <label class="pm-form-label">Project Name</label>
            <input type="text" class="pm-form-input" id="pmProjectName" 
                   placeholder="My Game Boy Game" required />
          </div>
          <div class="pm-form-group">
            <label class="pm-form-label">Author</label>
            <input type="text" class="pm-form-input" id="pmProjectAuthor" 
                   placeholder="Your Name" />
          </div>
          <div class="pm-form-group">
            <label class="pm-form-label">Description</label>
            <input type="text" class="pm-form-input" id="pmProjectDesc" 
                   placeholder="A fun adventure game" />
          </div>
          <div class="pm-dialog-actions">
            <button type="button" class="pm-dialog-button cancel" id="pmCancelNew">Cancel</button>
            <button type="submit" class="pm-dialog-button create">Create Project</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(dialog);
    return dialog;
  }

  /**
   * Setup project manager event handlers
   */
  setupProjectManagerEvents() {
    const pmNewBtn = document.getElementById('pmNewProject');
    const pmOpenBtn = document.getElementById('pmOpenProject');
    const pmImportBtn = document.getElementById('pmImportProject');
    const pmExamplesBtn = document.getElementById('pmExamples');

    if (pmNewBtn) {
      pmNewBtn.addEventListener('click', () => this.showNewProjectDialog());
    }

    if (pmOpenBtn) {
      pmOpenBtn.addEventListener('click', () => this.openProjectDialog());
    }

    if (pmImportBtn) {
      pmImportBtn.addEventListener('click', () => this.importProjectDialog());
    }

    if (pmExamplesBtn) {
      pmExamplesBtn.addEventListener('click', () => this.showExampleProjects());
    }
  }

  /**
   * Show new project dialog
   */
  showNewProjectDialog() {
    let dialog = document.getElementById('pmNewProjectDialog');
    if (!dialog) {
      dialog = this.createNewProjectDialog();
    }

    dialog.classList.add('active');

    const form = document.getElementById('pmNewProjectForm');
    const cancelBtn = document.getElementById('pmCancelNew');

    // Cancel button
    cancelBtn.onclick = () => {
      dialog.classList.remove('active');
    };

    // Form submission
    form.onsubmit = (e) => {
      e.preventDefault();
      
      const projectData = {
        name: document.getElementById('pmProjectName').value,
        author: document.getElementById('pmProjectAuthor').value,
        description: document.getElementById('pmProjectDesc').value
      };

      this.createNewProject(projectData);
      dialog.classList.remove('active');
      form.reset();
    };

    // Close on background click
    dialog.onclick = (e) => {
      if (e.target === dialog) {
        dialog.classList.remove('active');
      }
    };
  }

  /**
   * Create new project
   */
  createNewProject(projectData) {
    if (!this.projectSystem) {
      this.projectSystem = new window.ProjectSystem();
    }

    const project = this.projectSystem.createProject(projectData);
    console.log('Project created:', project);
    
    this.updateRecentProjectsList();
    this.showTitleScreen(project);
  }

  /**
   * Open project dialog (simplified for demo)
   */
  openProjectDialog() {
    if (!this.projectSystem) {
      this.projectSystem = new window.ProjectSystem();
    }

    const recent = this.projectSystem.getRecentProjects();
    if (recent.length > 0) {
      const project = this.projectSystem.openProject(recent[0].path);
      if (project) {
        this.showTitleScreen(project);
      }
    } else {
      alert('No projects found. Create a new project first.');
    }
  }

  /**
   * Import project dialog
   */
  importProjectDialog() {
    alert('Import Project\n\nThis feature allows you to import existing Game Boy projects.\nComing soon!');
  }

  /**
   * Show example projects
   */
  showExampleProjects() {
    if (!this.projectSystem) {
      this.projectSystem = new window.ProjectSystem();
    }

    // Create example project
    const exampleProject = this.projectSystem.createProject({
      name: 'Example RPG Adventure',
      author: 'Enchantment Engine',
      description: 'A sample RPG game demonstrating the engine features'
    });

    // Add some demo content
    exampleProject.structure.scenes.push({
      id: 'scene_start',
      name: 'Starting Village',
      background: 'village_bg',
      actors: ['player', 'npc_elder'],
      triggers: [],
      collisions: []
    });

    this.projectSystem.saveProject();
    this.updateRecentProjectsList();
    this.showTitleScreen(exampleProject);
  }

  /**
   * Update recent projects list
   */
  updateRecentProjectsList() {
    if (!this.projectSystem) return;

    const list = document.getElementById('pmRecentList');
    if (!list) return;

    const recent = this.projectSystem.getRecentProjects();
    
    if (recent.length === 0) {
      list.innerHTML = `
        <div class="pm-empty-state">
          <div class="pm-empty-icon">📦</div>
          <div class="pm-empty-text">No recent projects</div>
          <div style="color: var(--text2); font-size: 14px;">Create a new project to get started</div>
        </div>
      `;
      return;
    }

    list.innerHTML = recent.map(project => `
      <div class="pm-project-card" data-path="${project.path}">
        <div class="pm-project-icon">${project.icon}</div>
        <div class="pm-project-info">
          <div class="pm-project-name">${project.name}</div>
          <div class="pm-project-path">${project.path}</div>
          <div class="pm-project-meta">Modified: ${new Date(project.modified).toLocaleDateString()}</div>
        </div>
      </div>
    `).join('');

    // Add click handlers
    list.querySelectorAll('.pm-project-card').forEach(card => {
      card.addEventListener('click', () => {
        const path = card.getAttribute('data-path');
        const project = this.projectSystem.openProject(path);
        if (project) {
          this.showTitleScreen(project);
        }
      });
    });
  }

  /**
   * Create title screen
   */
  createTitleScreen() {
    const title = document.createElement('div');
    title.className = 'title-screen';
    title.id = 'titleScreen';
    title.innerHTML = `
      <div class="title-content">
        <div class="title-icon">🐉</div>
        <div class="title-game-name" id="titleGameName">My Game</div>
        <div class="title-project-info" id="titleProjectInfo">Loading project...</div>
        
        <div class="title-actions">
          <button class="title-button primary" id="titleOpenEditor">Open Editor</button>
          <button class="title-button secondary" id="titleBackToProjects">Back to Projects</button>
        </div>
        
        <div class="title-project-stats">
          <div class="title-stat">
            <div class="title-stat-value" id="titleSceneCount">0</div>
            <div class="title-stat-label">Scenes</div>
          </div>
          <div class="title-stat">
            <div class="title-stat-value" id="titleActorCount">0</div>
            <div class="title-stat-label">Actors</div>
          </div>
          <div class="title-stat">
            <div class="title-stat-value" id="titleScriptCount">0</div>
            <div class="title-stat-label">Scripts</div>
          </div>
        </div>
      </div>
      
      <div class="title-hint">Press ENTER to continue</div>
    `;
    document.body.appendChild(title);
    this.screens.titleScreen = title;
    this.setupTitleScreenEvents();
  }

  /**
   * Setup title screen events
   */
  setupTitleScreenEvents() {
    const openEditorBtn = document.getElementById('titleOpenEditor');
    const backBtn = document.getElementById('titleBackToProjects');

    if (openEditorBtn) {
      openEditorBtn.addEventListener('click', () => this.openEditor());
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => this.backToProjectManager());
    }

    // Enter key to continue
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.currentScreen === 'title') {
        this.openEditor();
      }
    });
  }

  /**
   * Show title screen with project data
   */
  showTitleScreen(project) {
    if (!project) return;

    // Update title screen with project info
    const gameName = document.getElementById('titleGameName');
    const projectInfo = document.getElementById('titleProjectInfo');
    const sceneCount = document.getElementById('titleSceneCount');
    const actorCount = document.getElementById('titleActorCount');
    const scriptCount = document.getElementById('titleScriptCount');

    if (gameName) gameName.textContent = project.name;
    if (projectInfo) projectInfo.textContent = `by ${project.author} | ${project.description}`;
    if (sceneCount) sceneCount.textContent = project.stats.sceneCount;
    if (actorCount) actorCount.textContent = project.stats.actorCount;
    if (scriptCount) scriptCount.textContent = project.stats.scriptCount;

    this.showScreen('title');
  }

  /**
   * Show specific screen
   */
  showScreen(screenName) {
    // Hide all screens
    Object.keys(this.screens).forEach(name => {
      const screen = this.screens[name];
      if (screen) {
        if (name === 'editor') {
          screen.style.display = 'none';
        } else {
          screen.classList.remove('active');
        }
      }
    });

    // Show requested screen
    const screen = this.screens[screenName];
    if (screen) {
      if (screenName === 'editor') {
        screen.style.display = 'flex';
      } else {
        screen.classList.add('active');
      }
      this.currentScreen = screenName;
    }
  }

  /**
   * Start the application flow
   */
  start() {
    // Show splash screen
    this.showScreen('splash');

    // After 2.5 seconds, show project manager
    setTimeout(() => {
      this.screens.splash.classList.add('fade-out');
      setTimeout(() => {
        if (!this.projectSystem) {
          this.projectSystem = new window.ProjectSystem();
        }
        this.updateRecentProjectsList();
        this.showScreen('projectManager');
      }, 500);
    }, 2500);
  }

  /**
   * Open editor
   */
  openEditor() {
    this.showScreen('editor');
    
    // Dispatch event to notify other systems
    const event = new CustomEvent('editorOpened', {
      detail: { project: this.projectSystem.getCurrentProject() }
    });
    window.dispatchEvent(event);
  }

  /**
   * Back to project manager
   */
  backToProjectManager() {
    this.showScreen('projectManager');
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.ScreenManager = ScreenManager;
  
  // Auto-start when page loads
  window.addEventListener('load', () => {
    if (!window.screenManager) {
      window.screenManager = new ScreenManager();
      window.screenManager.start();
    }
  });
}
