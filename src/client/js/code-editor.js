/**
 * Code Editor Component for Dragon Studio
 * Supports ASM, C, C++, TypeScript with syntax highlighting and code completion
 */
/* global document */

class CodeEditor {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.editor = null;
    this.language = 'c'; // default to C
    this.code = '';
    this.breakpoints = new Set();
    this.themes = ['light', 'dark', 'dracula'];
    this.currentTheme = 'dark';
    this.lineNumbers = true;
    this.tabSize = 2;
    this.minimap = true;
    this.wordWrap = true;
    
    this.init();
  }

  init() {
    // Create editor container with controls
    this.container.innerHTML = `
      <div class="code-editor-container">
        <div class="editor-toolbar">
          <div class="toolbar-group">
            <label>Language:</label>
            <select id="languageSelect">
              <option value="asm">Assembly (ASM)</option>
              <option value="c" selected>C</option>
              <option value="cpp">C++</option>
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div class="toolbar-group">
            <label>Theme:</label>
            <select id="themeSelect">
              <option value="light">Light</option>
              <option value="dark" selected>Dark</option>
              <option value="dracula">Dracula</option>
            </select>
          </div>
          <div class="toolbar-group">
            <button id="formatCode" class="btn-icon" title="Format Code">📐</button>
            <button id="saveCode" class="btn-icon" title="Save File">💾</button>
            <button id="compileBuild" class="btn-icon" title="Compile">⚙️</button>
            <button id="runCode" class="btn-icon" title="Run">▶️</button>
            <button id="debugCode" class="btn-icon" title="Debug">🐛</button>
          </div>
        </div>
        
        <div class="editor-content">
          <div class="line-numbers" id="lineNumbers"></div>
          <textarea id="codeInput" class="code-input" spellcheck="false"></textarea>
          <pre id="highlight" class="highlight"><code id="highlightCode"></code></pre>
        </div>
        
        <div class="editor-status">
          <span id="lineCol">Line 1, Col 1</span>
          <span id="codeStats">0 chars | 0 lines</span>
          <span id="compileStatus" class="status-ready">Ready</span>
        </div>
      </div>
    `;

    this.codeInput = document.getElementById('codeInput');
    this.lineNumbersDiv = document.getElementById('lineNumbers');
    this.highlightCode = document.getElementById('highlightCode');
    this.lineColDisplay = document.getElementById('lineCol');
    this.codeStatsDisplay = document.getElementById('codeStats');
    this.compileStatusDisplay = document.getElementById('compileStatus');

    this.setupEventListeners();
    this.updateLineNumbers();
    this.applyTheme(this.currentTheme);
  }

  setupEventListeners() {
    // Code input events
    this.codeInput.addEventListener('input', () => this.onCodeChange());
    this.codeInput.addEventListener('scroll', () => this.syncScroll());
    this.codeInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.codeInput.addEventListener('click', () => this.updateCursorPosition());
    this.codeInput.addEventListener('keyup', () => this.updateCursorPosition());

    // Toolbar events
    document.getElementById('languageSelect').addEventListener('change', (e) => {
      this.language = e.target.value;
      this.highlightSyntax();
    });

    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.currentTheme = e.target.value;
      this.applyTheme(this.currentTheme);
    });

    document.getElementById('formatCode').addEventListener('click', () => this.formatCode());
    document.getElementById('saveCode').addEventListener('click', () => this.saveToDisk());
    document.getElementById('compileBuild').addEventListener('click', () => this.compile());
    document.getElementById('runCode').addEventListener('click', () => this.runCode());
    document.getElementById('debugCode').addEventListener('click', () => this.startDebug());
  }

  onCodeChange() {
    this.code = this.codeInput.value;
    this.updateLineNumbers();
    this.highlightSyntax();
    this.updateStats();
  }

  updateLineNumbers() {
    const lines = this.code.split('\n').length;
    let lineNumbersHtml = '';
    for (let i = 1; i <= lines; i++) {
      const isBreakpoint = this.breakpoints.has(i) ? 'breakpoint' : '';
      lineNumbersHtml += `<div class="line-number ${isBreakpoint}" data-line="${i}">${i}</div>`;
    }
    this.lineNumbersDiv.innerHTML = lineNumbersHtml;

    // Add breakpoint click handlers
    document.querySelectorAll('.line-number').forEach(el => {
      el.addEventListener('click', (e) => this.toggleBreakpoint(parseInt(e.target.dataset.line)));
    });
  }

  highlightSyntax() {
    let highlighted = this.code;

    if (this.language === 'c' || this.language === 'cpp') {
      highlighted = this.highlightC(highlighted);
    } else if (this.language === 'asm') {
      highlighted = this.highlightASM(highlighted);
    } else if (this.language === 'typescript' || this.language === 'javascript') {
      highlighted = this.highlightJS(highlighted);
    }

    this.highlightCode.innerHTML = highlighted;
  }

  highlightC(code) {
    // C/C++ syntax highlighting
    const keywords = /\b(int|float|double|char|void|if|else|for|while|do|switch|case|return|typedef|struct|union|enum|class|public|private|protected|const|static|extern|volatile|register|unsigned|signed)\b/g;
    const numbers = /\b(\d+|0x[0-9a-fA-F]+)\b/g;
    const strings = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
    const comments = /\/\/.*?$|\/\*[\s\S]*?\*\//gm;
    const macros = /#(?:include|define|ifdef|endif|pragma).*/g;

    code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    code = code.replace(comments, '<span class="comment">$&</span>');
    code = code.replace(macros, '<span class="macro">$&</span>');
    code = code.replace(strings, '<span class="string">$&</span>');
    code = code.replace(keywords, '<span class="keyword">$&</span>');
    code = code.replace(numbers, '<span class="number">$&</span>');

    return code;
  }

  highlightASM(code) {
    // Assembly syntax highlighting
    const instructions = /\b(mov|add|sub|mul|div|xor|or|and|jmp|je|jne|call|ret|push|pop|lea|nop)\b/gi;
    const registers = /\b([rax|rbx|rcx|rdx|rsi|rdi|r8-r15|eax|ebx|ecx|edx|al|bl|cl|dl|rsp|rbp])\b/gi;
    const numbers = /\b(0x[0-9a-fA-F]+|\d+)\b/g;
    const comments = /;.*?$/gm;
    const labels = /^[a-zA-Z_]\w*:/gm;

    code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    code = code.replace(comments, '<span class="comment">$&</span>');
    code = code.replace(labels, '<span class="label">$&</span>');
    code = code.replace(instructions, '<span class="keyword">$&</span>');
    code = code.replace(registers, '<span class="register">$&</span>');
    code = code.replace(numbers, '<span class="number">$&</span>');

    return code;
  }

  highlightJS(code) {
    // JavaScript/TypeScript syntax highlighting
    const keywords = /\b(function|const|let|var|if|else|for|while|return|import|export|class|async|await|try|catch|throw|new|typeof|instanceof)\b/g;
    const numbers = /\b(\d+|0x[0-9a-fA-F]+)\b/g;
    const strings = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g;
    const comments = /\/\/.*?$|\/\*[\s\S]*?\*\//gm;

    code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    code = code.replace(comments, '<span class="comment">$&</span>');
    code = code.replace(strings, '<span class="string">$&</span>');
    code = code.replace(keywords, '<span class="keyword">$&</span>');
    code = code.replace(numbers, '<span class="number">$&</span>');

    return code;
  }

  syncScroll() {
    const textarea = this.codeInput;
    document.getElementById('highlight').scrollTop = textarea.scrollTop;
    document.getElementById('highlight').scrollLeft = textarea.scrollLeft;
    this.lineNumbersDiv.scrollTop = textarea.scrollTop;
  }

  handleKeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.codeInput.selectionStart;
      const end = this.codeInput.selectionEnd;
      const tabChar = ' '.repeat(this.tabSize);
      this.code = this.code.substring(0, start) + tabChar + this.code.substring(end);
      this.codeInput.value = this.code;
      this.codeInput.selectionStart = this.codeInput.selectionEnd = start + this.tabSize;
      this.onCodeChange();
    }
  }

  updateCursorPosition() {
    const textarea = this.codeInput;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const line = text.split('\n').length;
    const col = text.split('\n').pop().length + 1;
    this.lineColDisplay.textContent = `Line ${line}, Col ${col}`;
  }

  updateStats() {
    const lines = this.code.split('\n').length;
    const chars = this.code.length;
    this.codeStatsDisplay.textContent = `${chars} chars | ${lines} lines`;
  }

  toggleBreakpoint(lineNum) {
    if (this.breakpoints.has(lineNum)) {
      this.breakpoints.delete(lineNum);
    } else {
      this.breakpoints.add(lineNum);
    }
    this.updateLineNumbers();
  }

  formatCode() {
    // Basic code formatting
    let formatted = this.code;

    // Add spacing around braces
    formatted = formatted.replace(/([{])/g, ' $1\n').replace(/([}])/g, '\n$1');
    
    // Indent blocks
    let indent = 0;
    const lines = formatted.split('\n');
    const formattedLines = lines.map(line => {
      if (line.includes('}')) indent = Math.max(0, indent - 1);
      const indented = ' '.repeat(indent * this.tabSize) + line.trim();
      if (line.includes('{')) indent++;
      return indented;
    });

    this.code = formattedLines.join('\n');
    this.codeInput.value = this.code;
    this.onCodeChange();
    this.updateStatus('Code formatted', 'success');
  }

  async compile() {
    this.updateStatus('Compiling...', 'compile');
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: this.language,
          code: this.code
        })
      });

      const result = await response.json();
      if (result.success) {
        this.updateStatus('Compilation successful', 'success');
        console.log('Compiled output:', result.output);
      } else {
        this.updateStatus(`Compilation failed: ${result.error}`, 'error');
        console.error(result.error);
      }
    } catch (err) {
      this.updateStatus(`Compile error: ${err.message}`, 'error');
    }
  }

  async runCode() {
    this.updateStatus('Running...', 'compile');
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: this.language,
          code: this.code
        })
      });

      const result = await response.json();
      if (result.success) {
        this.updateStatus('Program ran successfully', 'success');
        console.log('Output:', result.output);
      } else {
        this.updateStatus(`Runtime error: ${result.error}`, 'error');
      }
    } catch (err) {
      this.updateStatus(`Run error: ${err.message}`, 'error');
    }
  }

  startDebug() {
    this.updateStatus('Debug mode active', 'debug');
    console.log('Breakpoints:', Array.from(this.breakpoints));
    console.log('Ready to debug with breakpoints:', this.breakpoints.size);
  }

  saveToDisk() {
    const blob = new Blob([this.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${this.language === 'cpp' ? 'cpp' : this.language === 'c' ? 'c' : this.language === 'asm' ? 'asm' : 'ts'}`;
    a.click();
    this.updateStatus('File saved', 'success');
  }

  applyTheme(theme) {
    const themes = {
      light: {
        bg: '#ffffff',
        fg: '#000000',
        keyword: '#0000ff',
        comment: '#008000',
        string: '#a31515',
        number: '#098658'
      },
      dark: {
        bg: '#1e1e1e',
        fg: '#d4d4d4',
        keyword: '#569cd6',
        comment: '#6a9955',
        string: '#ce9178',
        number: '#b5cea8'
      },
      dracula: {
        bg: '#282a36',
        fg: '#f8f8f2',
        keyword: '#ff79c6',
        comment: '#6272a4',
        string: '#f1fa8c',
        number: '#bd93f9'
      }
    };

    const t = themes[theme] || themes.dark;
    document.querySelector('.code-editor-container').style.backgroundColor = t.bg;
    document.querySelector('.code-editor-container').style.color = t.fg;

    const style = document.createElement('style');
    style.textContent = `
      .code-input {
        background-color: ${t.bg} !important;
        color: ${t.fg} !important;
      }
      .highlight { background-color: ${t.bg} !important; }
      .keyword { color: ${t.keyword} !important; font-weight: bold; }
      .comment { color: ${t.comment} !important; }
      .string { color: ${t.string} !important; }
      .number { color: ${t.number} !important; }
    `;
    document.head.appendChild(style);
  }

  updateStatus(message, type = 'info') {
    this.compileStatusDisplay.textContent = message;
    this.compileStatusDisplay.className = `status-${type}`;
  }

  loadFile(code, language = 'c') {
    this.code = code;
    this.language = language;
    this.codeInput.value = code;
    document.getElementById('languageSelect').value = language;
    this.onCodeChange();
  }

  getCode() {
    return this.code;
  }

  setCode(code) {
    this.code = code;
    this.codeInput.value = code;
    this.onCodeChange();
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeEditor;
}
