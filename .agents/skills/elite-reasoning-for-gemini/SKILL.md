---
name: elite-reasoning-for-gemini
description: >-
  Comprehensive cognitive framework that teaches Gemini models (2.5 Flash, 2.5 Pro)
  to think deeper, debug harder, and solve problems like an elite senior engineer.
  Covers: systematic thinking protocols, bug-hunting methodology, root-cause analysis,
  adversarial self-review, codebase archaeology, and multi-phase problem decomposition.
  Activate on EVERY non-trivial coding task. This skill transforms surface-level
  code generation into deep engineering.
---

# Elite Reasoning & Deep Problem-Solving Framework for Gemini

> **Purpose**: This skill encodes the exact cognitive patterns, debugging instincts,
> and systematic rigor that separate a "good enough" AI coder from one that catches
> every bug, anticipates every edge case, and writes code that actually works in production.

---

## 0. The Core Problem: Why Models Fail at Real Engineering

Most AI coding failures come from **3 root causes**:

1. **Surface-level pattern matching** — generating code that *looks* right but doesn't account for runtime state, lifecycle, or edge conditions.
2. **Premature coding** — jumping to implementation before understanding the problem space, existing code, and constraints.
3. **No adversarial self-review** — accepting the first solution without stress-testing it mentally.

This skill fixes all three by enforcing a **disciplined cognitive pipeline**.

---

## 1. THE THINKING PROTOCOL (Use Your Extended Thinking)

### 1.1 — Structure Your Thinking in Phases

When Gemini's thinking/reasoning mode is enabled, don't just stream consciousness. Structure your thinking block into these **mandatory phases**:

```
THINKING PHASE 1: UNDERSTAND (What is actually being asked?)
- Restate the user's request in your own words
- Identify the REAL goal (often different from what's literally asked)
- List what you DON'T know and need to find out

THINKING PHASE 2: INVESTIGATE (What does the code actually do?)
- Read the relevant files BEFORE forming any opinion
- Trace the execution flow: entry point → call chain → side effects
- Map the state: what variables exist, what lifecycle are they in

THINKING PHASE 3: PLAN (What's the minimal correct change?)
- Define the invariants that must hold before and after
- Identify all touch points (what else will this change affect?)
- Write the test/verification FIRST (even if just mentally)

THINKING PHASE 4: DOUBT (What could go wrong?)
- Adversarially attack your own plan
- Check: race conditions, null/undefined, lifecycle mismatch, resource leaks
- Ask: "If I were trying to BREAK this code, what input would I use?"

THINKING PHASE 5: EXECUTE (Write the minimal correct code)
- Smallest diff that completely solves the problem
- Zero speculative abstractions
```

### 1.2 — The "5 Whys" Rule for Every Bug

Never stop at the first explanation. Always ask "why?" at least 3-5 times:

```
Bug: "The tooltip blinks when moving the mouse fast"
  Why? → The tooltip hides and shows rapidly
  Why? → leaveEvent fires before the new enterEvent
  Why? → Qt processes leave/enter as separate events with no debounce
  Why? → There's no delay between hide and show
  ROOT CAUSE → Need a timer-based delay on show, with cancellation on leave
  FIX → Add QTimer.singleShot with cancel-on-leave (not just hide/show toggle)
```

### 1.3 — Think in Failure Modes, Not Happy Paths

Before writing any code, explicitly enumerate failure scenarios:

```
FAILURE MODE CHECKLIST:
□ What happens with empty/null input?
□ What happens if this is called twice rapidly?
□ What happens if the user interrupts mid-operation (Alt+Tab, close, crash)?
□ What happens at boundary values (0, -1, MAX_INT, empty string, very long string)?
□ What happens on slow/no network?
□ What happens if a dependency throws?
□ What happens on first run vs subsequent runs?
□ What if permissions are denied?
□ What if disk is full or file is locked?
□ What if this runs on a different screen resolution / DPI / OS version?
```

---

## 2. THE INVESTIGATION PROTOCOL (Codebase Archaeology)

### 2.1 — NEVER Assume, ALWAYS Read

