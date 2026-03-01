# 🧪 Interactive Feature Testing & Validation Guide

**Version**: 2.0  
**Date**: March 1, 2026  
**Target**: http://localhost:5000

---

## 📋 Quick Start Testing Checklist

### Phase 1: Core Systems Verification (5-10 minutes)

#### 1. **Project Management System**
```
TEST: Create a New Project
□ Open http://localhost:5000 in browser
□ Press Ctrl+N (or File > New Project)
□ Modal appears asking for project name and platform
□ Enter "Test RPG" and select "Game Boy Color"
□ Click "Create"
□ SUCCESS: New project created, modal closes, notification shows "Project created"
□ TIP: Check browser console (F12) for any errors

TEST: Auto-Save
□ In any editor, make a small change
□ Wait 5 minutes (or observe if auto-save is triggered)
□ Check: Window title should show • for unsaved, nothing for saved
□ SUCCESS: Auto-save activates silently

TEST: Save Project Manually
□ Press Ctrl+S
□ SUCCESS: Notification shows "Project saved"
□ Browser prompts to download .egp file

TEST: Recent Projects List
□ Press Ctrl+O (Open)
□ Modal shows dropdown of recent projects
□ Click on a recent project
□ SUCCESS: Project loads
```

#### 2. **Keyboard Shortcuts System**
```
TEST: Navigation Shortcuts
□ Press Ctrl+1 → Emulator panel focuses
□ Press Ctrl+2 → Tiles panel focuses
□ Press Ctrl+3 → Maps panel focuses
□ Press Ctrl+4 → Strings panel focuses
□ Press Ctrl+5 → Tables panel focuses
□ Press Ctrl+6 → Source panel focuses
□ Press Ctrl+7 → Build panel focuses
□ SUCCESS: Each shortcut switches to correct panel

TEST: Editor Shortcuts
□ Click in strings editor field
□ Type some text
□ Press Ctrl+A → Text is selected
□ Press Ctrl+C → Text copied
□ Press Ctrl+V → Text pasted at cursor
□ Press Ctrl+Z → Last change undone
□ Press Ctrl+Y → Change redone
□ SUCCESS: All shortcuts work as expected

TEST: Build Shortcuts
□ Press Ctrl+B → Build All starts (check console)
□ Press Ctrl+Shift+A → Build Assets starts
□ Press Ctrl+Shift+R → Build ROM starts
□ SUCCESS: Each shortcut triggers correct build

TEST: View Shortcuts
□ Press Ctrl++ → Zoom in (UI elements enlarge)
□ Press Ctrl+- → Zoom out
□ Press Ctrl+0 → Zoom reset
□ Press F11 → Fullscreen toggle
□ SUCCESS: Zoom and fullscreen work
```

#### 3. **History/Undo-Redo System**
```
TEST: Undo in Strings Editor
□ Click Strings tab
□ Click in a string value field
□ Type new text
□ Press Ctrl+Z
□ SUCCESS: Text reverts to previous value
□ Can repeat Ctrl+Z to undo further changes (max 100)

TEST: Redo Functionality
□ After undoing, press Ctrl+Y or Ctrl+Shift+Z
□ SUCCESS: Previously typed text reappears
□ Redo disabled (greyed out) when at latest state

TEST: Undo History Per Editor
□ Make changes in Strings editor, undo a few times
□ Switch to Source code editor
□ Make changes here
□ Switch back to Strings editor
□ STATUS: Strings editor history is separate from Source editor
□ SUCCESS: Each editor has independent 100-level history

TEST: History Indicators
□ Edit > Undo should show grayed out when nothing to undo
□ Edit > Redo should show grayed out when nothing to redo
□ SUCCESS: Menu items reflect current history state
```

