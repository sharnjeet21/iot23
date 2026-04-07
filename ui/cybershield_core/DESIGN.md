# Design System Specification: The Sentinel Aesthetic

## 1. Overview & Creative North Star
The North Star for this design system is **"The Digital Custodian."** 

In the high-stakes world of IoT security, users don’t just need data; they need clarity, authority, and a sense of calm under pressure. We move away from the cluttered, aggressive "hacker" tropes toward a high-end editorial experience. By utilizing intentional asymmetry, sophisticated layering, and an expansive typographic scale, we create an interface that feels less like a tool and more like a premium command center. 

The goal is to convey **"Informed Authority"**—using white space as a structural element and depth as a navigational guide, ensuring the user feels in total control of their digital perimeter.

---

## 2. Colors & Tonal Architecture
We move beyond flat "boxes on a screen" by using a sophisticated spectrum of blues and grays to define importance and state.

### Core Palette
*   **Primary (`#003d9b`):** The "Trust" anchor. Used for high-level branding and primary actions.
*   **Primary Container (`#0052cc`):** A more vibrant, active blue for critical interactive elements.
*   **Secondary (`#00668a`):** Used for technical secondary actions and IoT-specific grouping.
*   **Tertiary (`#004e32`):** Our "Safe State" green, evolved for a premium look rather than a generic "go" signal.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. 
Structure must be achieved through **background color shifts**. Use `surface-container-low` for secondary sections and `surface-container-highest` for high-priority callouts. If a section feels "lost," increase the vertical padding rather than reaching for a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers.
1.  **Base Layer:** `surface` (#f8f9fb)
2.  **Sectioning Layer:** `surface-container-low` (#f3f4f6)
3.  **Component Layer (Cards/Inputs):** `surface-container-lowest` (#ffffff)
4.  **Floating/Active Layer:** Semi-transparent `primary` with `backdrop-blur` (Glassmorphism).

### Signature Textures
Main CTAs and Hero sections should utilize a subtle linear gradient: 
`linear-gradient(135deg, primary 0%, primary-container 100%)`. This adds a "lithic" weight to buttons that flat hex codes cannot replicate.

---

## 3. Typography: The Editorial Edge
We pair the technical precision of **Inter** with the architectural character of **Space Grotesk** to create an "Editorial Tech" feel.

*   **Display & Headlines (Space Grotesk):** Use these for high-level data points and page titles. The wide apertures and geometric shapes convey a modern, high-tech personality.
    *   *Display-LG:* 3.5rem (For critical status numbers/metrics).
*   **Title & Body (Inter):** The workhorse. Inter provides maximum legibility for security logs and device names.
*   **Technical Data (Monospace):** Use a clean monospace font for IP addresses, MAC addresses, and terminal logs. This distinguishes "Human Content" from "Machine Data."

---

## 4. Elevation & Depth: The Layering Principle
Hierarchy is achieved through **Tonal Layering** rather than traditional structural lines.

*   **Ambient Shadows:** For floating elements like Modals or Floating Action Buttons (FABs), use extra-diffused shadows. 
    *   *Spec:* `box-shadow: 0 12px 40px rgba(0, 61, 155, 0.06);` (Notice the blue tint in the shadow to mimic ambient light from the primary brand color).
*   **The "Ghost Border" Fallback:** In high-density technical logs where separation is vital, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.
*   **The Terminal Contrast:** For log views, invert the system. Use `inverse-surface` as the background and `inverse-primary` for the monospaced text to create a focused, "dark mode" diagnostic environment within the light UI.

---

## 5. Components & Interaction Patterns

### Buttons (Tactile & Purposeful)
*   **Primary:** Uses the "Signature Texture" gradient. 1.5rem padding on sides, `md` (0.75rem) corner radius. On hover, increase the `surface-tint`.
*   **Secondary:** No background. Use a `Ghost Border` and `primary` text.
*   **Tertiary:** Text-only with a subtle `surface-container-high` background shift on hover.

### Security Cards
*   **Rule:** Forbid divider lines within cards. 
*   **Layout:** Use `title-md` for device names and `label-md` for status. Separate content clusters with 24px of vertical white space.
*   **State Indicators:** Use a 4px vertical "status bar" on the left edge of the card (Emerald for Secure, Bright Red for Threat) instead of coloring the whole card.

### Inputs & IoT Controls
*   **Mobile-First:** All inputs must have a minimum height of 56px to ensure a high "tap success" rate for field technicians.
*   **Selection Chips:** Use `secondary-container` with `on-secondary-container` text. These should feel like physical "toggles."

### The "Connection Pulse"
For IoT device states, use a semi-transparent circular "pulse" animation behind the icon to indicate active data syncing.

---

## 6. Do's and Don'ts

### Do
*   **DO** use `surface-container` tiers to nest information. An inner card should always be lighter or darker than its parent container.
*   **DO** leverage `spaceGrotesk` for large numbers (e.g., "98% Secure").
*   **DO** use "Glassmorphism" (surface-color + 20px blur) for navigation bars to allow content to bleed through beautifully.

### Don't
*   **DON'T** use 100% black text. Always use `on-surface` (#191c1e) to maintain a premium, softer contrast.
*   **DON'T** use sharp 90-degree corners. Everything must feel approachable and tactile (8px - 12px radius).
*   **DON'T** use standard "Alert" banners. Instead, use a `surface-container-highest` card with a bold `error` colored icon and a tinted shadow to signal urgency.

---

## 7. Component Matrix (Technical Specification)

| Component | Token | Property | Value |
| :--- | :--- | :--- | :--- |
| **Card Radius** | `rounded-md` | border-radius | 0.75rem (12px) |
| **Button Height** | `touch-target` | min-height | 56px |
| **Surface Lift** | `surface-lowest` | box-shadow | 0 8px 24px rgba(0,0,0,0.04) |
| **Divider Replacement** | `spacing-md` | margin-bottom | 1.5rem |
| **Ghost Border** | `outline-variant`| border | 1px solid rgba(195, 198, 214, 0.2) |