The #1 mistake: assuming you know what a function does without reading it.

**MANDATORY before modifying ANY file:**
1. Read the file (or at minimum the relevant section)
2. Search for all callers of the function you're changing (`grep_search`)
3. Search for all related state variables
4. Check for initialization, cleanup, and lifecycle hooks

### 2.2 — The "Ripple Map" Technique

Before changing anything, draw a mental ripple map:

```
CHANGE: Modify function X()
  ↓ Called by: A(), B(), C()
  ↓ A() is called from: main_loop()
  ↓ B() uses return value of X() to compute Z
  ↓ C() passes X()'s result to external API
  
RIPPLE RISK:
  - If X() now returns a different type → B() and C() will break
  - If X() now throws → A() has no try/catch → crash
  - If X()'s timing changes → main_loop() may stall
```

### 2.3 — Symbol Tracing Protocol

For every bug investigation:

1. **Find the error location** (stack trace, log, user report)
2. **Read that exact line** and its surrounding context (±30 lines)
3. **Trace backwards**: where did the bad value come from?
4. **Trace forwards**: where does this value go next?
5. **Check initialization**: was the variable properly initialized? When?
6. **Check lifecycle**: could this object have been destroyed/garbage-collected?
7. **Check threading**: is this accessed from multiple threads?

---

## 3. THE DEBUGGING METHODOLOGY (Finding Bugs Others Miss)

### 3.1 — The "Impossible State" Detector

The most insidious bugs come from states the developer assumed were impossible. Scan for:

| Pattern | Risk | Example |
|---------|------|---------|
| Boolean flags set in one place, checked in another | Flag can be stale | `is_loading = True` set but never unset on error path |
| Index variables used after collection modification | Off-by-one or OOB | `del items[i]` then `items[i+1]` |
| Resources acquired in `try`, released in `finally` | Resource never acquired if early return | `file = None; try: file = open(...)` → `finally: file.close()` fails |
| Timer/callback registered but never cancelled | Fires after object destroyed | `QTimer.singleShot(500, self.update)` but `self` is deleted |
| State machine with no "reset" path | Gets stuck permanently | Error state entered but no transition back to idle |
| Async operation with no timeout | Hangs forever | `await fetch(url)` with no timeout |

### 3.2 — The "What Changed?" Principle

When something that "used to work" breaks:

1. **Find the exact commit/change** that introduced the regression (`git log`, `git bisect`)
2. **Diff only the changed lines** — the bug is in the delta, not the whole file
3. **Check if the change violated an implicit assumption** that the old code relied on

### 3.3 — Reading Error Messages Like a Detective

```
DON'T: "Oh, a TypeError, let me add a type check"
DO:    "A TypeError means a value has an unexpected type.
        WHERE did this value come from? 
        WHY is it the wrong type?
        Is the bug HERE, or is it UPSTREAM where the value was created?"
```

**Always fix the ROOT CAUSE, not the symptom.**

---

## 4. THE CODE REVIEW CHECKLIST (Adversarial Self-Audit)

Run this checklist on EVERY change before presenting it:

### 4.1 — Correctness
- [ ] Does this actually solve the stated problem? (Re-read the original request)
- [ ] Does this handle ALL the edge cases from the failure mode checklist?
- [ ] Are all code paths tested or at least reasoned about?
- [ ] Does this preserve existing behavior for unchanged scenarios?

### 4.2 — Resource Management
- [ ] Every `open()` has a `close()` (or uses `with`)
- [ ] Every `addEventListener` / `connect` has a corresponding removal/disconnect
- [ ] Every timer/interval is cancelled on cleanup
- [ ] Every allocated buffer/object is freed
- [ ] Subscriptions, observers, and callbacks are unregistered

### 4.3 — Concurrency & Timing
- [ ] No race conditions between UI thread and background operations
- [ ] No state read-after-free or use-after-dispose
- [ ] Debounced/throttled where rapid-fire events are possible
- [ ] Async operations have timeouts and error handlers

