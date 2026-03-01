# Dragon Studio - Code Editor & Blueprint Scripting Guide

## Overview

Dragon Studio now includes two powerful scripting systems for game development:

1. **Code Editor** - Direct source code editing with syntax highlighting
2. **Blueprint Scripting** - Visual node-based programming like Unreal Engine 5

## Code Editor

### Supported Languages

- **C** - GameBoy and embedded systems development
- **C++** - Modern game engine code
- **Assembly (ASM)** - Low-level optimization code
- **TypeScript** - Web-based game logic
- **JavaScript** - Runtime scripting

### Features

#### Syntax Highlighting

Automatic color-coded syntax for all supported languages:

```
Keyword    → Blue (#569cd6)
Comment    → Green (#6a9955)
String     → Orange-Brown (#ce9178)
Number     → Light Green (#b5cea8)
Macro      → Purple (#c586c0)
Register   → Cyan (#4ec9b0)
```

#### Code Formatting

- Auto-indent blocks
- Brace alignment
- Tab size customization (default: 2 spaces)

#### Themes

- **Light** - Classic light editor theme
- **Dark** - Default dark theme (recommended)
- **Dracula** - Popular Dracula color scheme

#### Code Features

- **Line Numbers** - With breakpoint support (click to toggle)
- **Real-time Stats** - Character and line counts
- **Cursor Position** - Shows line and column
- **Word Wrap** - Long line handling
- **Minimap** - Quick navigation (optional)

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Format Code | Toolbar button |
| Save File | Ctrl+S or toolbar button |
| Compile | Toolbar button |
| Run | Ctrl+Shift+R or toolbar button |
| Debug | Toolbar button |
| Tab Insert | Tab key |

### C/C++ Example

```cpp
#include <stdio.h>

int main() {
    printf("Hello from Dragon Studio!\n");
    return 0;
}
```

### Assembly Example

```asm
; X86-64 Assembly Example
section .data
    msg db "Hello", 0

section .text
    global _start

_start:
    mov rax, 1
    mov rdi, 1
    mov rsi, msg
    mov rdx, 5
    syscall

    mov rax, 60
    xor rdi, rdi
    syscall
```

### Breakpoints

Click on line numbers to toggle breakpoints for debugging:

- Red circle indicates active breakpoint
- Breakpoints persist during debug session
- View all breakpoints in console

## Blueprint Scripting System

### Node-Based Visual Programming

Blueprint Editor provides visual game logic programming similar to Unreal Engine 5's Blueprint system.

### Node Types

#### Event Nodes (Pink #E81E63)

Triggered by game events:

- **Event Begin Play** - Runs when game starts
- **Event Update** - Runs every frame
- **Event Tick** - Physics tick event
- **Event On Collision** - Collision detected
- **Event On Input** - Player input received

#### Function Nodes (Blue #2196F3)

Reusable functions:

- **Print String** - Console output
- **Delay** - Wait X seconds
- **Spawn Actor** - Create game object
- **Set Position** - Move object
- **Play Sound** - Audio playback

#### Variable Nodes (Green #4CAF50)

Data management:

- **Get Variable** - Read value
- **Set Variable** - Write value
- **Create Variable** - New variable
- **Cast Variable** - Type conversion

#### Math Nodes (Purple #9C27B0)

Mathematical operations:

- **Add** - Addition
- **Subtract** - Subtraction
- **Multiply** - Multiplication
- **Divide** - Division
- **Modulo** - Remainder
- **Power** - Exponentiation

#### Control Flow Nodes (Orange #FF9800)

Program flow:

- **If/Then** - Conditional branching
- **Loop** - Repeat until condition
- **Switch** - Multi-way branch

### Pin System

#### Execution Pins (White)

- Flow control between nodes
- Only one execution path active per frame
- Connected from output to input

#### Data Pins

**Input Pins (Left side):**

- **Yellow** - Generic/any type
- **Blue** - Number type
- **Green** - String type
- **Purple** - Boolean type
- **Red** - Object reference

**Output Pins (Right side):**

- Match input pin colors
- Can connect to multiple inputs
- Type checking on connection

### Creating a Blueprint

1. **Add Begin Play Event**
   - Click "+ Event Node"
   - Appears in center canvas
   - Has "Out" execution output

2. **Add Function Node**
   - Click "+ Function Node"
   - Drag to position
   - Click "In" pin - wait for connection
   - Connect to Begin Play "Out"

3. **Connect Nodes**
   - Click output pin on source node
   - Drag line to destination input pin
   - White execution line shows connection
   - Colored data pins show data flow

4. **Add Variables**
   - Click "+ Variable Node"
   - Set initial value
   - Use Get/Set operations

### Blueprint Example: Character Movement

```
[Event Update] 
    ↓ (connected to input)
[Get Input Vector]
    ↓ (data connection)
[Multiply by Speed] 
    ↓ 
[Add to Position]
    ↓
[Set Player Position]
```

### Compilation & Export

