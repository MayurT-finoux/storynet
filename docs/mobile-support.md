# Mobile Browser Support Request

The application currently targets desktop web browsers. We would like to enhance it so that all interactions function correctly when the app is opened in a mobile browser (phone/tablet). This includes:

- Canvas panning and zooming via touch gestures (drag, pinch).
- Adding pages/text using on-screen controls or touch-and-hold.
- Creating connections by tapping icons and dragging to target pages.
- Editing page content with mobile-friendly input (focus on textareas and touch keyboard support).
- The status capsule label should be tappable open the dropdown.
- The character panel and other modals must be usable via touch.

## Reported Problem

> When opening the app in a mobile browser, linking pages (creating connections) fails or behaves inconsistently. Dragging or tapping the connection button does not always register, and the connection line may not follow the touch point.

## Goals

- Identify and fix touch event handling for connections.
- Ensure no desktop-specific mouse assumptions break mobile usage.
- Add responsive layout tweaks if necessary (buttons large enough, toolbar accessible).

Consider using `pointer-events` and `touch-action` CSS or adding `onTouchStart`/`onTouchMove` handlers alongside mouse events.  
Preserve existing desktop interactions while enabling full feature parity on mobile.  

Document progress/implementation steps in this file as the work proceeds.