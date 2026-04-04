****** Example 1:
You are a senior frontend engineer implementing TWO new UI features in a Svelte project.
Do NOT refactor unrelated code. Do NOT change anything outside the specified components.
Implement ONLY what is described below, cleanly and precisely.

=====================
PROJECT STRUCTURE (for reference)
=====================

  src/
  ├── lib/
  │   ├── components/common/
  │   │   ├── Button.svelte
  │   │   ├── TextareaField.svelte
  │   │   └── ... (other common components)
  ├── pages/
  │   └── workspace/
  │       └── components/
  │           ├── chat/           ← document upload lives here
  │           ├── studio/
  │           │   └── modal/
  │           │       ├── StudioModalVideoOverview.svelte  ← video export modal
  │           │       ├── StudioModalAudioOverview.svelte
  │           │       ├── StudioModalData.svelte
  │           │       ├── StudioModalMindmap.svelte
  │           │       ├── StudioModalQuiz.svelte
  │           │       └── StudioModalReport.svelte
  │           └── layout/

=====================
FEATURE 1 — DOCUMENT: ADD "PASTE TEXT" INPUT AREA
=====================

LOCATION: The document panel inside a chat workspace.
Find the component responsible for document input (likely inside src/pages/workspace/components/chat/ or document-upload/).
It currently has two methods: upload file + crawl from URL.

TASK:
Add a THIRD input method: "Paste Text" — a plain text area where the user can type or paste raw text directly.

IMPLEMENTATION REQUIREMENTS:

1. UI Layout:
   - Add a new tab or section label: "Paste Text" (alongside or below the existing "Upload File" and "Crawl URL" options).
   - Use a consistent tab/toggle pattern matching the existing UI style.
   - The text area must appear when "Paste Text" is selected/active.

2. TextareaField component:
   - Use the existing <TextareaField /> common component from src/lib/components/common/TextareaField.svelte.
   - If TextareaField does not support needed props (rows, placeholder, resize, maxlength...), extend it with sensible defaults. Do NOT break existing usages.
   - Placeholder text: "Paste or type your content here..."
   - Allow vertical resize only (resize: vertical).
   - Minimum height: 160px.

3. Mock data:
   - Pre-fill the textarea with realistic mock content so the feature is visible and testable immediately.
   - Example mock content (use this or similar):

     "Artificial intelligence (AI) is transforming industries worldwide.
      From healthcare diagnostics to financial forecasting, AI systems are
      enabling faster, more accurate decision-making. This document explores
      key trends, challenges, and opportunities in enterprise AI adoption
      through 2025 and beyond."

4. Submit behavior:
   - Add a "Add Text" or "Confirm" button below the textarea using the existing <Button /> component.
   - On click: log the text value to console (mock action) and optionally show a brief success state.
   - Do NOT connect to any real API.

5. DO NOT:
   - Remove or modify the existing Upload File or Crawl URL sections.
   - Change any existing logic, stores, or API calls.

=====================
FEATURE 2 — STUDIO: ADD VIDEO DURATION SLIDER TO VIDEO EXPORT MODAL
=====================

LOCATION: src/pages/workspace/components/studio/modal/StudioModalVideoOverview.svelte

This modal already has options for exporting a video (e.g. quality, format, style, etc.).

TASK:
Add a new option: "Video Duration" — a range slider that lets the user control the output video length.

IMPLEMENTATION REQUIREMENTS:

1. Slider Spec:
   - Min: 40 seconds
   - Max: 480 seconds (8 minutes)
   - Default value: 120 seconds (2 minutes) — a sensible middle ground
   - Step: 10 seconds

2. UX Design Rules:
   - Display the current duration value in a human-readable format:
     • Under 60s → show as "Xs" (e.g. "40s", "50s")
     • 60s and above → show as "Xm Ys" (e.g. "1m 20s", "4m 0s")
   - Show min label "40s" on the left end and max label "8m" on the right end of the slider track.
   - The live duration label must update in real-time as the user drags.
   - Place the slider AFTER the existing export options but BEFORE the confirm/export button.

3. Slider Visual Design:
   - Use a native <input type="range" /> element.
   - Style to match the existing modal's design language (colors, spacing, border-radius).
   - The slider thumb and track must use the project's existing CSS variables or color tokens if available.
   - Label the section clearly: "Video Duration" with the live value displayed prominently next to or below the label.