#### 4. **Clipboard System**
```
TEST: Copy/Paste Text
□ In Strings editor, select text
□ Press Ctrl+C
□ Click another text field
□ Press Ctrl+V
□ SUCCESS: Text appears in new field

TEST: Cut Operation
□ In Strings editor, select text
□ Press Ctrl+X
□ Text disappears from source
□ Click another field
□ Press Ctrl+V
□ SUCCESS: Text appears, removed from original location

TEST: System Clipboard Sync
□ Copy text from Strings editor (Ctrl+C)
□ Switch to Notepad/external app
□ Press Ctrl+V
□ SUCCESS: IDE text appears in external app
□ (Note: May require browser permissions)

TEST: Clipboard State
□ Copy some text
□ Press Ctrl+E to open context menu
□ "Paste" option should be enabled
□ SUCCESS: Paste option reflects clipboard state
```

#### 5. **Search & Replace System**
```
TEST: Find Text
□ Press Ctrl+F
□ "Find & Replace" dialog appears
□ Type search term (e.g., "dragon")
□ Click "Find Next" or press Enter
□ SUCCESS: First match highlights in green
□ Match indicator shows "1/5" if 5 matches found

TEST: Case-Sensitive Search
□ Open Find & Replace (Ctrl+F)
□ Check "Case Sensitive" checkbox
□ Type "Dragon"
□ Click Find
□ SUCCESS: Only matches "Dragon" (not "dragon")
□ COUNT: Fewer results than case-insensitive search

TEST: Regex Search
□ Open Find & Replace (Ctrl+F)
□ Check "Use Regex" checkbox
□ Type pattern: "[0-9]+" (find numbers)
□ Click Find
□ SUCCESS: Matches any digit sequences
□ Highlights all numbers found

TEST: Replace Single
□ Open Find & Replace (Ctrl+F)
□ Type search: "player"
□ Type replace: "hero"
□ Click "Replace"
□ SUCCESS: Current match replaced, next match highlighted
□ COUNT: Shows you how many replacements made

TEST: Replace All
□ Open Find & Replace (Ctrl+F)
□ Type search: "Lv" (level abbreviation)
□ Type replace: "Level"
□ Click "Replace All"
□ SUCCESS: Dialog shows "Replaced 12 occurrences"
□ All instances in project replaced
```

#### 6. **Notification System**
```
TEST: Info Notification
□ Open Find & Replace (Ctrl+F)
□ Perform any search
□ SUCCESS: Toast appears "Found 3 matches" in top-right
□ Auto-dismisses after 3 seconds

TEST: Success Notification
□ Press Ctrl+S to save
□ SUCCESS: Green checkmark notification "Project saved"
□ Auto-dismisses after 3 seconds

TEST: Warning Notification
□ Make unsaved changes
□ Close a panel without saving
□ SUCCESS: Yellow warning "Unsaved changes" appears
□ Notification persists until clicked

TEST: Error Notification
□ Try to import invalid file type
□ SUCCESS: Red error notification appears
□ Message explains what went wrong
□ Dismisses after 5 seconds

TEST: Multiple Notifications
□ Trigger several save operations quickly
□ SUCCESS: Notifications stack vertically in top-right
□ Each auto-dismisses on its schedule
□ Can click any to dismiss immediately
```

---

### Phase 2: Advanced Features Testing (10-15 minutes)

