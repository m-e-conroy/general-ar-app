# Touch Interface for 3D AR Models

## Overview
The touch interface system provides interactive hotspots and popup information cards that overlay 3D AR content. Hotspots are positioned in 3D space and automatically project to 2D screen coordinates, following the model as the camera moves.

## Features

✅ **Interactive Hotspots** - Clickable markers positioned in 3D space
✅ **Popup Information Cards** - Rich HTML content in elegant popup overlays  
✅ **Real-time Projection** - Automatically converts 3D positions to 2D screen coordinates
✅ **Touch-Optimized** - Designed for mobile AR experiences with proper touch targets
✅ **Responsive Positioning** - Smart popup placement that stays on screen
✅ **Glassmorphic Design** - Modern, semi-transparent UI with blur effects
✅ **Visibility Management** - Hotspots hide when behind camera or off-screen

## Quick Start

### 1. Basic Usage

The TouchInterface is automatically initialized with your AR application. To add hotspots:

```javascript
// Add a hotspot at a specific 3D position
this.touchInterface.addHotspot({
    position: new THREE.Vector3(0, 0.5, 0),  // X, Y, Z in 3D space
    label: 'Component Name',
    icon: '🔵',
    content: `
        <p><strong>Title</strong></p>
        <p>Description of this component...</p>
    `,
    parent: this.anchor.group  // Attach to AR anchor for tracking
});
```

### 2. Hotspot Configuration

Each hotspot accepts the following options:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `position` | Vector3 | ✅ | 3D position in world space |
| `label` | string | ✅ | Title for the hotspot and popup header |
| `content` | string | ✅ | HTML content for the popup card |
| `icon` | string | ❌ | Emoji or text displayed in hotspot (default: 'ℹ️') |
| `parent` | Object3D | ❌ | Parent 3D object for relative positioning |

### 3. Content Examples

**Simple Text:**
```javascript
content: '<p>This is a simple description.</p>'
```

**Rich HTML:**
```javascript
content: `
    <p><strong>Component Overview</strong></p>
    <p>Detailed description with formatting.</p>
    <ul>
        <li>Feature 1</li>
        <li>Feature 2</li>
        <li>Feature 3</li>
    </ul>
    <p><a href="https://example.com" target="_blank">Learn More</a></p>
`
```

## Advanced Usage

### Adding Hotspots Dynamically

```javascript
// When loading a GLTF model
await this.loadGLTFModel('./assets/models/product.glb', {
    scale: 0.5
});

// Add hotspots for specific parts
const model = this.models[0];

this.touchInterface.addHotspot({
    position: new THREE.Vector3(0.2, 0.4, 0),
    label: 'Handle',
    icon: '👆',
    content: '<p>Ergonomic handle design with soft-grip material.</p>',
    parent: model
});
```

### Managing Hotspots

```javascript
// Remove a specific hotspot
this.touchInterface.removeHotspot('hotspot-0');

// Clear all hotspots
this.touchInterface.clearHotspots();

// Enable/disable entire interface
this.touchInterface.enable();
this.touchInterface.disable();
```

### Custom Positioning

Hotspots can be positioned:

**In world space:**
```javascript
position: new THREE.Vector3(0, 1, 0)  // Absolute position
```

**Relative to model:**
```javascript
position: new THREE.Vector3(0.5, 0.2, 0),
parent: modelObject  // Position relative to model
```

## Styling Customization

### CSS Variables

Customize the appearance using CSS variables in `styles.css`:

```css
:root {
    --color-primary: #005bbb;      /* Hotspot border color */
    --color-primary-dark: #002f56; /* Popup header gradient */
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
}
```

### Custom Hotspot Styles

Override `.ar-hotspot` class for custom appearance:

```css
.ar-hotspot {
    width: 50px;        /* Change size */
    height: 50px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
}
```

### Custom Popup Styles

Modify `.popup-card` for different popup appearance:

```css
.popup-card {
    max-width: 400px;   /* Change width */
    border-radius: 20px; /* More rounded corners */
}
```

## API Reference

### TouchInterface Class

#### Methods

**`init()`**
Initializes the touch interface and attaches to DOM.

**`addHotspot(config)`**
Adds a new interactive hotspot.
- Returns: Hotspot object with `id`, `element`, `popup` properties

