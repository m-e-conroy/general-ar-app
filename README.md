# AR Image Tracking Application

A web-based Augmented Reality application that uses image tracking to display 3D content overlaid on real-world images through your device's camera.

## 🚀 Features

- **Image-based AR Tracking**: Detect and track custom images or documents
- **3D Content Display**: Render interactive 3D models and animations
- **Video Playback**: Display videos as textures in 3D space (flat, curved, or 360°)
- **Session Recording**: Record your AR experiences to video files
- **Cross-Platform**: Works on iOS Safari and Android Chrome
- **Responsive UI**: Modern, glassmorphic interface with smooth animations
- **Debug Mode**: Visual helpers for development and testing

## 📋 Requirements

### Browser Requirements
- **iOS**: Safari 13+ on iOS 13+
- **Android**: Chrome 88+ on Android 8+
- **Desktop**: Chrome/Edge 88+ (for testing with webcam)

### Device Requirements
- Mobile device with rear camera
- WebGL 2.0 support
- Minimum 2GB RAM
- Good lighting conditions for tracking

## 🛠️ Setup Instructions

### 1. Prepare Target Images

Before the AR app can work, you need to compile your target images:

1. **Choose Your Images**:
   - Use high-contrast images with distinctive features
   - Recommended size: 1024x1024px
   - Format: PNG or JPG
   - Examples: logos, posters, book covers, product packaging

2. **Compile Target Images**:

   **Option A: Online Compiler (Easiest)**
   - Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile
   - Upload your target image(s)
   - Set "Max tracks" to 2 (or your preference)
   - Click "Compile"
   - Download the generated `targets.mind` file
   - Place it in `assets/targets/targets.mind`

   **Option B: CLI Compiler**
   ```bash
   # Install compiler
   npm install -g mind-ar
   
   # Compile your images
   mind-ar-compiler compile \
     --input ./assets/targets/target1.png \
     --input ./assets/targets/target2.png \
     --output ./assets/targets/targets.mind \
     --max-track 2
   ```

### 2. Add 3D Models (Optional)

To display custom 3D models instead of the default geometric shapes:

1. Place your GLTF/GLB models in `assets/models/`
2. Edit `main.js` in the `load3DContent()` method:
   ```javascript
   await this.loadGLTFModel('./assets/models/your-model.glb', {
       scale: 0.5,
       position: { x: 0, y: 0, z: 0 },
       rotation: { x: 0, y: 0, z: 0 }
   });
   ```

### 3. Add Videos (Optional)

To display videos in AR:

1. Place video files in `assets/videos/`
2. In `load3DContent()` method, add:
   ```javascript
   this.videoManager.loadVideo('myVideo', {
       src: './assets/videos/demo.mp4',
       width: 1.6,
       height: 0.9,
       position: { x: 0, y: 0.5, z: 0 },
       loop: true,
       muted: false
   });
   ```

### 4. Deploy

**Option A: GitHub Pages**
1. Create a GitHub repository
2. Push all files to the repository
3. Go to Settings → Pages
4. Select main branch as source
5. Your app will be available at: `https://username.github.io/repo-name/`

**Option B: Local Testing**
```bash
# Install a simple HTTP server
npm install -g http-server

# Run server
http-server -p 8080

# Open browser to http://localhost:8080
```

**Important**: HTTPS is required for camera access. Use GitHub Pages, Netlify, or configure SSL for local testing.

## 📱 Usage Instructions

### Basic Usage

1. **Open the Application**:
   - Visit your deployed URL on a mobile device
   - Allow camera permissions when prompted

2. **Scan Target Image**:
   - Point your camera at a compiled target image
   - Keep the device steady
   - The 3D content will appear when the target is detected

3. **Interact with Content**:
   - View from different angles
   - Tap on 3D objects (if interactive features are enabled)
   - Use video controls if videos are present

### UI Controls

