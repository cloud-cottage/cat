# CSS Layout Usage Example

This file documents how the theme layout system can be consumed in React without shipping an unused demo component into the app bundle.

## Example Flow

1. Read layout metadata for a theme from the CSS parser.
2. Apply the parsed grid layout to a container element.
3. Render modules by matching layout metadata keys to runtime module data.
4. React to breakpoint changes by recalculating layout metadata when needed.

## Notes

- Keep example code in documentation files unless it is imported by the application.
- If a runnable example is needed again, add it as a `.tsx` or `.jsx` module with complete imports and types.