**`removeHotspot(hotspotId)`**
Removes a hotspot by ID.

**`clearHotspots()`**
Removes all hotspots.

**`enable()`**
Enables the touch interface.

**`disable()`**
Disables the touch interface and hides hotspots.

**`updateHotspotPositions()`**
Updates all hotspot 2D positions. Called automatically in render loop.

**`dispose()`**
Cleans up resources and removes event listeners.

#### Internal Methods

**`project3DTo2D(position, parent)`**
Projects 3D world position to 2D screen coordinates.
- Returns: `{ x, y, visible }`

**`positionPopup(popup, anchor)`**
Positions popup near hotspot with smart boundary detection.

## Best Practices

### 1. Performance
- Update hotspot positions only in render loop (automatic)
- Limit total hotspots to 5-8 per model for performance
- Use simple HTML content; avoid heavy images

### 2. Content Design
- Keep popup content concise (2-4 short paragraphs)
- Use bullet points for scannable information
- Ensure minimum 44x44px touch target size
- Test on mobile devices for readability

### 3. Positioning
- Place hotspots at key model features
- Avoid clustering hotspots too closely
- Use parent parameter for model-relative positioning
- Test visibility from different camera angles

### 4. Accessibility
- Use descriptive labels for screen readers
- Maintain sufficient color contrast
- Support keyboard navigation where applicable
- Provide text alternatives for icons

## Examples

### Example 1: Product Showcase

```javascript
// Hotspot for product feature
this.touchInterface.addHotspot({
    position: new THREE.Vector3(0.3, 0.5, 0),
    label: 'Premium Materials',
    icon: '✨',
    content: `
        <p><strong>High-Quality Construction</strong></p>
        <p>Made from aerospace-grade aluminum with a brushed finish.</p>
        <ul>
            <li>Lightweight yet durable</li>
            <li>Corrosion resistant</li>
            <li>Recyclable materials</li>
        </ul>
    `,
    parent: this.anchor.group
});
```

### Example 2: Educational Content

```javascript
// Hotspot for anatomical model
this.touchInterface.addHotspot({
    position: new THREE.Vector3(0, 0.8, 0),
    label: 'Heart Anatomy',
    icon: '❤️',
    content: `
        <p><strong>Cardiac Structure</strong></p>
        <p>The heart is divided into four chambers:</p>
        <ul>
            <li>Right Atrium - receives deoxygenated blood</li>
            <li>Right Ventricle - pumps to lungs</li>
            <li>Left Atrium - receives oxygenated blood</li>
            <li>Left Ventricle - pumps to body</li>
        </ul>
    `,
    parent: this.anchor.group
});
```

### Example 3: Technical Specifications

```javascript
// Hotspot for machinery component
this.touchInterface.addHotspot({
    position: new THREE.Vector3(-0.4, 0.2, 0),
    label: 'Motor Assembly',
    icon: '⚙️',
    content: `
        <p><strong>Electric Motor</strong></p>
        <p><strong>Specifications:</strong></p>
        <ul>
            <li>Power: 2.5 kW</li>
            <li>Voltage: 220V AC</li>
            <li>Speed: 3000 RPM</li>
            <li>Efficiency: 92%</li>
        </ul>
        <p>Maintenance interval: 6 months</p>
    `,
    parent: this.anchor.group
});
```

## Troubleshooting

### Hotspots Not Appearing
- Ensure `touchInterface.init()` has been called
- Check that target is detected (hotspots hide when target is lost)
- Verify positions are within camera view
- Check browser console for errors

### Hotspots in Wrong Position
- Confirm `parent` parameter is set correctly
- Ensure `updateHotspotPositions()` is called in render loop
- Check that camera and anchor are properly initialized

### Popup Not Opening
- Verify click events are not blocked by other UI elements
- Check popup content is valid HTML
- Ensure popup has proper z-index in CSS

### Performance Issues
- Reduce number of hotspots
- Simplify popup HTML content
- Check for memory leaks with `dispose()` on cleanup

## Browser Compatibility

- ✅ Chrome/Edge 88+ (recommended)
- ✅ Safari 13+ (iOS/macOS)
- ✅ Firefox 85+
- ⚠️ Older browsers may not support backdrop-filter (glassmorphism)

## License

Part of the UB AR Application project - MIT License