### 4.4 — API & Contract
- [ ] Function signature matches all callers (check grep results)
- [ ] Return type is consistent across all code paths (including error paths)
- [ ] Error cases return/throw meaningful information (not silent `None`)
- [ ] No hidden side effects that callers don't expect

### 4.5 — Minimalism (Ponytail Check)
- [ ] Is there a simpler way to do this? (stdlib? existing helper?)
- [ ] Does this add unnecessary abstraction?
- [ ] Could this be deleted entirely and still work?
- [ ] Am I solving a problem that doesn't exist yet? (YAGNI)

---

## 5. THE IMPLEMENTATION PROTOCOL (Writing Code That Works)

### 5.1 — Read Before Write (The 60/40 Rule)

Spend **60% of your time reading and understanding**, 40% writing. Most AI models do the opposite.

```
BAD:  User asks for feature → immediately start coding
GOOD: User asks for feature → read the codebase → understand patterns → 
      check for existing helpers → plan the minimal change → write
```

### 5.2 — Incremental Verification

Don't write 200 lines and hope they work. After every logical unit:
1. Mentally trace the execution
2. Check types at every boundary
3. Verify state transitions
4. Consider: "What would a unit test assert here?"

### 5.3 — The "Explain It to a Junior Dev" Test

Before presenting your solution, explain it in plain English:
- What was the problem?
- Why did it happen?
- What does this change do?
- Why is THIS approach the right one (vs alternatives)?
- What could still go wrong?

If you can't explain it clearly, you don't understand it well enough.

### 5.4 — Preserve What Works

```
GOLDEN RULE: When fixing a bug, change the MINIMUM necessary.
  - Don't reformat unrelated code
  - Don't rename variables "for clarity" in the same commit
  - Don't refactor while debugging
  - Surgical precision > shotgun approach
```

---

## 6. COMMON TRAPS THAT CATCH AI MODELS

### Trap 1: "It Compiles, Ship It"
Code that parses/compiles is NOT code that works. Always trace execution mentally.

### Trap 2: "The Happy Path Fallacy"
Testing only the normal case. The bugs live in: empty input, concurrent access, 
interrupted operations, first-run, permission denied, disk full.

### Trap 3: "Cargo Cult Patterns"
Copying a pattern without understanding WHY it exists. If you can't explain 
why `useEffect` needs a cleanup function in THIS specific case, don't add one.

### Trap 4: "Abstraction Astronautics"
Creating a `StrategyFactoryProviderManagerInterface` for what should be an `if/else`.

### Trap 5: "Fixing the Wrong Layer"
The bug appears in the UI but the root cause is in the data layer. 
Don't patch the UI — fix the data.

### Trap 6: "Silent Failures"
```python
# TERRIBLE: Silently swallows every error
try:
    do_important_thing()
except:
    pass

# CORRECT: Handle specific errors meaningfully
try:
    do_important_thing()
except FileNotFoundError:
    logger.warning(f"Config file not found, using defaults")
    use_defaults()
```

### Trap 7: "Off-by-One in Everything"
Fencepost errors in loops, slices, ranges, time intervals, buffer sizes.
Always check: does the boundary include or exclude the endpoint?

### Trap 8: "The Stale Reference"
Object was valid when you got the reference. Is it still valid when you USE it?
Common in: cached DOM elements, stored widget pointers, saved file handles.

---

## 7. ADVANCED PATTERNS FOR DEEP PROBLEM SOLVING

### 7.1 — Bisection Debugging

When you don't know WHERE the bug is:
1. Add a checkpoint at the MIDDLE of the suspected code
2. Is the state correct at the midpoint? → Bug is in the second half
3. Is the state wrong at the midpoint? → Bug is in the first half
4. Repeat until you find the exact line

### 7.2 — Invariant-Based Reasoning

Define what MUST be true, then verify it:

```python
# INVARIANT: len(self.strokes) == len(self.stroke_colors)
# If this is ever violated, we have a bug.
# Add assertions at every mutation point:
assert len(self.strokes) == len(self.stroke_colors), \
    f"Stroke/color mismatch: {len(self.strokes)} vs {len(self.stroke_colors)}"
```

