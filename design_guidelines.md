# Invoice Generator Design Guidelines

## Design Approach
**Reference-Based:** Modern invoice/billing applications (Wave, Zoho Invoice, Stripe Billing)
- Professional, trustworthy aesthetic suitable for business documents
- Clean, form-focused layouts with emphasis on data entry efficiency
- Dashboard-style interface with clear hierarchy

## Typography
- **Font Family:** Default Tailwind font stack (system sans-serif)
- **Hierarchy:**
  - Invoice titles/headers: text-2xl to text-3xl, font-semibold
  - Section headings: text-lg, font-medium
  - Form labels: text-sm, font-medium
  - Body text: text-base
  - Helper text: text-sm, text-gray-600

## Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 to p-6
- Section gaps: gap-6 to gap-8
- Container margins: m-4 to m-8
- Form field spacing: space-y-4

**Responsive Breakpoints:**
- Mobile: Single-column, stacked inputs
- Tablet (md:): Two-column sections where appropriate
- Desktop (lg:): Full layout with proper spacing
- Print: Optimized A4 layout

## Color Palette (Light/Dark Modes)
**Accents:** Blue/teal for primary actions (blue-600, teal-500)
**Backgrounds:** 
- Light: bg-white, bg-gray-50, bg-slate-100
- Dark: bg-gray-900, bg-gray-800, bg-slate-900
**Text:**
- Light: text-gray-900, text-gray-600
- Dark: text-gray-100, text-gray-400
**Borders:** border-gray-200 (light), border-gray-700 (dark)

## Component Library

### Forms & Inputs
- Consistent input styling: rounded-lg, border-gray-300, focus:ring-2, focus:ring-blue-500
- Error states: border-red-500, text-red-600
- Labels above inputs: block, text-sm, font-medium, mb-2
- Touch-friendly: min-h-[44px] for mobile
- Date pickers: Native or accessible calendar component

### Buttons
- **Primary:** bg-blue-600, hover:bg-blue-700, text-white, px-6, py-2.5, rounded-lg
- **Secondary:** border, border-gray-300, hover:bg-gray-50, text-gray-700
- **Danger:** bg-red-600, hover:bg-red-700 for delete actions
- Consistent height and padding across variants

### Tables (Line Items)
- Striped rows: odd:bg-gray-50 (light), odd:bg-gray-800 (dark)
- Hover states: hover:bg-gray-100
- Column headers: bg-gray-100, font-semibold, text-left, px-4, py-3
- Editable cells: inline inputs with minimal chrome
- Add row button below table

### Cards & Containers
- Sections wrapped in cards: bg-white, shadow-sm, rounded-xl, p-6
- Dark mode cards: bg-gray-800, shadow-lg
- Subtle borders for separation

### Navigation/Header
- Fixed or sticky header with app logo, invoice number display
- Dark mode toggle: sun/moon icon with smooth transition
- Clean, minimal chrome

### Status Badges
- Draft: bg-gray-100, text-gray-800
- Sent: bg-blue-100, text-blue-800
- Paid: bg-green-100, text-green-800
- Overdue: bg-red-100, text-red-800
- Rounded-full, px-3, py-1, text-sm, font-medium

### Invoice Preview
- Side-by-side on desktop (form left, preview right)
- Stacked on mobile
- Print styles: @media print with white backgrounds, no shadows

### Invoice List View
- Grid or table layout showing: invoice number, client, date, amount, status
- Search bar at top
- Filter dropdowns
- Quick action buttons (edit, delete, duplicate) on hover/tap

## Animations
**Minimal & Purposeful:**
- Dark mode toggle: transition-colors duration-200
- Button hover: transition-all duration-150
- Add/remove row: fade-in/fade-out
- Modal/dialog: fade + scale entrance
- No distracting animations during data entry

## Accessibility
- Semantic HTML: `<form>`, `<table>`, `<button>`
- ARIA labels for icon buttons
- Focus indicators on all interactive elements
- Color contrast ratio minimum 4.5:1
- Keyboard navigation: Tab between fields, Enter to add row

## Empty States
- New user: Friendly illustration + "Create your first invoice" CTA
- No saved invoices: Clear guidance on getting started

## Images
**No hero images required** - This is a utility application focused on forms and data entry, not marketing content. Logo upload placeholder shown as dashed border box with upload icon.