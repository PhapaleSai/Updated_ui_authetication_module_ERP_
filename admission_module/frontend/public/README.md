# College ERP — Shared UI Theme

A fully generic, college-agnostic UI theme for engineering college ERP systems.
Brand colours, fonts and logos live in per-college config files — the core theme files contain zero institution-specific code.

---

## Repository Structure

```
├── erp-theme.css              ← Generic theme (styles, design tokens, components)
├── erp-theme.js               ← Generic JS (sidebar, modal, toast, validation…)
├── erp-theme.html             ← Kitchen-sink component demo
│
├── examples/                  ← ★ Ready-to-run module examples
│   ├── 01-login.html          ← Auth / login page
│   ├── 02-dashboard.html      ← Main dashboard with stats, chart, table
│   ├── 03-admission-form.html ← Multi-step admission form
│   ├── 04-notifications.html  ← Notification centre
│   └── README.md              ← How to run & extend examples
│
├── colleges/
│   ├── pvg/                   ← PVG COET&M, Pune
│   │   ├── config.css         ← Brand token overrides (#003A6A navy, Poppins)
│   │   ├── assets/
│   │   │   ├── icon-180.jpg   ← Square logo (sidebar circle, app icon)
│   │   │   └── logo-wordmark.jpg ← Horizontal wordmark
│   │   └── README.md
│   │
│   └── <your-college>/        ← Add new colleges here (see below)
│       ├── config.css
│       └── assets/
│           └── icon-180.jpg
│
└── assets/
    └── logos/                 ← Shared/master logo files
        ├── pvgcoet-icon-180.jpg
        ├── pvgcoet-logo.jpg
        └── README.md
```

---

## Quick Start — any module page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Font Awesome (icons) -->
  <link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

  <!-- ★ 1. Generic ERP theme -->
  <link rel="stylesheet" href="erp-theme.css" />

  <!-- ★ 2. College-specific config — swap this for each college -->
  <link rel="stylesheet" href="colleges/pvg/config.css" />
</head>
<body>
  <!-- module HTML using erp-* classes -->

  <!-- ★ ERP JS -->
  <script src="erp-theme.js"></script>
</body>
</html>
```

> The Poppins font is loaded inside each college `config.css` via `@import`.

---

## Examples

The [`examples/`](examples/) folder contains four ready-to-run pages covering the most common ERP modules:

| Page | What it shows |
|------|---------------|
| [01-login.html](examples/01-login.html) | Role-based login, password toggle, SSO & OTP buttons, form validation |
| [02-dashboard.html](examples/02-dashboard.html) | Stat cards, enrolment bar chart, dept progress bars, mini calendar, student table, activity log |
| [03-admission-form.html](examples/03-admission-form.html) | 4-step admission wizard — personal, academic, documents, review + success state |
| [04-notifications.html](examples/04-notifications.html) | Notification centre with filter tabs, compose modal, unread state, badge counter |

**Run locally from the project root:**

```bash
python3 -m http.server 8080
# then open http://localhost:8080/examples/02-dashboard.html
```

See [`examples/README.md`](examples/README.md) for full usage instructions and a copy-paste layout shell.

---

## Design Tokens

All values are CSS custom properties on `:root`.  
Override any token in your `colleges/<name>/config.css`.

| Token | Default | Purpose |
|-------|---------|---------|
| `--erp-primary` | `#1a56db` | Sidebar, headings, buttons |
| `--erp-primary-dark` | `#1241a3` | Hover / active states |
| `--erp-primary-light` | `#2563eb` | Gradients, avatar backgrounds |
| `--erp-accent` | `#60a5fa` | Active nav border, info tint |
| `--erp-dark` | `#2D2D2D` | Body text, secondary button |
| `--erp-surface` | `#f4f6f9` | Page background |
| `--erp-card` | `#ffffff` | Card / panel background |
| `--erp-border` | `#d9dee6` | Default borders |
| `--erp-text` | `#444444` | Body text |
| `--erp-text-muted` | `#707070` | Secondary / placeholder text |
| `--erp-success` | `#28a745` | |
| `--erp-warning` | `#ffc107` | |
| `--erp-danger` | `#f52846` | |
| `--erp-font` | `'Poppins'` | Body / UI font |
| `--erp-sidebar-w` | `260px` | Sidebar width |
| `--erp-topbar-h` | `64px` | Topbar height |