#### 7. **Context Menu System**
```
TEST: Right-Click on Sidebar Item
□ Right-click on a file in the sidebar (tiles/maps/source)
□ SUCCESS: Context menu appears with options:
   ✓ Open
   ✓ Rename
   ✓ Duplicate
   ✓ Export [Format]
   ✓ Properties
   ✓ Delete

TEST: Context Menu - Rename
□ Right-click on sidebar item
□ Select "Rename"
□ Input dialog appears
□ Type new name
□ SUCCESS: Item renamed in sidebar

TEST: Context Menu - Delete
□ Right-click on sidebar item
□ Select "Delete"
□ Confirm dialog appears
□ Click "Yes"
□ SUCCESS: Item deleted from sidebar
□ WARNING: No undo for deletions (intentional)

TEST: Right-Click on Editor Tab
□ Right-click on an open tab
□ SUCCESS: Context menu shows:
   ✓ Close Tab
   ✓ Close Others
   ✓ Reload
   ✓ Float Panel (inactive for now)

TEST: Right-Click in Editor Content
□ Right-click in strings editor text area
□ SUCCESS: Editor context menu shows:
   ✓ Cut (Ctrl+X)
   ✓ Copy (Ctrl+C)
   ✓ Paste (Ctrl+V)
   ✓ Find (Ctrl+F)
   ✓ Select All (Ctrl+A)
   ✓ Format (Ctrl+Shift+F)
```

#### 8. **Drag & Drop System**
```
TEST: Drag PNG to Tiles Panel
□ Open file explorer
□ Find a .png file anywhere
□ Drag it over the IDE window
□ SUCCESS: Blue drop zone appears showing "Drop PNG to import"
□ Drop the file
□ SUCCESS: Upload notification shows "Importing 1 tile image"
□ File appears in Tiles panel
□ Tiles panel auto-switches to active

TEST: Drag ROM to Emulator
□ Find a .gb or .gbc ROM file
□ Drag over IDE window
□ Drop when "Drop ROM to emulate" appears
□ SUCCESS: Emulator loads the ROM
□ Game starts playing in emulator tab

TEST: Drag C/H File to Source Panel
□ Find .c or .h source file
□ Drag to IDE
□ Drop when "Drop C/H source code" appears
□ SUCCESS: Source panel activates
□ Code appears in editor

TEST: Drag .tilemap to Maps Panel
□ Find tilemap file (.map, .tilemap, .bin)
□ Drag to window
□ Drop on maps panel
□ SUCCESS: Tilemap imported and displayed

TEST: Drag Visual Feedback
□ While dragging file over IDE:
   □ Subtle overlay appears (20% opacity)
   □ Green border highlights target panel
   □ Helper text shows accepted type
   TRUE: Drag experience is smooth and informative
```

#### 9. **Menu Action Integration**
```
TEST: File Menu Actions
□ Click File menu
□ Verify these options present and functional:
   ✓ New Project (Ctrl+N)
   ✓ Open Project (Ctrl+O)
   ✓ Save (Ctrl+S)
   ✓ Save All (Ctrl+Shift+S)
   ✓ Import → (ROM/Tiles/Strings/etc)
   ✓ Export → (ROM/Assets/etc)
   ✓ Recent Projects (with list)
   ✓ Exit

TEST: Edit Menu Actions
□ Click Edit menu
□ Verify:
   ✓ Undo (Ctrl+Z) - enabled/disabled based on state
   ✓ Redo (Ctrl+Y) - enabled/disabled based on state
   ✓ Cut (Ctrl+X)
   ✓ Copy (Ctrl+C)
   ✓ Paste (Ctrl+V)
   ✓ Delete (Del)
   ✓ Find (Ctrl+F)
   ✓ Replace  (Ctrl+H)

TEST: View Menu Actions
□ Click View menu
□ Verify zoom controls:
   ✓ Zoom In (Ctrl++)
   ✓ Zoom Out (Ctrl+-)
   ✓ Reset Zoom (Ctrl+0)
   ✓ Fullscreen (F11)
   ✓ Toggle Sidebar
   ✓ Toggle Status Bar

TEST: Build Menu Actions
□ Click Build menu
□ Verify build commands:
   ✓ Build Assets (Ctrl+Shift+A)
   ✓ Build ROM (Ctrl+Shift+R)
   ✓ Build All (Ctrl+B)
   ✓ Clean Build
   ✓ Rebuild
□ Add Target section with platform options (15+ platforms available)

TEST: Platform Selection
□ Click Build > Target
□ Submenu shows available platforms:
   ✓ Game Boy
   ✓ Game Boy Color
   ✓ Game Boy Advance
   ✓ Nintendo DS
   ✓ Nintendo 64
   ✓ Nintendo Switch
   ✓ PlayStation
   ✓ Xbox
   ✓ PC
   ✓ Mobile
□ Click a platform
□ SUCCESS: Platform changes, menus refresh with platform-specific tools
```

