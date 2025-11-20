# Target Images Instructions

This folder should contain your target images that will be detected by the AR application.

## What You Need to Do

### Step 1: Add Target Images

Place your target images in this folder. Good target images have:
- High contrast and distinctive features
- Clear edges and patterns
- Size: 512x512px to 2048x2048px (optimal: 1024x1024px)
- Format: PNG or JPG
- File size: < 2MB

### Step 2: Compile Target Images

You **must** compile your images into a `targets.mind` file before the AR app will work.

#### Option A: Online Compiler (Recommended)

1. Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Click "Choose Files" and select your target image(s)
3. Configure settings:
   - **Max tracks**: 2 (how many targets can be tracked simultaneously)
   - **Filter size**: auto (recommended)
4. Click "Compile"
5. Download the generated `targets.mind` file
6. Place it in this folder: `assets/targets/targets.mind`

#### Option B: Command Line

```bash
# Install the compiler (once)
npm install -g mind-ar

# Compile your images
mind-ar-compiler compile \
  --input ./target1.png \
  --input ./target2.png \
  --output ./targets.mind \
  --max-track 2
```

## Example Target Images

Good examples of target images:
- Company logos with distinct shapes
- Book or magazine covers
- Product packaging
- Posters with clear graphics
- Business cards with designs

Bad examples:
- Plain white paper
- Text-only documents
- Photos with low contrast
- Reflective or transparent materials
- Repetitive patterns (e.g., brick walls)

## Testing Your Targets

The compiler will report the number of feature points detected in your image:
- **< 50 points**: Poor tracking (won't work well)
- **50-100 points**: Acceptable tracking
- **100+ points**: Good tracking (recommended)
- **200+ points**: Excellent tracking

If your image has too few feature points:
- Try a different image with more detail
- Increase contrast
- Add graphic elements
- Avoid plain backgrounds

## File Structure

After compilation, this folder should contain:

```
assets/targets/
├── target1.png          # Your original target image
├── target2.png          # Another target (optional)
└── targets.mind         # Compiled file (REQUIRED for app to work)
```

## Multiple Targets

You can track multiple different images:
1. Include all images when compiling
2. They will be indexed in order (0, 1, 2, etc.)
3. Update `main.js` to create anchors for each target:

```javascript
this.anchor1 = this.mindarThree.addAnchor(0); // First image
this.anchor2 = this.mindarThree.addAnchor(1); // Second image
```

## Important Notes

⚠️ **The `targets.mind` file is REQUIRED** - the app will not work without it!

⚠️ **Recompile after changes** - if you change target images, you must recompile

⚠️ **Print quality matters** - if printing targets, use high quality to preserve features

✅ **Test in good lighting** - AR tracking requires adequate light

✅ **Keep targets flat** - wrinkled or bent targets track poorly

## Downloading Sample Targets

If you need sample images to test with:
1. Search for "high contrast logos" or "graphic posters"
2. Use free image sites like Unsplash or Pexels
3. Create your own using design tools (Figma, Canva, etc.)

## Need Help?

- Check the main README.md for troubleshooting
- Review the technical documentation in docs/
- Visit MindAR documentation: https://hiukim.github.io/mind-ar-js-doc/
