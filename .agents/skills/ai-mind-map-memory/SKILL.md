---
name: ai-mind-map-memory
description: >-
  Persistent structural mind map and memory system for AI agents. Maintains a living
  map of what the AI has done, the codebase structure, and what to do next — eliminating
  redundant code scanning on every session. Activate at the START and END of every session,
  and whenever beginning a new task on this project.
---

# AI Mind Map Memory — Persistent Agent Memory System

This skill gives the AI **persistent spatial memory** across sessions. Instead of re-reading
the entire codebase every time, the agent reads a compact mind map file, then updates it when
work is complete. Think of it like a senior developer mental model — built up over time.

---

## Core Memory Files

All memory lives in `.agents/memory/` relative to the project root:

| File | Purpose |
|------|---------|
| `mindmap.md` | Living structural mind map of the whole codebase |
| `code_index.md` | Compact index: file -> purpose, key classes, key functions |
| `session_log.md` | Chronological log: what was done per session, what is next |
| `decisions.md` | Architectural decisions and why (prevents re-debating same choices) |

---

## 1. SESSION START PROTOCOL (READ FIRST — Every Time)

**Before writing a single line of code or scanning any file**, run this startup checklist:

### Step 1 — Load the Mind Map
Read both files:
- `.agents/memory/mindmap.md`
- `.agents/memory/session_log.md`

If these files **do not exist** → this is the first session → go to **Section 3 Bootstrap Protocol**.
If they exist → read them fully. You now have the full project context.

### Step 2 — Check Last Session "Next Steps"
In `session_log.md`, find the **Next Steps** section from the last entry.
This tells you exactly what was planned. Start from there, not from scratch.

### Step 3 — Targeted File Reads Only
Using `code_index.md`, identify **only the specific files** relevant to the current task.
Do NOT re-scan the whole codebase. Use the index as your navigation map.

---

## 2. SESSION END PROTOCOL (WRITE ALWAYS — After Every Change)

**After completing any meaningful work**, update the memory files. This is mandatory.

### Step 1 — Update `session_log.md`
Append a new entry:

```
## Session — YYYY-MM-DD HH:MM

### What Was Done
- Concise bullet list of changes made, files touched, bugs fixed

### Key Decisions Made
- Any design or architecture decisions made this session

### Problems Found / Known Issues
- Bugs, edge cases, or issues discovered but not yet fixed

### Confidence Level
- HIGH / MEDIUM / LOW with brief note

### Next Steps
- Exactly what should be done next — the AI own TODO for the next session
```

### Step 2 — Update `mindmap.md` (if structure changed)
If you added/removed/renamed files, changed architecture, or added new features:
- Update the relevant branch of the mind map.
- Keep it in compact hierarchical markdown format.

### Step 3 — Update `code_index.md` (if new symbols were added)
If you added new classes, functions, or significantly changed existing ones:
- Update the entry for that file in `code_index.md`.

### Step 4 — Update `decisions.md` (if a design decision was made)
If you chose one approach over alternatives, append:

```
## Decision — YYYY-MM-DD: [Short Title]
**Context**: Why this decision was needed
**Choice**: What was chosen
**Alternatives Considered**: What else was evaluated
**Rationale**: Why this choice was made
```

---

## 3. BOOTSTRAP PROTOCOL — First Session Only

When `.agents/memory/` does not exist, run a one-time deep scan to build it.

### Step 1 — Spawn a Research Subagent
```json
{
  "TypeName": "research",
  "Role": "Codebase Cartographer",
  "Prompt": "Perform a complete structural analysis of the project. For every file: record its purpose, key classes, key functions/methods, important constants, and inter-file dependencies. Return a structured report suitable for building a compact code index and mind map."
}
```

### Step 2 — Create `.agents/memory/` with the four memory files
Use the templates in Section 4 below.

### Step 3 — Log the Bootstrap
First entry in `session_log.md`:
```
## Session — YYYY-MM-DD HH:MM (Bootstrap)

### What Was Done
- First-time mind map and code index created.
- Full codebase scanned and mapped.

### Next Steps
- [First real task to work on]
```

---

## 4. MEMORY FILE FORMATS

### mindmap.md — Structural Mind Map

