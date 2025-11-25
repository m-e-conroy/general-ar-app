# Videos

Place your video files in this folder for use in AR scenes.

## Supported Formats

- **MP4** (H.264 codec) - Best compatibility
- **WebM** (VP8/VP9 codec) - Good compression
- Recommended: MP4 with H.264 for mobile devices

## Recommendations

### Video Settings
- **Resolution**: Max 1920x1080 (1080p)
- **Bitrate**: 2-5 Mbps for mobile
- **Frame rate**: 30fps
- **Duration**: Keep under 2 minutes for better performance

### Optimization

Use FFmpeg to optimize videos for web:

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -vf "scale=1920:-2" \
  output_optimized.mp4
```

This creates a web-optimized video with:
- H.264 video codec
- AAC audio codec
- Fast start (streaming ready)
- Good quality at reasonable file size

## Using Videos in Your App

Edit `main.js` in the `load3DContent()` method:

### Flat Screen Video

```javascript
this.videoManager.loadVideo('demo', {
    src: './assets/videos/demo.mp4',
    width: 1.6,           // 16:9 aspect ratio
    height: 0.9,
    position: { x: 0, y: 0.5, z: 0 },
    loop: true,
    muted: false,
    volume: 0.8
});
```

### Curved Screen (Theater Style)

```javascript
this.videoManager.loadVideo('curved', {
    src: './assets/videos/demo.mp4',
    shape: 'curved',
    radius: 0.8,
    height: 0.45,
    segments: 64,
    position: { x: 0, y: 1, z: 0 },
    rotation: { y: Math.PI },
    loop: true
});
```

### 360° Video (Sphere)

```javascript
this.videoManager.loadVideo('360', {
    src: './assets/videos/360video.mp4',
    shape: 'sphere',
    radius: 2,
    segments: 64,
    doubleSided: true,
    loop: true,
    muted: true
});
```

## Mobile Considerations

### Autoplay Restrictions
- **iOS/Safari**: Requires muted videos or user interaction
- **Android/Chrome**: More permissive but still restricted
- The app handles this automatically by:
  1. Trying to play with sound
  2. Falling back to muted if blocked
  3. Waiting for user interaction

### Best Practices
- Set `playsInline: true` (handled automatically)
- Keep files small (< 50MB)
- Use poster images for quick loading
- Test on actual devices

## Video Callbacks

Add callbacks for video events:

```javascript
this.videoManager.loadVideo('intro', {
    src: './assets/videos/intro.mp4',
    loop: false,
    onEnded: () => {
        console.log('Intro finished');
        this.videoManager.play('main'); // Play next video
    },
    onTimeUpdate: (currentTime) => {
        console.log('Current time:', currentTime);
    }
});
```

## Free Video Resources

- **Pexels Videos**: https://www.pexels.com/videos/
- **Pixabay Videos**: https://pixabay.com/videos/
- **Coverr**: https://coverr.co/
- **Videvo**: https://www.videvo.net/

## Performance Tips

1. **Preload strategically**:
   - `video.preload = 'auto'` for critical videos
   - `video.preload = 'none'` for optional content

2. **Limit concurrent videos**:
   - Max 2-3 videos playing simultaneously
   - Dispose unused videos

3. **Use appropriate quality**:
   - Mobile: 720p is usually sufficient
   - Desktop: 1080p for better quality

4. **Test data usage**:
   - Large videos consume mobile data
   - Consider compression vs quality tradeoffs