---

## Adding a New College

1. Create the folder:
   ```
   colleges/<college-slug>/
   ├── config.css
   └── assets/
       └── icon-180.jpg    (square logo, 180×180)
   ```

2. In `config.css`, override only the tokens that differ:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=YourFont&display=swap');

   :root {
     --erp-primary:       #YOUR_COLOR;
     --erp-primary-dark:  #DARKER;
     --erp-primary-light: #LIGHTER;
     --erp-accent:        #ACCENT;
     --erp-font:          'YourFont', sans-serif;
   }
   ```

3. In every module page, swap the `<link>` for the college config.  
   The core `erp-theme.css` and `erp-theme.js` are **never modified**.

---

## Layout Shell

```html
<aside class="erp-sidebar">
  <div class="erp-sidebar__brand">
    <img class="erp-sidebar__logo" src="colleges/<slug>/assets/icon-180.jpg" alt="Logo" />
    <div class="erp-sidebar__brand-text">
      <h2>College Short Name</h2>
      <span>Module Name</span>
    </div>
  </div>

  <nav class="erp-sidebar__nav">
    <div class="erp-nav-label">Section</div>
    <a class="erp-nav-item erp-nav-item--active" href="/">
      <i class="fa-solid fa-gauge-high"></i>
      <span class="erp-nav-item__text">Dashboard</span>
    </a>
  </nav>

  <div class="erp-sidebar__footer">
    <div class="erp-avatar erp-avatar--md">AB</div>
    <div class="erp-sidebar__user-info"><p>User Name</p><span>Role</span></div>
    <i class="fa-solid fa-right-from-bracket erp-sidebar__logout"></i>
  </div>
</aside>

<header class="erp-topbar">
  <button class="erp-topbar__btn" data-erp-sidebar-toggle>
    <i class="fa-solid fa-bars"></i>
  </button>
  <nav class="erp-topbar__breadcrumb" data-erp-breadcrumb></nav>
  <!-- search, actions, profile -->
</header>

<main class="erp-main" data-erp-page="Module / Page">
  <!-- content -->
</main>
```

---

## Component Reference

### Cards
```html
<div class="erp-card">
  <div class="erp-card__header">
    <div><div class="erp-card__title">Title</div><div class="erp-card__subtitle">Subtitle</div></div>
    <button class="erp-card__action">Action <i class="fa-solid fa-arrow-right"></i></button>
  </div>
  <div class="erp-card__body"><!-- content --></div>
</div>
```

### Stat Cards
```html
<div class="erp-stat-card erp-stat-card--primary">   <!-- --primary|--success|--warning|--danger -->
  <div class="erp-stat-card__header">
    <div class="erp-stat-card__icon"><i class="fa-solid fa-users"></i></div>
    <span class="erp-stat-card__trend erp-stat-card__trend--up">+4.2%</span>
  </div>
  <div class="erp-stat-card__value">2,847</div>
  <div class="erp-stat-card__label">Total Students</div>
</div>
```

### Buttons
```html
<button class="erp-btn erp-btn--primary">Primary</button>
<button class="erp-btn erp-btn--secondary">Secondary</button>
<button class="erp-btn erp-btn--outline">Outline</button>
<button class="erp-btn erp-btn--ghost">Ghost</button>
<button class="erp-btn erp-btn--success">Approve</button>
<button class="erp-btn erp-btn--danger">Reject</button>
<!-- Sizes: erp-btn--sm  erp-btn--lg -->
```

### Status Pills & Badges
```html
<span class="erp-pill erp-pill--active">Active</span>
<span class="erp-pill erp-pill--pending">Pending</span>
<span class="erp-pill erp-pill--inactive">Inactive</span>