```markdown
# Pen 11 — Project Mind Map
Last Updated: YYYY-MM-DD

## Architecture Overview
[1-3 sentence summary of what this app is and its core approach]

## File Structure
project-root/
+-- main.py            Core app: UI, toolbar, drawing engine, Gemini AI (93 KB)
+-- storage.py         Settings persistence JSON-based (2 KB)
+-- process_manager.py Background process lifecycle (2 KB)
+-- web/               Firebase-hosted web companion UI
|   +-- index.html     Main landing page
+-- .agents/           AI agent configuration and memory

## Key Dependency Graph
- main.py imports storage.py for settings
- main.py uses PyQt6 for all UI rendering
- main.py calls Gemini API via google-generativeai
- web/ is independent — deployed to Firebase Hosting

## Core Components
### MainWindow (main.py)
- Frameless translucent overlay window
- Contains: ToolbarWidget, DrawingCanvas, GeminiPanel

### ToolbarWidget (main.py)
- Collapsible, animated toolbar
- State: expanded / collapsed

### DrawingCanvas (main.py)
- QPainter-based drawing surface
- Supports: pen, eraser, shapes, text

### GeminiPanel (main.py)
- AI sidebar: prompt input and response display
- Streams Gemini responses via background thread

## Known Issues / Fragile Areas
- [List any known bugs, tricky areas, or "do not touch without reading X" warnings]

## Current Focus
- [What the project is currently being worked on / the active feature]
```

### code_index.md — Symbol Index

```markdown
# Code Index
Last Updated: YYYY-MM-DD

## main.py (93 KB) — Core Application
**Purpose**: Main PyQt6 application — window, UI, drawing, Gemini integration

| Symbol | Type | Approx Line | Purpose |
|--------|------|-------------|---------|
| MainWindow | class | L50 | Top-level frameless overlay window |
| ToolbarWidget | class | L200 | Collapsible animated toolbar |
| DrawingCanvas | class | L400 | QPainter drawing surface |
| GeminiPanel | class | L600 | AI interaction sidebar |
| load_settings | func | L80 | Loads user preferences from storage |
| save_settings | func | L95 | Saves user preferences to storage |

## storage.py (2 KB) — Settings Persistence
**Purpose**: JSON-based settings read/write

| Symbol | Type | Approx Line | Purpose |
|--------|------|-------------|---------|
| load | func | L10 | Reads settings.json |
| save | func | L25 | Writes settings.json |

## process_manager.py (2 KB) — Process Lifecycle
**Purpose**: Manages background OS-level processes
```

### decisions.md — Architecture Decision Record

```markdown
# Architecture Decisions

## Decision — YYYY-MM-DD: [Title]
**Context**: ...
**Choice**: ...
**Alternatives Considered**: ...
**Rationale**: ...
```

---

## 5. AI WORKING IMPROVEMENT RULES

### Rule 1: Index Before Scanning
Always check `code_index.md` first. If you need a specific class, jump to the exact line.
Do not grep the whole codebase when you already have a map.

### Rule 2: Decision-Aware Coding
Before proposing a design, check `decisions.md`.
If it has already been debated and decided, follow the decision without re-opening it.

### Rule 3: Continuity-First Planning
The last session "Next Steps" is the current session starting point.
Never ask "where should I start?" — the mind map tells you.

### Rule 4: Incremental Map Updates
Small updates after every session are better than one big update later.
Keep the map fresh so it stays useful.

### Rule 5: Flag Fragile Zones
When working near tricky code (animations, threading, platform-specific hacks),
log it in `mindmap.md` under "Known Issues / Fragile Areas".
Future sessions will avoid stepping on landmines.

### Rule 6: Subagent Memory Inheritance
When spawning subagents, always pass the relevant excerpt from `mindmap.md`
and `code_index.md` in the prompt so subagents start with context instead of scanning blind.

Example subagent prompt prefix:
```
CONTEXT FROM PROJECT MIND MAP:
[paste relevant section from mindmap.md]

RELEVANT CODE INDEX ENTRIES:
[paste relevant rows from code_index.md]

TASK:
[actual task description]
```

### Rule 7: Confidence Scoring in Session Log
When writing session log entries, rate confidence in changes made:
- HIGH — tested, verified, works
- MEDIUM — looks right, needs testing  
- LOW — needs review or second opinion

---

## 6. QUICK REFERENCE CHECKLIST

SESSION START:
  [ ] Read .agents/memory/mindmap.md
  [ ] Read .agents/memory/session_log.md → check "Next Steps"
  [ ] Read .agents/memory/code_index.md entries for relevant files only
  [ ] Read .agents/memory/decisions.md for relevant choices

SESSION END:
  [ ] Append new entry to .agents/memory/session_log.md
  [ ] Update mindmap.md if architecture changed
  [ ] Update code_index.md if new symbols added
  [ ] Update decisions.md if design choices were made

---

## 7. GEMINI.md INTEGRATION

The following rule must be present in GEMINI.md to enforce this skill globally:

```
## 5. Persistent Memory (Mind Map)
- MANDATORY: On every session start, activate .agents/skills/ai-mind-map-memory/SKILL.md.
- Read .agents/memory/mindmap.md and .agents/memory/session_log.md BEFORE any code work.
- Update all memory files at END of every session that involves code changes.
- Never re-scan the full codebase when the code_index.md already has the answer.
```