4. Svelte Binding:
   - Use bind:value on the range input to a local variable (e.g. let videoDuration = 120).
   - Derive the formatted label reactively using a $: reactive declaration.

5. DO NOT:
   - Modify any other modal (Audio, Data, Mindmap, Quiz, Report).
   - Change the export/submit logic or API calls in the modal.
   - Add any new stores or services.

=====================
GENERAL RULES (APPLY TO BOTH FEATURES)
=====================

1. Keep the UI consistent with the existing design — match spacing, font size, border styles.
2. Use existing common components where applicable. Extend them if needed (with safe defaults).
3. Do NOT introduce new dependencies or packages.
4. All new UI text must be in English (or match the existing language of the project).
5. Each feature is INDEPENDENT — implementing one must not affect the other.
6. Write clean, readable Svelte code with short inline comments for new logic.

=====================
OUTPUT EXPECTATION
=====================

1. List which files were created or modified for each feature.
2. Show a brief summary of what was added and where.
3. Confirm:
   - Feature 1: Paste Text section appears with mock content pre-filled.
   - Feature 2: Duration slider appears in video modal with real-time formatted label.

Do NOT add any other features. Do NOT refactor unrelated code.

****** Example 2:
You are a senior frontend engineer fixing a LAYOUT and SCROLL BUG in a Svelte workspace page.

Do NOT add new features. Do NOT change colors, fonts, or component logic.
Fix ONLY the layout structure and scroll behavior as described below.

=====================
CURRENT PROBLEM
=====================

The workspace page has a multi-column layout:
  - Column 1 (leftmost): Sidebar navigation (Workspace, Analytics, Settings)
  - Column 2: Chat list panel (Search + list of chats)
  - Column 3: Main content panel (Add Documents + Your Documents list, OR Chat area)

Current bugs:

BUG 1 — Chat list panel does not fill full viewport height.
  The chat list (Column 2) is not stretching to 100% of the screen height.
  When the page is viewed, the chat list stops short and leaves dead space below.

BUG 2 — Main content panel scrolls the entire page instead of scrolling within itself.
  When the user is on the "Paste Text" tab in the Add Documents section,
  the content is tall and causes the WHOLE PAGE to scroll.
  This breaks the layout: the chat list and sidebar scroll out of view,
  and the "Your Documents" list below disappears off-screen.

BUG 3 — The main content panel (Column 3) does not scroll independently.
  It should have its own internal scroll so that:
    - The sidebar (Column 1) stays fixed in place.
    - The chat list (Column 2) stays fixed in place.
    - Only Column 3 scrolls internally when its content overflows.

=====================
EXPECTED BEHAVIOR AFTER FIX
=====================

1. The overall page layout must NEVER cause the browser/window to scroll.
   The entire app must fit within 100vh at all times.

2. Column 1 (Sidebar): Fixed height = 100vh. No scroll. Always fully visible.

3. Column 2 (Chat list): Fixed height = 100vh. No scroll (or internal scroll only for the chat list items).
   The column itself must always be fully visible from top to bottom of the viewport.

4. Column 3 (Main content): Fills remaining width. Height = 100vh.
   IF content inside is taller than available space → scroll ONLY within Column 3.
   The scroll must not affect Column 1 or Column 2.

=====================
HOW TO FIX
=====================

Apply this layout structure (adapt to match the existing Svelte component tree):

  <!-- Root layout wrapper -->
  <div style="display: flex; height: 100vh; overflow: hidden;">

    <!-- Column 1: Sidebar -->
    <aside style="flex-shrink: 0; height: 100vh; overflow: hidden;">
      ...sidebar content...
    </aside>

    <!-- Column 2: Chat list -->
    <div style="flex-shrink: 0; height: 100vh; display: flex; flex-direction: column; overflow: hidden;">
      ...search bar (fixed)...
      <div style="flex: 1; overflow-y: auto;">
        ...chat list items...
      </div>
    </div>

    <!-- Column 3: Main content -->
    <main style="flex: 1; height: 100vh; overflow-y: auto;">
      ...Add Documents panel...
      ...Your Documents list...
    </main>

  </div>