- **Top Bar**: Instructions and status
- **Bottom Bar**: Video playback controls (when video is active)
- **Bottom Right**: Action buttons
  - 🎥 Recording toggle
  - ⚙️ Settings
  - ℹ️ Help/Info

### Recording AR Sessions

1. Tap the recording icon (bottom right)
2. Tap "Record" to start recording
3. Perform your AR session
4. Tap "Stop" to finish
5. Video will automatically download

### Settings

Access settings via the gear icon:
- **Debug Mode**: Show axis and grid helpers
- **Auto-rotate**: Automatically rotate 3D models
- **Max Tracking**: Number of simultaneous targets to track (1-5)

## 🎨 Customization

### Modify Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --color-primary: #4f46e5;     /* Primary accent color */
    --color-secondary: #06b6d4;   /* Secondary accent */
    --color-success: #10b981;     /* Success state */
    --color-error: #ef4444;       /* Error state */
}
```

### Adjust Lighting

Modify lighting in `main.js` → `setupLighting()`:

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Brighter
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
```

### Change Animation Speed

Edit `updateCustomAnimations()` in `main.js`:

```javascript
const speed = 1.0; // Increase for faster rotation
model.rotation.y += delta * speed;
```

## 🐛 Troubleshooting

### Camera Not Starting
- **Cause**: HTTPS not enabled or permissions denied
- **Solution**: 
  - Verify page is served over HTTPS
  - Check browser camera permissions
  - Try a different browser
  - Clear site data and reload

### Target Not Detected
- **Cause**: Poor image quality or lighting
- **Solution**:
  - Verify target has >50 feature points (check compiler output)
  - Improve lighting conditions
  - Ensure target is at least 10cm in size
  - Reduce distance to target
  - Keep camera steady

### Jittery Tracking
- **Cause**: Performance bottleneck or camera instability
- **Solution**:
  - Reduce 3D model polygon count
  - Lower max tracking targets in settings
  - Disable auto-rotate
  - Use a device with better specs

### 3D Model Not Appearing
- **Cause**: Model not loaded or incorrect path
- **Solution**:
  - Check browser console for errors
  - Verify file paths (case-sensitive)
  - Ensure model is added to anchor group
  - Check model file format (GLTF/GLB only)

### Out of Memory
- **Cause**: Too many or too large assets
- **Solution**:
  - Compress textures and models
  - Use Draco compression for GLTF
  - Limit texture resolution to 2048x2048
  - Dispose unused objects

## 📚 Technical Documentation

For detailed technical information, see:
- `docs/design-and-technical.txt` - Complete technical specification
- Architecture diagrams
- API documentation
- Performance optimization guides

## 🔧 Development

### Project Structure

```
UB AR/
├── index.html              # Main HTML entry
├── styles.css             # Application styles
├── main.js                # Main application logic
├── assets/
│   ├── targets/
│   │   └── targets.mind   # Compiled target file (required)
│   ├── models/            # 3D models (GLTF/GLB)
│   ├── videos/            # Video files
│   └── sounds/            # Audio files
├── js/
│   ├── video-manager.js   # Video management class
│   └── ar-recorder.js     # Session recording class
└── docs/
    └── design-and-technical.txt
```

### Building for Production

```bash
# Minify JavaScript
npx terser main.js -o main.min.js -c -m

# Minify CSS
npx csso styles.css -o styles.min.css

# Optimize models
gltf-pipeline -i model.glb -o model-optimized.glb -d
```

Update `index.html` to reference minified files.

## 📄 License

This project is generated from the technical specification and is provided as-is for educational and commercial use.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional AR features
- Performance optimizations
- UI/UX enhancements
- Better error handling
- More examples and demos

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Consult the technical documentation
4. Check MindAR documentation: https://hiukim.github.io/mind-ar-js-doc/

## 🌟 Acknowledgments

- **MindAR**: Image tracking library
- **Three.js**: 3D graphics engine
- **WebXR**: AR platform specification

---

**Built with ❤️ using modern web technologies**

*Last Updated: November 20, 2025*
