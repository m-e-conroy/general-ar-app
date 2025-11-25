# 3D Models

Place your 3D model files in this folder.

## Supported Formats

- **GLTF** (.gltf) - Text-based format
- **GLB** (.glb) - Binary format (recommended, smaller file size)

## Recommendations

### File Size
- Keep models under 10MB for mobile devices
- Use Draco compression for smaller files
- Optimize polygon count (< 50,000 triangles)

### Textures
- Maximum resolution: 2048x2048px
- Use compressed formats (JPEG for photos, PNG for graphics)
- Consider texture atlases for multiple materials

### Optimization
Use gltf-pipeline to optimize models:
```bash
npm install -g gltf-pipeline
gltf-pipeline -i model.glb -o model-optimized.glb -d
```

## Free 3D Model Resources

- **Sketchfab**: https://sketchfab.com (filter by "Downloadable")
- **Poly Haven**: https://polyhaven.com/models
- **TurboSquid**: https://www.turbosquid.com (some free models)
- **CGTrader**: https://www.cgtrader.com (filter by free)

## Using Models in Your App

Edit `main.js` in the `load3DContent()` method:

```javascript
await this.loadGLTFModel('./assets/models/your-model.glb', {
    scale: 0.5,              // Adjust size
    position: { x: 0, y: 0, z: 0 },  // Position relative to target
    rotation: { x: 0, y: 0, z: 0 }   // Rotation in radians
});
```

## Model Scale Reference

Since AR target images are typically small (10-20cm), adjust scale accordingly:
- `scale: 0.1` - Very small (1/10 size)
- `scale: 0.5` - Half size (good for most models)
- `scale: 1.0` - Full size
- `scale: 2.0` - Double size

Test and adjust based on your needs!
