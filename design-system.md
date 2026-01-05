You’re right — re-reading your images, the design system is **very specific**: **Montserrat**, a **3-color core palette** (**#FFFFFF / #345AFA / #313131**), and a **soft, rounded, minimal finance UI** with cards, pill controls, and calm spacing.

Below is a **Design System Guidelines** doc derived directly from what’s visible in your screenshots (plus a few *necessary* neutral/opacity tokens to make the UI usable without adding new “brand colors”).

---

# Expense Lovers — Design System Guidelines (Revamp)

## 0) Brand feel

**Clean finance UI** with:

* Warm/soft background, minimal borders
* Big readable amounts
* Rounded cards + gentle elevation
* Blue used only for **primary actions + highlights**

---

## 1) Foundations

### 1.1 Typography

**Font family:** `Montserrat`

**Weights used (from image):**

* Regular (400)
* SemiBold (600)
* Bold (700)

**Type scale (recommended to match the UI look):**

* **Display / Balance**: 32–36 / 40, **700**
* **H1**: 24 / 32, **700**
* **H2**: 20 / 28, **600**
* **Section Title**: 16 / 24, **700**
* **Body**: 14–16 / 20–24, **400**
* **Caption**: 12 / 16, **400**
* **Micro**: 10–11 / 14, **400**

**Rules**

* Amounts always use **Bold**.
* Labels + metadata (date/time) use **Regular** and lower contrast.

---

### 1.2 Color System

#### Brand Colors (from your image)

* **White**: `#FFFFFF`
* **Primary Blue**: `#345AFA`
* **Ink (Near Black)**: `#313131`

#### Derived neutrals (same Ink color, using opacity)

Because the UI needs secondary text, dividers, and subtle backgrounds without introducing new brand colors:

* **Text / Primary**: `#313131`
* **Text / Secondary**: `rgba(49,49,49,0.65)`
* **Text / Tertiary**: `rgba(49,49,49,0.45)`
* **Divider / Border**: `rgba(49,49,49,0.12)`
* **Card / Subtle Fill**: `rgba(49,49,49,0.04)`
* **Blue / Pressed**: `rgba(52,90,250,0.85)`
* **Blue / Tint BG**: `rgba(52,90,250,0.10)`

> Note: Your screens also show a **warm off-white page background**. If you want to stay strict with the 3 colors, implement it as a **white base with a very subtle warm overlay** (e.g., a gradient layer) rather than a new “token color”.

---

### 1.3 Spacing Scale (4pt grid)

Use 4pt-based spacing for consistency.

* **xs** 4
* **sm** 8
* **md** 12
* **lg** 16
* **xl** 24
* **2xl** 32
* **3xl** 40

**Layout guidance**

* Screen padding: **24**
* Card internal padding: **16**
* Section gaps: **24–32**

---

### 1.4 Radius (rounded look from your UI)

* **radius-xs:** 8 (chips, small elements)
* **radius-sm:** 12 (list icons, small cards)
* **radius-md:** 16 (cards, containers)
* **radius-lg:** 24 (large hero cards / wallet cards)
* **radius-full:** 999 (pills, segmented controls)

---

### 1.5 Elevation (soft shadows)

Very subtle, never harsh.

* **elevation-1 (cards):** `0 6 18 rgba(0,0,0,0.06)`
* **elevation-2 (floating / important):** `0 10 28 rgba(0,0,0,0.08)`

---

### 1.6 Iconography

* Outline icons for inactive states
* Filled or blue-tinted for active states
* Standard sizes:

  * App bar icons: **20–24**
  * Tab / bottom nav icons: **24**
  * Feature icons (bill tiles): **22–26**

---

## 2) Components (based on your screens)

### 2.1 App Bar (Home)

**Left:** greeting (“Hey George!”) + emoji
**Right:** search + notifications

* Height: 56–64
* Icon touch target: **44×44**
* Greeting:

  * “Hey George!”: 16, SemiBold/Bold
  * Emoji as a small accent

---

### 2.2 Primary Wallet Card (Hero card)

Dark card style in your UI.

**Style**

* BG: `#313131`
* Text: `#FFFFFF`
* Radius: 24
* Padding: 16–20
* Elevation: elevation-1

**Content layout**

* Top-left: brand/network label (e.g., VISA) small
* Top-right: masked digits
* Middle: due date label (secondary)
* Big amount: Display / Bold
* CTA: small pill button (“PAY”) aligned right

**CTA button on dark card**

* Background: `#FFFFFF`
* Text: `#313131`
* Radius: full
* Height: 28–32

---

### 2.3 Primary Button

Used for “PAY EARLY” in blue.

* BG: `#345AFA`
* Text: `#FFFFFF`
* Height: 44–48
* Radius: full or 16
* Text: 14–16, SemiBold

**States**

* Pressed: `rgba(52,90,250,0.85)`
* Disabled: blue at 35% opacity + text at 60% opacity

---

### 2.4 Segmented Control (Chart range: 1W / 1M / 3M / 6M / 1Y / ALL)

Pill container, selected segment dark.

* Container:

  * BG: `rgba(49,49,49,0.06)`
  * Radius: full
  * Height: 32–36
* Selected:

  * BG: `#313131`
  * Text: `#FFFFFF`
* Unselected:

  * Text: `rgba(49,49,49,0.65)`

---

### 2.5 Chart (Spending trend)

* Line color: `#345AFA`
* Gridlines: `rgba(49,49,49,0.12)`
* Axis labels: secondary text
* Callout value chip (“5K”) can be:

  * BG: `#313131`
  * Text: `#FFFFFF`
  * Radius: 8–12

---

### 2.6 Summary Card (Total Spend + CTA)

In your screen, it’s a dark card with a blue button.

* BG: `#313131`
* Text: `#FFFFFF`
* Button: Primary Blue
* Layout:

  * Left: “Total Spendings” + big amount
  * Right: due date label + CTA

---

### 2.7 List Item (Recent Transactions)

**Structure**

* Leading: brand/icon tile (radius 12)
* Middle: title (SemiBold) + subtitle (date/time, regular)
* Right: amount (SemiBold)

**Styles**

* Row height: 64–72
* Divider: optional; prefer whitespace (your UI feels divider-light)
* Amount color: `#313131` (or red/green *later* if you add semantic colors)

---

### 2.8 Bill Payment Tiles (Grid)

Small square tiles with icon + label.

* Tile size: ~72–88
* Radius: 12–16
* BG: `rgba(49,49,49,0.04)` or plain white with elevation-1
* Icon centered
* Label: 10–12, Regular, center aligned

---

### 2.9 Bottom Navigation

4 items (Home, Search, Wallet, Profile)

* Height: 64–72
* Active:

  * Icon color: `#345AFA`
  * Label color: `#345AFA`
  * Optional: subtle pill highlight behind active icon (`rgba(52,90,250,0.10)`)
* Inactive:

  * Icon + label: `rgba(49,49,49,0.45)`

---

## 3) Layout Patterns

### 3.1 Screen structure

* Top: App bar (greeting / back)
* Hero module (wallet card)
* Section blocks:

  * Title (bold)
  * Content cards / grids / lists
* Bottom nav anchored

### 3.2 Content density

This UI style is **low density**:

* Prefer fewer elements per screen
* Use “See all” for deeper pages
* Avoid heavy borders — use whitespace + subtle fill instead

---

## 4) Motion & Interaction

* Micro transitions: **150–220ms** ease-out
* Button press: scale 0.98 + opacity shift
* List press: subtle background tint (Ink 4% or Blue 10%)

---

## 5) Accessibility (minimum rules)

* Tap targets: **≥ 44×44**
* Body text: **≥ 14**
* Contrast:

  * Ink on white is safe
  * Secondary text opacity should not go below ~0.55 on white for readability

---

## 6) Practical Design Tokens (ready for dev)

If you want to plug into your RN theme (or Gluestack tokens), start with:

```json
{
  "font": { "family": "Montserrat", "regular": "400", "semibold": "600", "bold": "700" },
  "colors": {
    "white": "#FFFFFF",
    "primary": "#345AFA",
    "ink": "#313131",
    "textSecondary": "rgba(49,49,49,0.65)",
    "textTertiary": "rgba(49,49,49,0.45)",
    "border": "rgba(49,49,49,0.12)",
    "surfaceSubtle": "rgba(49,49,49,0.04)",
    "primaryTint": "rgba(52,90,250,0.10)"
  },
  "radius": { "xs": 8, "sm": 12, "md": 16, "lg": 24, "full": 999 },
  "space": { "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24, "2xl": 32 },
  "elevation": {
    "1": "0 6 18 rgba(0,0,0,0.06)",
    "2": "0 10 28 rgba(0,0,0,0.08)"
  }
}
```

---

If you want, I can also produce **(A)** a Gluestack theme mapping (tokens → `gluestack-ui` config), or **(B)** a component inventory for your MVP screens (Wallet card, Transaction row, Category chips, FAB, etc.) with exact props + states.