---

### Phase 3: Integration Testing (5-10 minutes)

#### 10. **Workflow: Create, Edit, Save, Build**
```
WORKFLOW TEST: Complete Game Development Cycle
□ Step 1: Create new project
    Press Ctrl+N
    Name: "Test Game"
    Platform: "Game Boy Color"
□ Step 2: Edit a string
    Click Strings tab
    Edit a dialogue string
    Press Ctrl+S to save
    ✓ Notification: "Project saved"
□ Step 3: Use undo
    Press Ctrl+Z
    ✓ String reverts to original
□ Step 4: Redo
    Press Ctrl+Y
    ✓ Your edit reappears
□ Step 5: Find and replace
    Press Ctrl+F
    Search for a common word
    Replace with different word
    ✓ All instances updated
□ Step 6: Search multiple times
    Click Find Next multiple times
    Navigate through all matches
□ Step 7: Copy and paste
    Copy a string value (Ctrl+C)
    Select another string field
    Paste with Ctrl+V
□ Step 8: Save everything
    Press Ctrl+Shift+S to save all open editors
    ✓ Notification confirms save
□ Step 9: Build project
    Press Ctrl+B
    ✓ Build console output appears
□ Step 10: Test emulator
    Click Emulator tab
    ✓ Built ROM runs in emulator
SUCCESS: Complete workflow works end-to-end
```

#### 11. **Error Recovery**
```
TEST: Handle Missing Systems Gracefully
□ Open browser console (F12)
□ Check for any red error messages
□ SUCCESS: No errors related to new systems
□ If errors found, note them for debugging

TEST: Invalid input in modals
□ Open New Project modal (Ctrl+N)
□ Leave project name empty
□ Try to create
□ SUCCESS: Modal prevents creation, shows error message

TEST: Missing Files
□ Try to open non-existent ROM
□ SUCCESS: Handled gracefully with error notification
□ Dialog box doesn't crash the IDE

TEST: Permission Issues
□ Try to export to restricted directory
□ SUCCESS: Error message suggests fix
□ IDE remains stable
```

---

## 🎯 Test Execution Instructions

### How to Run Tests

**Option A: Manual Testing**
1. Open http://localhost:5000 in Chrome/Firefox/Edge
2. Follow each test scenario above
3. Check marks (✓) indicate success
4. Note any failures

**Option B: Semi-Automated (Browser DevTools)**
```javascript
// Run in Browser Console (F12)
// Test 1: Project Manager exists
console.log('ProjectManager:', !!window.ProjectManager);

// Test 2: History Manager exists
console.log('HistoryManager:', !!window.HistoryManager);

// Test 3: Keyboard Shortcuts registered
console.log('KeyboardManager:', !!window.KeyboardManager);

// Test 4: Search enabled
console.log('SearchManager:', !!window.SearchManager);

// Test 5: Notifications working
if (window.NotificationManager) {
  window.NotificationManager.info('Test notification working!');
}
```

### Reporting Issues

If a test fails, capture:
1. **Test name** and step that failed
2. **Browser console errors** (F12)
3. **Expected behavior** vs **actual behavior**
4. **Screenshot or video** of the issue
5. **Reproduction steps** (numbered list)

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Platform: ___________

RESULTS:
Core Systems:    [__/6] ✓
Advanced Features: [__/3] ✓
Integration:       [__/3] ✓

NOTES:
_________________________________________________