Key CSS rules to enforce:
  - Root wrapper: height: 100vh; overflow: hidden; display: flex;
  - Each column: height: 100vh; overflow: hidden; (or overflow-y: auto for scrollable ones)
  - Column 3 (main): overflow-y: auto; so it scrolls internally
  - NO element outside Column 3 should cause page-level scroll

=====================
SCOPE OF CHANGES
=====================

Only modify layout/structural files. Likely candidates:
  - The root workspace layout component (e.g. WorkspacePanel.svelte or a layout wrapper inside src/pages/workspace/)
  - The chat list container component (inside src/pages/workspace/components/layout/ or chat/)
  - The main content area wrapper

DO NOT touch:
  - Any component's internal logic or data
  - API calls or stores
  - Colors, typography, spacing inside components
  - The document-upload components, modal components, or studio components

=====================
ADDITIONAL UX RULE
=====================

The chat list (Column 2) should itself be internally scrollable for its list items:
  - The search bar at the top of Column 2 must stay FIXED (does not scroll).
  - Only the list of chats below the search bar scrolls when there are many items.
  This is independent from the main content area scroll.

=====================
OUTPUT EXPECTATION
=====================

1. List every file modified.
2. Describe exactly which CSS/style property was added or changed and why.
3. Confirm all three bugs are resolved:
   ✅ Chat list always fills 100vh
   ✅ Page never scrolls at the browser level
   ✅ Column 3 scrolls independently without affecting other columns

****** Example 3:
You are a senior UI engineer performing a VISUAL MODERNIZATION of a Svelte web application.

Your task is ONLY to update colors, typography, spacing, and surface styling.
You must NOT change any component logic, routing, API calls, stores, or layout structure.
The UI before and after must have identical functionality and layout.

=====================
DESIGN INSPIRATION
=====================

Reference: Google NotebookLM (notebooklm.google.com)