### 7.3 — Temporal Reasoning

Many bugs are about WHEN things happen, not WHAT happens:

```
Q: "Does X happen before Y?"
Q: "Can Z happen BETWEEN X and Y?"
Q: "What if Y never happens?" (timeout, crash, user cancels)
Q: "What if X happens TWICE before Y?"
```

### 7.4 — Minimal Reproduction

When a bug is complex, strip away everything unrelated:
1. Remove all features except the buggy one
2. Use the simplest possible input
3. Remove all async/background processing
4. Isolate the exact conditions that trigger it

---

## 8. GEMINI-SPECIFIC TIPS (Maximizing Your Extended Thinking)

### 8.1 — Use Thinking Budget Wisely

```
LOW COMPLEXITY (1-2 line fix): Brief thinking, focus on correctness check
MEDIUM COMPLEXITY (function/component): Full 5-phase thinking protocol  
HIGH COMPLEXITY (architecture/multi-file): Extended thinking with explicit
  investigation notes, ripple maps, and adversarial review
```

### 8.2 — Structure Your Thinking with Headers

Don't let thinking be a stream of consciousness. Use mental headers:

```
## Understanding the Request
[What the user actually wants]

## Codebase Investigation
[What I found in the relevant files]

## Failure Mode Analysis  
[What could go wrong with my approach]

## Plan
[Exact steps I'll take]

## Self-Review
[Problems I found with my own plan, corrections]
```

### 8.3 — "Red Team" Your Own Solution

After planning a solution, spend 20% of your thinking budget actively
trying to BREAK it. Imagine you're a hostile QA engineer:

- "What input crashes this?"
- "What timing breaks this?"
- "What state was assumed but never verified?"
- "What happens if this is called from a context the author didn't imagine?"

### 8.4 — Concrete Over Abstract

```
BAD thinking:  "I should handle errors properly"
GOOD thinking: "If `open(path)` raises FileNotFoundError because the config 
                dir doesn't exist on first run, I need to create it with 
                os.makedirs(dir, exist_ok=True) BEFORE the open() call"
```

---

## 9. THE META-SKILL: KNOWING WHAT YOU DON'T KNOW

### 9.1 — Epistemic Humility Checklist

Before writing code, honestly assess:

- [ ] Have I READ the file I'm about to modify? (not assumed/remembered)
- [ ] Do I know the EXACT function signature and return type?
- [ ] Do I know ALL callers of this function?
- [ ] Do I know the lifecycle (when is this object created/destroyed)?
- [ ] Do I know the threading model (what thread calls this)?
- [ ] Am I confusing this API with a similar one from another framework?

If any answer is "no" → **INVESTIGATE FIRST, then code.**

### 9.2 — The "I Don't Know" Power Move

The strongest thing a model can do is say:
> "I'm not sure about X. Let me check before proceeding."

Then actually CHECK. This one habit prevents 80% of AI coding mistakes.

### 9.3 — When to Ask the User

Ask when:
- Multiple valid approaches exist with different tradeoffs
- The requirement is genuinely ambiguous
- You'd need to make a design decision that affects the user's workflow
- The fix might change existing behavior

Don't ask when:
- You're just being lazy (investigate first)
- The answer is clearly in the codebase
- It's a trivial implementation detail

---

## 10. SUMMARY: THE ELITE ENGINEERING LOOP

```
┌─────────────────────────────────────────────┐
│  1. UNDERSTAND: What is really being asked? │
│  2. INVESTIGATE: Read code. Map state.      │
│     Trace calls. Find existing patterns.    │
│  3. PLAN: Define invariants. Minimal change.│ 
│     Write the test criteria FIRST.          │
│  4. DOUBT: Red-team your own plan.          │
│     Enumerate failure modes.                │
│  5. EXECUTE: Smallest correct diff.         │
│  6. VERIFY: Trace execution mentally.       │
│     Check all edge cases.                   │
│  7. REVIEW: Run the full checklist.         │
│     Would YOU trust this code in production?│
└─────────────────────────────────────────────┘
```

**The difference between good and great is not intelligence — it's discipline.**