ISSUES FOUND:
_________________________________________________
```

---

## 🔍 Detailed Test Specifications

### ProjectManager Tests

```javascript
// Test creating a project
const project = window.ProjectManager.newProject('TestRPG', 'gbc');
console.assert(project.name === 'TestRPG', 'Project name mismatch');
console.assert(project.platform === 'gbc', 'Platform mismatch');

// Test saving
const saved = window.ProjectManager.save();
console.assert(saved === true, 'Save failed');

// Test recent projects
const recentCount = window.ProjectManager.getRecentProjects().length;
console.assert(recentCount > 0, 'No recent projects');
```

### HistoryManager Tests

```javascript
// Test push state
window.HistoryManager.pushState('strings', {text: 'Hello'}, 'Add greeting');
console.assert(window.HistoryManager.canUndo('strings'), 'Undo not available');

// Test undo
const undone = window.HistoryManager.undo('strings');
console.assert(undone.text === 'Hello', 'Undo failed');

// Test redo
const redone = window.HistoryManager.redo('strings');
console.assert(redone && redone.text === 'Hello', 'Redo failed');
```

### SearchManager Tests

```javascript
// Test search
const results = window.SearchManager.search('player', 'all', {
  caseSensitive: false,
  useRegex: false
});
console.assert(results.length > 0, 'No search results');

// Test replace
const count = window.SearchManager.replace('test', 'example', 'current');
console.assert(count > 0, 'Replace failed');
```

---

## 🚀 Next Testing Steps

After completing Phase 1-3:

1. **Performance Testing**
   - Test with large projects (100+ strings)
   - Monitor memory usage
   - Check responsiveness

2. **Cross-Browser Testing**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

3. **Accessibility Testing**
   - Keyboard-only navigation
   - Screen reader compatibility
   - Color contrast verification

4. **Load Testing**
   - Open multiple files
   - Perform many undo/redo cycles
   - Search large projects
   - Test with maximum history depth

---

## 📝 Known Test Limitations

1. **System Clipboard**: May require browser permissions
2. **File Drag & Drop**: Works better on Chrome/Edge than Firefox
3. **Floating Panels**: Not yet implemented (menu option present)
4. **Multi-file Search**: Limited to currently open files
5. **External Editor Integration**: Windows-specific, not implemented

---

## ✅ Testing Checklist Summary

| Feature | Tests | Status | Notes |
|---------|-------|--------|-------|
| Project Management | 5 | [ ] | Create/Save/Load/Export/Recent |
| Keyboard Shortcuts | 6 | [ ] | Navigation/Editor/Build/View |
| History/Undo-Redo | 4 | [ ] | Undo/Redo/Per-editor/Indicators |
| Clipboard | 4 | [ ] | Copy/Cut/Paste/System-sync |
| Search & Replace | 6 | [ ] | Find/Replace/Case/Regex/All |
| Notifications | 4 | [ ] | Info/Success/Warning/Error |
| Context Menus | 5 | [ ] | Sidebar/Tab/Editor/Canvas/Outliner |
| Drag & Drop | 5 | [ ] | PNG/ROM/Code/Tilemap/Feedback |
| Menu Integration | 5 | [ ] | File/Edit/View/Build/Platform |
| Workflow | 1 | [ ] | Complete cycle test |
| Error Recovery | 4 | [ ] | Graceful failure handling |

**Total Tests**: 49 ✓  
**Pass Rate**: [ ]%  
**Date Completed**: ___________

---

## 💡 Enhancement Ideas for Future Testing

- [ ] Record video walkthroughs of each feature
- [ ] Create automated Selenium/Cypress tests
- [ ] Build visual regression testing
- [ ] Performance benchmarking suite
- [ ] Load testing with large projects
- [ ] A/B testing of UI/UX changes
- [ ] User acceptance testing (UAT) guide

---

**Happy Testing! 🧪**  
For questions or issues, refer to NEW_FEATURES_GUIDE.md and check browser console (F12)
