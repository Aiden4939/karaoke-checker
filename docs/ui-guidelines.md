# UI Guidelines

## Components

- Prefer existing `components/ui` and `components/common` before creating new primitives.
- Keep page composition in `views/` and shared chrome in `layouts/`.

## Styling

- Use Tailwind utility classes and existing design tokens.
- Do not introduce ad-hoc colors, font sizes, spacing, or shadows.
- Support responsive layouts for desktop, tablet, and mobile.

## States

Every data-driven view must handle:

- Loading
- Success
- Error
- Empty, when applicable

## Accessibility

- Use semantic HTML and visible focus styles.
- Provide labels for interactive controls.
- Run axe checks for user-facing changes.

## Verification

- Check browser console for errors.
- Check network tab for failed required requests.
- Validate desktop and mobile layouts after UI changes.