Key visual traits to replicate:
  - Warm, off-white backgrounds — NOT pure white (#ffffff)
  - Soft warm neutrals for surfaces and panels
  - Muted, earthy accent colors — NOT electric blue
  - Purple/indigo tones as the primary accent (instead of harsh blue)
  - Subtle depth through layered background tones, not drop shadows
  - Refined typography with clear hierarchy (size + weight + color contrast)
  - Soft status indicators and badge pills
  - Sidebar with gentle active state (colored fill + matching text, no harsh contrast)
  - Cards with warm border colors instead of sharp gray outlines
  - Buttons that feel intentional, not aggressive

=====================
CURRENT PROBLEMS TO FIX
=====================

Looking at the current UI:

1. BACKGROUND: Pure white everywhere — flat, clinical, no depth.
2. SIDEBAR: Active state (Workspace) uses a flat blue block — too harsh.
3. MAIN CONTENT AREA: Pure white cards with cold gray borders — feels generic.
4. ACCENT COLOR: Electric blue (#2563eb or similar) used everywhere — too saturated.
5. DELETE BUTTON: Solid red — overly aggressive for a data list action.
6. TYPOGRAPHY: All text is the same gray with no warm tone or clear hierarchy.
7. STATUS BADGES (Ready, Processing): Basic gray pill — not visually distinct enough.
8. TAB SELECTOR (Upload File / Crawl Website / Paste Text): Flat, no personality.
9. SOURCE BADGES (FILE, WEBSITE): Plain gray box — should feel like a typed chip.
10. HEADER: Plain white topbar with no visual separation from content.

=====================
TARGET COLOR SYSTEM
=====================

Create a centralized token file at:
  src/styles/theme/tokens.css (or tokens.scss if the project uses SCSS)

Define these tokens (use these exact values):

  /* Backgrounds — warm layered surfaces */
  --color-bg-app:         #F5F3EF;   /* warm off-white — main page background */
  --color-bg-surface:     #FDFCFA;   /* slightly lighter — card/panel surfaces */
  --color-bg-sidebar:     #EFEDE8;   /* warm tone — sidebar background */
  --color-bg-elevated:    #FFFFFF;   /* true white — only for top-level floating elements */
  --color-bg-hover:       #E8E5DF;   /* warm hover state */
  --color-bg-active:      #E3DFF7;   /* soft lavender — active/selected state */

  /* Primary accent — purple/indigo (NotebookLM style) */
  --color-accent:         #5B4FCF;   /* primary purple */
  --color-accent-light:   #EDE9FB;   /* very light purple — for badge fills, active tab bg */
  --color-accent-hover:   #4A3FBF;   /* darker purple on hover */
  --color-accent-text:    #3D2FA8;   /* purple text on light bg */

  /* Text hierarchy */
  --color-text-primary:   #1C1917;   /* warm near-black */
  --color-text-secondary: #6B6560;   /* warm gray */
  --color-text-muted:     #A8A29E;   /* light muted gray */
  --color-text-accent:    #5B4FCF;   /* accent colored text (links, active) */

  /* Borders */
  --color-border-default: #E2DED8;   /* warm light border */
  --color-border-subtle:  #EDEBE6;   /* very subtle divider */
  --color-border-accent:  #C4BAF0;   /* light purple border for focused/selected */

  /* Status colors */
  --color-status-ready:        #16A34A;  /* green */
  --color-status-ready-bg:     #F0FDF4;
  --color-status-processing:   #CA8A04;  /* amber */
  --color-status-processing-bg:#FFFBEB;
  --color-status-error:        #DC2626;
  --color-status-error-bg:     #FEF2F2;

  /* Danger (destructive actions) */
  --color-danger:         #DC2626;
  --color-danger-light:   #FEE2E2;
  --color-danger-text:    #991B1B;

=====================
COMPONENT-BY-COMPONENT CHANGES
=====================

Apply these changes ONLY using the tokens above. No hardcoded hex values in components.

--- 1. APP BACKGROUND ---
  Change the root <body> or app wrapper background to var(--color-bg-app).

--- 2. SIDEBAR ---
  Background: var(--color-bg-sidebar)
  Border-right: 1px solid var(--color-border-default)

  Navigation items:
    - Default: color var(--color-text-secondary), no background
    - Hover: background var(--color-bg-hover), color var(--color-text-primary)
    - Active/selected: background var(--color-bg-active), color var(--color-accent-text), font-weight 500
      Add a 3px left border: border-left: 3px solid var(--color-accent)
      (DO NOT use a full-width blue block)

  Bottom user section:
    - Subtle top border: var(--color-border-subtle)
    - Sign Out button: outlined style, color var(--color-danger), border var(--color-danger), background transparent
      On hover: background var(--color-danger-light)

--- 3. TOP HEADER BAR ---
  Background: var(--color-bg-surface)
  Border-bottom: 1px solid var(--color-border-default)
  Title text: color var(--color-text-primary), font-weight 600

  Language switcher (VN/EN):
    - Inactive: background var(--color-bg-hover), color var(--color-text-secondary)
    - Active: background var(--color-accent-light), color var(--color-accent-text), font-weight 500

  "+ New Chat" button:
    - Background: var(--color-accent)
    - Color: #FFFFFF
    - Border-radius: 8px
    - Hover: background var(--color-accent-hover)

--- 4. CHAT LIST PANEL ---
  Background: var(--color-bg-sidebar)
  Border-right: 1px solid var(--color-border-default)

  Search input:
    - Background: var(--color-bg-elevated)
    - Border: 1px solid var(--color-border-default)
    - Border-radius: 8px
    - Focus: border-color var(--color-border-accent), box-shadow 0 0 0 3px rgba(91,79,207,0.12)

  Chat list items:
    - Default: background transparent, color var(--color-text-primary)
    - Hover: background var(--color-bg-hover)
    - Active/selected: background var(--color-bg-active), left border 3px solid var(--color-accent)
    - Date label: color var(--color-text-muted), font-size 12px

--- 5. MAIN CONTENT CARDS (Add Documents, Your Documents) ---
  Background: var(--color-bg-surface)
  Border: 1px solid var(--color-border-default)
  Border-radius: 12px
  Remove any harsh box-shadows — use border only.

  Section title (e.g. "Add Documents", "Your Documents"):
    - Color: var(--color-text-primary)
    - Font-weight: 600

--- 6. TAB SELECTOR (Upload File / Crawl Website / Paste Text) ---
  Tab container: background var(--color-bg-app), border-radius 8px, padding 4px

  Inactive tabs:
    - Background: transparent
    - Color: var(--color-text-secondary)
    - Hover: color var(--color-text-primary)

  Active tab:
    - Background: var(--color-bg-elevated)
    - Color: var(--color-accent-text)
    - Font-weight: 500
    - Border: 1px solid var(--color-border-accent)
    - Border-radius: 6px
    - Box-shadow: 0 1px 3px rgba(0,0,0,0.08)

--- 7. TEXTAREA / INPUT FIELDS ---
  Background: var(--color-bg-elevated)
  Border: 1px solid var(--color-border-default)
  Border-radius: 8px
  Color: var(--color-text-primary)
  Focus: border-color var(--color-border-accent), box-shadow 0 0 0 3px rgba(91,79,207,0.12)

--- 8. PRIMARY ACTION BUTTON (Add Text, Submit, etc.) ---
  Background: var(--color-accent)
  Color: #FFFFFF
  Border-radius: 8px
  Font-weight: 500
  Hover: background var(--color-accent-hover)
  Border: none

--- 9. SOURCE BADGES (FILE, WEBSITE) ---
  Background: var(--color-bg-hover)
  Color: var(--color-text-secondary)
  Border: 1px solid var(--color-border-default)
  Border-radius: 6px
  Font-size: 11px
  Font-weight: 500
  Letter-spacing: 0.04em
  Padding: 3px 8px

--- 10. STATUS BADGES ---

  "Ready":
    - Background: var(--color-status-ready-bg)
    - Color: var(--color-status-ready)
    - Border: 1px solid #BBF7D0
    - Dot: same color as text, filled circle

  "Processing":
    - Background: var(--color-status-processing-bg)
    - Color: var(--color-status-processing)
    - Border: 1px solid #FDE68A
    - Dot: same color as text (amber)

--- 11. DELETE BUTTON ---
  Change from solid red to outlined destructive style:
    - Background: transparent
    - Color: var(--color-danger)
    - Border: 1px solid var(--color-danger-light)
    - Border-radius: 6px
    - Hover: background var(--color-danger-light), border-color var(--color-danger)
  This is less aggressive while still being clearly destructive.

--- 12. TABLE (Your Documents list) ---
  Header row:
    - Background: var(--color-bg-app)
    - Color: var(--color-text-muted)
    - Font-size: 12px
    - Font-weight: 500
    - Letter-spacing: 0.06em
    - Border-bottom: 1px solid var(--color-border-default)

  Data rows:
    - Background: transparent
    - Hover: background var(--color-bg-hover)
    - Border-bottom: 1px solid var(--color-border-subtle)

  Checkbox:
    - Accent-color: var(--color-accent)

  "Refresh" link:
    - Color: var(--color-accent-text)
    - Hover: color var(--color-accent)

=====================
STRICTLY FORBIDDEN
=====================

- Do NOT use var(--color-accent) as a background for the entire sidebar or any full panel
- Do NOT use pure #FFFFFF as the main page or panel background
- Do NOT add drop-shadows (box-shadow with x/y offset) — use borders only
- Do NOT add gradients
- Do NOT change font families
- Do NOT change any component logic, bindings, or event handlers
- Do NOT add animation or transition effects (unless it's a simple color transition already present)
- Do NOT hardcode any hex values in component files — use tokens only

=====================
FILE STRUCTURE EXPECTATION
=====================

1. Create: src/styles/theme/tokens.css
   → Define all CSS custom properties listed above.
   → Import this file globally (in app.css or App.svelte).

2. Update common components in src/lib/components/common/:
   → Button.svelte, TextField.svelte, TextareaField.svelte, SelectField.svelte
   → Replace hardcoded colors with token variables.

3. Update layout/structural components:
   → Sidebar, Header/Topbar, Chat list panel, Main content wrapper.

4. Update page-level styles:
   → Document panel, document table, studio modals (surface styling only).

=====================
OUTPUT EXPECTATION
=====================

1. List every file modified.
2. Confirm the token file was created and imported globally.
3. Verify no raw hex colors remain in component files.
4. Confirm zero functional changes were made.

The goal: the app should look like it belongs in the same design family as NotebookLM —
warm, calm, thoughtful, and modern — without being over-designed.
