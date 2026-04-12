# PVG COET&M — Logo Assets

All official logos sourced from [pvgcoet.ac.in](https://www.pvgcoet.ac.in/).

## Files

| File | Dimensions | Use Case |
|------|-----------|----------|
| `pvgcoet-logo.jpg` | 520 × 103 px | Page headers, printed documents, email templates |
| `pvgcoet-icon-180.jpg` | 180 × 180 px | Sidebar circle avatar, app icon, favicon source |

## Usage in HTML

```html
<!-- Sidebar logo (circle crop via CSS) -->
<img class="pvg-sidebar__logo"
     src="assets/logos/pvgcoet-icon-180.jpg"
     alt="PVG COET&M" />

<!-- Full wordmark (header / login page) -->
<img src="assets/logos/pvgcoet-logo.jpg"
     alt="PVG's College of Engineering, Technology and Management, Pune"
     style="height: 48px; width: auto;" />
```

## Usage in CSS

```css
/* As a background image */
.pvg-brand-header {
  background-image: url('../assets/logos/pvgcoet-logo.jpg');
  background-size: contain;
  background-repeat: no-repeat;
}
```

## CDN / Remote Usage

If your module cannot access the local file path, use the remote URL:

```html
<!-- Sidebar icon (square, 180×180) -->
<img src="https://www.pvgcoet.ac.in/wp-content/uploads/2019/06/cropped-pvg-logo-180x180.jpg"
     alt="PVG Logo" />

<!-- Horizontal wordmark (520×103) -->
<img src="https://www.pvgcoet.ac.in/wp-content/uploads/2025/07/pvgcoet-logo-v3.jpg"
     alt="PVG Logo" />
```

## Adding More Assets

Place additional brand assets in this folder following the naming convention:

```
pvgcoet-<description>-<WxH>.<ext>
```

Examples:
- `pvgcoet-logo-dark-520x103.png`  — dark/inverted wordmark
- `pvgcoet-icon-512.png`           — high-res app icon
- `pvg-naac-badge.png`             — NAAC A accreditation badge
