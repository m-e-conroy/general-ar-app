# Quick Start Guide

Get your AR application running in 5 minutes!

## Prerequisites
- A mobile device with a camera (iOS 13+ or Android 8+)
- A target image to track

## Step-by-Step Setup

### 1️⃣ Prepare Your Target Image (2 minutes)

**Option A: Use a Sample**
- Find any high-contrast logo or poster online
- Download it as PNG or JPG
- Make sure it's at least 512x512 pixels

**Option B: Create Your Own**
- Use Canva, Figma, or any design tool
- Create a 1024x1024px image with distinct graphics
- Export as PNG

### 2️⃣ Compile Your Target (2 minutes)

1. Go to: **https://hiukim.github.io/mind-ar-js-doc/tools/compile**
2. Click "Choose Files" and select your image
3. Leave settings as default (Max tracks: 1)
4. Click "Compile"
5. Download the `targets.mind` file
6. Place it in: `assets/targets/targets.mind`

**✅ You should now have:**
```
assets/targets/
└── targets.mind  ← This file is required!
```

### 3️⃣ Deploy Your App (1 minute)

**Option A: GitHub Pages (Recommended)**
1. Create a new GitHub repository
2. Upload all your project files
3. Go to Settings → Pages
4. Select "main branch" as source
5. Wait 1-2 minutes for deployment
6. Visit your URL: `https://username.github.io/repo-name/`

**Option B: Local Testing**
```bash
# Install http-server (one time)
npm install -g http-server

# Run from project folder
http-server -p 8080 --ssl

# Open https://localhost:8080 on your phone
# (You'll need to accept the self-signed certificate)
```

### 4️⃣ Test Your AR App

1. **Open the URL** on your mobile device
2. **Allow camera access** when prompted
3. **Point camera** at your target image
4. **See the magic** ✨ - 3D content appears!

## Troubleshooting

### "targets.mind not found"
→ Make sure you placed the compiled file in `assets/targets/targets.mind`

### "Camera access denied"
→ Go to browser settings and allow camera for this site

### "Target not detected"
→ Try these:
- Ensure good lighting
- Print the target image at least 10cm wide
- Keep camera steady
- Move closer/further to find sweet spot

### "Nothing happens"
→ Check browser console (F12) for errors

## Next Steps

### Add Your Own 3D Model
1. Download a free model from [Sketchfab](https://sketchfab.com)
2. Place in `assets/models/`
3. Edit `main.js` line ~260:
   ```javascript
   await this.loadGLTFModel('./assets/models/your-model.glb', {
       scale: 0.5
   });
   ```

### Add a Video
1. Place video in `assets/videos/`
2. Edit `main.js` line ~270:
   ```javascript
   this.videoManager.loadVideo('demo', {
       src: './assets/videos/your-video.mp4',
       width: 1.6,
       height: 0.9
   });
   ```

### Customize Appearance
Edit `styles.css` variables:
```css
:root {
    --color-primary: #4f46e5;  /* Change to your color */
}
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blurry tracking | Use higher resolution target image |
| Slow performance | Reduce 3D model complexity |
| Video won't play | Make sure it's H.264 MP4 format |
| Model too big/small | Adjust `scale` parameter |

## Resources

- 📖 [Full Documentation](README.md)
- 🎯 [Target Compilation Tool](https://hiukim.github.io/mind-ar-js-doc/tools/compile)
- 🔧 [MindAR Docs](https://hiukim.github.io/mind-ar-js-doc/)
- 🎨 [Free 3D Models](https://sketchfab.com/feed)

## Need Help?

1. Check console for errors (F12)
2. Review the [troubleshooting section](README.md#-troubleshooting)
3. Read the [technical docs](docs/design-and-technical.txt)

---

**🎉 Congratulations!** You now have a working AR application!

*Estimated time: 5 minutes* ⏱️