Convert blueprints to native code:

```cpp
// Generated from blueprint
class BlueprintGame {
public:
    void BeginPlay() {
        // Blueprint logic converted to C++
        PrintString("Game Started!");
    }
    
    void Update() {
        // Every frame logic
        GetInputVector();
        ApplyMovement();
    }
};
```

### Blueprint Properties Panel

Edit selected node properties:

- **Node Title** - Rename node
- **Variables** - Default values
- **Execution Speed** - Delay in milliseconds
- **Conditions** - Filter execution
- **Comments** - Documentation

### Debugging Blueprints

1. **Play Mode** - Run and observe node execution
2. **Step Through** - Execute one node at a time
3. **Breakpoints** - Pause on condition
4. **Watch Variables** - Monitor value changes
5. **Execution Trace** - See which nodes ran

## Integration with Game Engine

### Blueprint → Runtime

Blueprints compile to JavaScript or C++ that runs on game engine:

```javascript
// Example compiled blueprint in JS
const blueprint = new BlueprintGame();
blueprint.start(); // Begins execution
gameEngine.addUpdateCallback(() => blueprint.update());
```

### Code → Engine Linking

C/C++ code compiles to native executables or web assembly:

```cpp
// C++ in code editor
extern "C" void gameUpdate(GameContext* ctx) {
    // Game logic here
}
```

## Best Practices

### Code Editor

- Use consistent indentation
- Comment complex logic
- Test with small increments
- Check console for errors
- Use appropriate data types

### Blueprint Scripting

- Keep blueprints modular
- Use descriptive node names
- Document complex flows with comments
- Test individual branches
- Export and backup work

### Performance

- Avoid circular node connections
- Minimize real-time calculations
- Cache frequently accessed values
- Profile execution time
- Optimize hot paths

## Advanced Features

### Custom Nodes

Extension system for custom blueprint nodes:

```javascript
BlueprintEditor.registerCustomNode('MyNode', {
    title: 'Custom Operation',
    inputs: ['Value'],
    outputs: ['Result'],
    execute: (ctx) => {
        // Custom node logic
    }
});
```

### Macros

Reusable blueprint sub-graphs:

```blueprint
MyMacro
├─ Input: Health (number)
├─ Input: Damage (number)
└─ Output: NewHealth (number)
    └─ [Subtract Health - Damage]
```

### Events & Delegates

Custom event broadcasting:

```javascript
// Define event
const onPlayerHurt = new BlueprintEvent('OnPlayerHurt');

// Trigger event
onPlayerHurt.broadcast({ damage: 10 });

// Bind to event
onPlayerHurt.bind((data) => {
    console.log('Player hurt:', data.damage);
});
```

## Troubleshooting

### Code Won't Compile

- Check syntax highlighting for errors
- Look for unmatched braces
- Verify all includes/imports
- Check console for specific errors

### Blueprint Not Connecting

- Verify pin types match
- Check node is not full (max inputs/outputs)
- Ensure you're connecting output → input
- Look for circular dependencies

### Performance Issues

- Reduce node complexity
- Cache computed values
- Avoid updating every frame unnecessarily
- Profile execution time

## Examples

### Example 1: Simple Counter (Blueprint)

```
[Event Begin Play]
    ↓
[Set Variable] (counter = 0)
    ↓
[Event Update]
    ↓
[Get Variable] (counter)
    ↓
[Add] (counter + 1)
    ↓
[Set Variable] (counter)
```

### Example 2: Movement Script (C)

```c
void update_player(Player* p, Input* input) {
    if (input->up) p->y -= SPEED;
    if (input->down) p->y += SPEED;
    if (input->left) p->x -= SPEED;
    if (input->right) p->x += SPEED;
    
    clamp_position(p);
}
```

### Example 3: Collision Handler (Blueprint)

```
[Event On Collision]
    ↓
[Get Other Actor]
    ↓
[If Is Enemy?]
    ├─ True: [Take Damage]
    └─ False: [Play Sound]
```

## API Reference

### CodeEditor Class

```javascript
const editor = new CodeEditor('containerId');

// Methods
editor.loadFile(code, language);
editor.getCode();
editor.setCode(code);
editor.compile();
editor.run();
editor.formatCode();
editor.toggleBreakpoint(lineNum);
editor.applyTheme(theme);
```

### BlueprintEditor Class

```javascript
const bp = new BlueprintEditor('canvasId');

// Methods
bp.addNode(type, title, x, y);
bp.connect(fromNodeId, fromPin, toNodeId, toPin);
bp.exportToCode(language);
bp.serialize();
bp.deserialize(data);
bp.draw();
```

## Resources

- [Dragon Studio Main Readme](../README.md)
- [Game Engine API](./game-engine-api.md)
- [Export Guide](./export-guide.md)
- [Blueprint Tutorial](./blueprint-tutorial.md)

## Support

For issues or feature requests, please refer to the main Dragon Studio documentation or open an issue on GitHub.
