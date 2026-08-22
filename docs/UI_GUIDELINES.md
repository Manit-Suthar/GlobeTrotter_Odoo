# UI Guidelines

## Visual Hierarchy & Theme
GlobeTrotter should feel like a premium, trustworthy travel product, not a generic dashboard.

- **Primary Colors**: Deep oceanic blues or earthy greens, complemented by warm accents (e.g., sunset orange or sandy yellow) to evoke travel.
- **Backgrounds**: Clean off-white or very light gray (`#F9FAFB`) for light mode to reduce eye strain; deep charcoal (`#111827`) for dark mode.
- **Avoid**: Random gradients, excessive neon colors, or default-looking generic UI.

## Typography
- **Font Family**: Inter or Roboto for clean, modern readability.
- **Headings**: Bold, structured, not excessively large. Use visual hierarchy (H1 > H2 > H3) correctly.
- **Body**: 16px base size with 1.5 line-height for readability.

## Components

### Buttons
- **Primary**: Solid background (brand color), subtle hover state (slightly darker or lighter).
- **Secondary**: Outlined or subtle background.
- **Destructive**: Red hue, clear warning context.
- **Border Radius**: Subtly rounded (e.g., `rounded-md` or `rounded-lg` in Tailwind, 6px-8px). Avoid fully pill-shaped buttons everywhere unless for specific tags/chips.

### Cards & Containers
- **Borders & Shadows**: Use very subtle borders (`border-gray-200`) and soft, diffuse shadows (`shadow-sm` or `shadow-md`).
- **Avoid**: Excessive glassmorphism (backdrop-blur) unless used sparingly for floating nav bars or modals. Avoid harsh, dark shadows.
- **Padding**: Generous padding (`p-6` or `p-8`) to let content breathe.

### Navigation
- Clear top or side navigation.
- Active states must be obvious (e.g., underline, bold text, or distinct background).

### Itinerary & Calendar
- **Timeline**: Use a vertical connected line to show the progression of days/cities.
- **Cards**: Activity cards should be compact but show time, name, and estimated cost clearly.
- **Drag-and-Drop (P2)**: If implemented, ensure clear grab handles.

## State Management
- **Loading States**: Use skeleton screens for heavy data components (itinerary, budget). Use simple spinners for button actions.
- **Empty States**: Friendly illustrations or text suggesting the next action (e.g., "You have no trips yet. Plan your next adventure!").
- **Error States**: Clear, non-technical error messages in a visible toast or alert box.