<span class="erp-badge erp-badge--primary">New</span>
<span class="erp-badge erp-badge--success">Verified</span>
<span class="erp-badge erp-badge--danger">Overdue</span>
```

### Department Badges
```html
<!-- Use --1 through --8 or add your own in config.css -->
<span class="erp-dept erp-dept--1">Computer Science</span>
<span class="erp-dept erp-dept--2">Mechanical</span>
```

### Forms
```html
<div class="erp-form-grid-3">
  <div class="erp-form-group">
    <label>Name *</label>
    <input class="erp-form-control" type="text" required />
    <span class="erp-form-hint">Hint text</span>
  </div>
</div>
```

### Alerts
```html
<div class="erp-alert erp-alert--info">   <i class="fa-solid fa-circle-info"></i>   Info</div>
<div class="erp-alert erp-alert--success"><i class="fa-solid fa-circle-check"></i>  Success</div>
<div class="erp-alert erp-alert--warning"><i class="fa-solid fa-triangle-exclamation"></i> Warning</div>
<div class="erp-alert erp-alert--danger"> <i class="fa-solid fa-circle-xmark"></i>  Error</div>
```

### Modal
```html
<button data-erp-modal-open="myModal" class="erp-btn erp-btn--primary">Open</button>

<div class="erp-modal-overlay" id="myModal">
  <div class="erp-modal">
    <div class="erp-modal__header">
      <span class="erp-modal__title">Title</span>
      <button class="erp-modal__close" data-erp-modal-close><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="erp-modal__body"><!-- content --></div>
    <div class="erp-modal__footer">
      <button class="erp-btn erp-btn--ghost" data-erp-modal-close>Cancel</button>
      <button class="erp-btn erp-btn--primary">Save</button>
    </div>
  </div>
</div>
```

---

## JavaScript API (`ERP` global)

```js
ERP.Toast.show('Saved!', 'success');          // type: success|danger|warning|info
ERP.Toast.show('Error', 'danger', 5000);      // custom duration ms

ERP.Confirm.show({
  title: 'Delete?', message: 'Cannot be undone.',
  danger: true,
  onConfirm: () => { /* … */ }
});

ERP.Modal.open('myModal');
ERP.Modal.close('myModal');

ERP.Notifications.setBadge(5);   // set unread count dot
ERP.Notifications.setBadge(0);   // clear dot

ERP.Form.validate(formEl);       // → true / false (marks inline errors)
ERP.Form.clearErrors(formEl);

ERP.Loader.show();
ERP.Loader.hide();

ERP.Sidebar.toggle();
```

### Data Attributes (no JS needed)

| Attribute | Element | Effect |
|-----------|---------|--------|
| `data-erp-sidebar-toggle` | `<button>` | Toggles sidebar |
| `data-erp-modal-open="id"` | `<button>` | Opens modal overlay `#id` |
| `data-erp-modal-close` | `<button>` | Closes nearest `.erp-modal-overlay` |
| `data-erp-notif-toggle` | `<button>` | Toggles notification panel |
| `data-erp-sortable` | `<table>` | Enables click-to-sort columns |
| `data-erp-page="X / Y"` | `<main>` | Auto-builds breadcrumb |
| `data-erp-breadcrumb` | `<nav>` | Target for breadcrumb builder |

---

## Auth Page Layout

```html
<div class="erp-auth-page">
  <div class="erp-auth-page__brand">
    <img src="colleges/<slug>/assets/icon-180.jpg" alt="Logo" />
    <h1>College Name</h1>
    <p>Tagline or address</p>
  </div>
  <div class="erp-auth-page__form">
    <div class="erp-auth-box">
      <h2>Sign In</h2>
      <p>Enter your credentials to continue</p>
      <!-- form here -->
    </div>
  </div>
</div>
```

---

## Colleges Using This Theme

| Folder | College | Primary Colour |
|--------|---------|----------------|
| `colleges/pvg/` | PVG COET&M, Pune | `#003A6A` |
| _(add yours)_ | | |

---

## Module Checklist

- [ ] `<link>` `erp-theme.css`
- [ ] `<link>` `colleges/<slug>/config.css`
- [ ] `<script>` `erp-theme.js` before `</body>`
- [ ] Set `data-erp-page="Module / Page"` on `<main>`
- [ ] `data-erp-sidebar-toggle` on hamburger button
- [ ] `data-erp-breadcrumb` on topbar `<nav>`

---

## License

Internal use only.
