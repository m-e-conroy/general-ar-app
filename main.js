/**
 * AR Application - Main Script
 * Web-based Augmented Reality with Image Tracking
 * 
 * @description Complete AR application using MindAR and Three.js
 * @author Generated from Technical Specification
 * @date November 20, 2025
 */

// =============================================================================
// IMPORTS
// =============================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';
import { VideoManager } from './js/video-manager.js';
import { ARRecorder } from './js/ar-recorder.js';

// =============================================================================
// AR APPLICATION CLASS
// =============================================================================

/**
 * Main AR Application class
 * @class ARApplication
 * @description Manages AR initialization, scene setup, and user interactions
 */
class ARApplication {
    /**
     * Creates an ARApplication instance
     * @constructor
     * @postcondition Application is initialized with default values
     */
    constructor() {
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.anchor = null;
        this.anchors = [];
        this.models = [];
        this.videoManager = null;
        this.recorder = null;
        this.settings = {
            debugMode: false,
            autoRotate: true,
            maxTrack: 2
        };
        this.animationMixers = [];
        this.clock = new THREE.Clock();
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    
    /**
     * Initializes the AR application
     * @async
     * @returns {Promise<void>}
     * @precondition DOM is fully loaded, libraries are available
     * @postcondition AR system is initialized and ready for use
     */
    async init() {
        try {
            console.log('Initializing AR Application...');
            
            // Show loading indicator with progress
            this.showLoading(true);
            this.updateProgress(10);
            
            // Check for required APIs
            if (!this.checkBrowserSupport()) {
                throw new Error('Browser does not support required features');
            }
            
            this.updateProgress(20);
            
            // Initialize MindAR with Three.js integration
            this.mindarThree = new MindARThree({
                container: document.querySelector("#ar-container"),
                imageTargetSrc: './assets/targets/targets.mind',
                maxTrack: this.settings.maxTrack,
                uiLoading: "no",    // Use custom loading UI
                uiScanning: "no",   // Use custom scanning UI
                uiError: "no",      // Use custom error UI
                filterMinCF: 0.0001,
                filterBeta: 0.001,
                warmupTolerance: 5,
                missTolerance: 5
            });
            
            this.updateProgress(40);
            
            // Extract Three.js components from MindAR
            const { renderer, scene, camera } = this.mindarThree;
            this.renderer = renderer;
            this.scene = scene;
            this.camera = camera;
            
            // Fix deprecated outputEncoding (use outputColorSpace instead)
            if (this.renderer.outputColorSpace === undefined) {
                this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            }
            
            console.log('Three.js components extracted');
            this.updateProgress(50);
            
            // Setup scene lighting
            this.setupLighting();
            this.updateProgress(60);
            
            // Create anchor for first target (index 0)
            this.anchor1 = this.mindarThree.addAnchor(0);
            this.anchor2 = this.mindarThree.addAnchor(1);
            this.anchor = this.anchor1; // Set primary anchor
            this.anchors.push(this.anchor1);
            this.anchors.push(this.anchor2);
            
            console.log('Anchor created for targets');
            this.updateProgress(70);
            
            // Load 3D content (models, videos, etc.)
            await this.load3DContent();
            this.updateProgress(80);
            
            // Initialize video manager
            this.videoManager = new VideoManager(this.scene, this.anchor);
            console.log('VideoManager initialized');
            
            // Initialize recorder
            this.recorder = new ARRecorder(this.renderer, this.scene, this.camera);
            console.log('ARRecorder initialized');
            
            this.updateProgress(90);
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupUIControls();
            
            // Start AR system
            await this.mindarThree.start();
            console.log('MindAR started');
            
            this.updateProgress(100);
            
            // Hide loading indicator after short delay
            setTimeout(() => {
                this.showLoading(false);
                this.showSuccess('AR initialized successfully');
            }, 500);
            
            // Start render loop
            this.startRenderLoop();
            
            console.log('AR Application initialized successfully');
            
        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    }
    
    /**
     * Checks browser support for required features
     * @returns {boolean} True if all features are supported
     * @precondition Browser APIs are available
     */
    checkBrowserSupport() {
        const required = {
            'WebGL': () => {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            },
            'getUserMedia': () => {
                return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            },
            'VideoTexture': () => {
                return typeof THREE !== 'undefined' && THREE.VideoTexture;
            }
        };
        
        for (const [feature, check] of Object.entries(required)) {
            if (!check()) {
                console.error(`${feature} not supported`);
                return false;
            }
        }
        
        return true;
    }
    
    // =========================================================================
    // SCENE SETUP
    // =========================================================================
    
    /**
     * Sets up scene lighting for realistic rendering
     * @precondition Scene must be initialized
     * @postcondition Scene has ambient, directional, and hemisphere lights
     */
    setupLighting() {
        // Ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        ambientLight.name = 'ambientLight';
        this.scene.add(ambientLight);
        
        // Directional light for shadows and depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.name = 'directionalLight';
        this.scene.add(directionalLight);
        
        // Hemisphere light for natural outdoor lighting
        const hemisphereLight = new THREE.HemisphereLight(
            0xffffbb, // Sky color
            0x080820, // Ground color
            0.3       // Intensity
        );
        hemisphereLight.name = 'hemisphereLight';
        this.scene.add(hemisphereLight);
        
        console.log('Scene lighting configured');
    }
    
    // =========================================================================
    // 3D CONTENT LOADING
    // =========================================================================
    
    /**
     * Loads 3D content into the scene
     * @async
     * @returns {Promise<void>}
     * @precondition Anchor must be created
     * @postcondition 3D content is loaded and added to anchor
     */
    async load3DContent() {
        try {
            // Example: Load a GLTF model (uncomment when you have a model file)
            /*
            await this.loadGLTFModel('./assets/models/model1.glb', {
                scale: 0.5,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 }
            });
            */
            
            // Fallback: Create primitive geometry for demonstration
            this.createPrimitiveGeometry();
            
            console.log('3D content loaded');
            
        } catch (error) {
            console.error('Failed to load 3D content:', error);
            // Create fallback content
            this.createPrimitiveGeometry();
        }
    }
    
    /**
     * Loads a GLTF/GLB 3D model
     * @async
     * @param {string} path - Path to the model file
     * @param {Object} [options={}] - Model configuration
     * @param {number} [options.scale] - Uniform scale factor
     * @param {Object} [options.position] - Position {x, y, z}
     * @param {Object} [options.rotation] - Rotation {x, y, z}
     * @returns {Promise<THREE.Group>} The loaded model group
     * @precondition path must point to valid GLTF/GLB file
     * @postcondition Model is loaded and added to anchor
     */
    loadGLTFModel(path, options = {}) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            
            loader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    
                    // Apply scale transformation
                    if (options.scale) {
                        const scale = options.scale;
                        model.scale.set(scale, scale, scale);
                    }
                    
                    // Apply position transformation
                    if (options.position) {
                        model.position.set(
                            options.position.x || 0,
                            options.position.y || 0,
                            options.position.z || 0
                        );
                    }
                    
                    // Apply rotation transformation
                    if (options.rotation) {
                        model.rotation.set(
                            options.rotation.x || 0,
                            options.rotation.y || 0,
                            options.rotation.z || 0
                        );
                    }
                    
                    // Initially hidden until target is found
                    model.visible = false;
                    model.userData.isModel = true;
                    
                    // Add to anchor group
                    this.anchor.group.add(model);
                    this.models.push(model);
                    
                    // Handle animations if present
                    if (gltf.animations && gltf.animations.length > 0) {
                        const mixer = new THREE.AnimationMixer(model);
                        gltf.animations.forEach((clip) => {
                            const action = mixer.clipAction(clip);
                            action.play();
                        });
                        this.animationMixers.push(mixer);
                        console.log(`Model has ${gltf.animations.length} animations`);
                    }
                    
                    console.log('Model loaded:', path);
                    resolve(model);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(2);
                    console.log(`Loading model: ${percent}%`);
                },
                (error) => {
                    console.error('Model loading failed:', error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Creates primitive geometry as fallback or demo content
     * @precondition Anchor must exist
     * @postcondition Primitive 3D objects are added to scene
     */
    createPrimitiveGeometry() {
        // Create a colorful cube
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4f46e5,
            metalness: 0.5,
            roughness: 0.5,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.2
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.25, 0);
        cube.visible = false;
        cube.userData.isModel = true;
        cube.userData.isPrimitive = true;
        this.anchor.group.add(cube);
        this.models.push(cube);
        
        // Add a torus knot for visual interest
        const torusGeometry = new THREE.TorusKnotGeometry(0.2, 0.08, 100, 16);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x06b6d4,
            emissiveIntensity: 0.2
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.position.set(0, 0.6, 0);
        torus.visible = false;
        torus.userData.isModel = true;
        torus.userData.isPrimitive = true;
        this.anchor.group.add(torus);
        this.models.push(torus);
        
        console.log('Primitive geometry created');
    }
    
    // =========================================================================
    // EVENT HANDLING
    // =========================================================================
    
    /**
     * Sets up event listeners for AR tracking
     * @precondition Anchor must be created
     * @postcondition Event handlers are attached to anchor
     */
    setupEventListeners() {
        // Target found event
        this.anchor.onTargetFound = () => {
            console.log('Target found');
            this.onTargetFound();
        };
        
        // Target lost event
        this.anchor.onTargetLost = () => {
            console.log('Target lost');
            this.onTargetLost();
        };
        
        // Handle page visibility changes (pause when hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
        
        console.log('Event listeners configured');
    }
    
    /**
     * Handles target found event
     * @postcondition 3D content is visible, UI is updated
     */
    onTargetFound() {
        // Show all 3D content
        this.models.forEach(model => {
            if (model.visible !== undefined) {
                model.visible = true;
            }
        });
        
        // Update instruction UI
        const instructions = document.querySelector('#instructions');
        const instructionText = document.querySelector('#instruction-text');
        instructionText.textContent = 'Target detected! Keep camera steady.';
        instructions.classList.add('target-found');
        
        // Start video playback if configured
        if (this.videoManager && this.videoManager.videos.size > 0) {
            const firstVideo = Array.from(this.videoManager.videos.keys())[0];
            this.videoManager.play(firstVideo);
        }
    }
    
    /**
     * Handles target lost event
     * @postcondition 3D content is hidden, UI is updated
     */
    onTargetLost() {
        // Hide all 3D content
        this.models.forEach(model => {
            if (model.visible !== undefined) {
                model.visible = false;
            }
        });
        
        // Update instruction UI
        const instructions = document.querySelector('#instructions');
        const instructionText = document.querySelector('#instruction-text');
        instructionText.textContent = 'Point your camera at the target image';
        instructions.classList.remove('target-found');
        
        // Pause videos
        if (this.videoManager) {
            this.videoManager.pauseAll();
        }
    }
    
    /**
     * Handles window resize
     * @postcondition Renderer and camera are updated for new size
     */
    onWindowResize() {
        if (this.renderer && this.camera) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.renderer.setSize(width, height);
            
            if (this.camera.aspect !== undefined) {
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
            }
        }
    }
    
    // =========================================================================
    // UI CONTROLS
    // =========================================================================
    
    /**
     * Sets up UI control event listeners
     * @postcondition All UI controls are functional
     */
    setupUIControls() {
        // Settings button
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showModal('settings-modal');
        });
        
        // Info button
        document.getElementById('info-btn')?.addEventListener('click', () => {
            this.showModal('info-modal');
        });
        
        // Close modal buttons
        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.hideModal('settings-modal');
        });
        
        document.getElementById('close-info')?.addEventListener('click', () => {
            this.hideModal('info-modal');
        });
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Debug mode toggle
        document.getElementById('debug-mode')?.addEventListener('change', (e) => {
            this.settings.debugMode = e.target.checked;
            this.toggleDebugMode(e.target.checked);
        });
        
        // Auto-rotate toggle
        document.getElementById('auto-rotate')?.addEventListener('change', (e) => {
            this.settings.autoRotate = e.target.checked;
        });
        
        // Max track slider
        const maxTrackSlider = document.getElementById('max-track');
        const maxTrackValue = document.getElementById('max-track-value');
        maxTrackSlider?.addEventListener('input', (e) => {
            this.settings.maxTrack = parseInt(e.target.value);
            if (maxTrackValue) {
                maxTrackValue.textContent = e.target.value;
            }
        });
        
        // Recording controls
        document.getElementById('toggle-record-btn')?.addEventListener('click', () => {
            const recordingControls = document.getElementById('recording-controls');
            if (recordingControls) {
                const isHidden = recordingControls.style.display === 'none';
                recordingControls.style.display = isHidden ? 'flex' : 'none';
            }
        });
        
        document.getElementById('record-btn')?.addEventListener('click', () => {
            this.toggleRecording();
        });
        
        // Error close button
        document.getElementById('close-error')?.addEventListener('click', () => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
        
        console.log('UI controls configured');
    }
    
    /**
     * Shows a modal dialog
     * @param {string} modalId - ID of the modal element
     * @postcondition Modal is visible
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    /**
     * Hides a modal dialog
     * @param {string} modalId - ID of the modal element
     * @postcondition Modal is hidden
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Toggles debug mode visualization
     * @param {boolean} enabled - Whether debug mode is enabled
     * @postcondition Debug helpers are shown/hidden
     */
    toggleDebugMode(enabled) {
        if (enabled) {
            // Add axis helper
            const axesHelper = new THREE.AxesHelper(1);
            axesHelper.name = 'axesHelper';
            this.anchor.group.add(axesHelper);
            
            // Add grid helper
            const gridHelper = new THREE.GridHelper(2, 10);
            gridHelper.name = 'gridHelper';
            this.scene.add(gridHelper);
            
            console.log('Debug mode enabled');
        } else {
            // Remove helpers
            const axesHelper = this.anchor.group.getObjectByName('axesHelper');
            if (axesHelper) {
                this.anchor.group.remove(axesHelper);
            }
            
            const gridHelper = this.scene.getObjectByName('gridHelper');
            if (gridHelper) {
                this.scene.remove(gridHelper);
            }
            
            console.log('Debug mode disabled');
        }
    }
    
    /**
     * Toggles recording on/off
     * @postcondition Recording state is toggled
     */
    toggleRecording() {
        const recordBtn = document.getElementById('record-btn');
        const recordText = recordBtn?.querySelector('.record-text');
        
        if (this.recorder.isRecording()) {
            this.recorder.stopRecording();
            recordBtn?.classList.remove('recording');
            if (recordText) recordText.textContent = 'Record';
            this.showSuccess('Recording saved');
        } else {
            if (this.recorder.startRecording()) {
                recordBtn?.classList.add('recording');
                if (recordText) recordText.textContent = 'Stop';
            } else {
                this.showError('Recording failed', 'Could not start recording');
            }
        }
    }
    
    // =========================================================================
    // RENDER LOOP
    // =========================================================================
    
    /**
     * Starts the main render loop
     * @postcondition Animation loop is running at ~60fps
     */
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            const delta = this.clock.getDelta();
            
            // Update animation mixers for GLTF animations
            this.animationMixers.forEach(mixer => {
                mixer.update(delta);
            });
            
            // Update custom animations
            if (this.settings.autoRotate) {
                this.updateCustomAnimations(delta);
            }
            
            // Render the scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        console.log('Render loop started');
    }
    
    /**
     * Updates custom animations (rotation, etc.)
     * @param {number} delta - Time since last frame in seconds
     * @precondition Models must be loaded
     * @postcondition Models are animated
     */
    updateCustomAnimations(delta) {
        // Rotate visible models
        this.models.forEach((model, index) => {
            if (model.rotation && model.visible && model.userData.isPrimitive) {
                // Different rotation speeds for variety
                const speed = 0.5 + (index * 0.2);
                model.rotation.y += delta * speed;
                model.rotation.x += delta * speed * 0.5;
            }
        });
    }
    
    // =========================================================================
    // LIFECYCLE MANAGEMENT
    // =========================================================================
    
    /**
     * Pauses the AR system
     * @postcondition AR tracking is paused
     */
    pause() {
        if (this.mindarThree) {
            this.mindarThree.stop();
            console.log('AR paused');
        }
        
        if (this.videoManager) {
            this.videoManager.pauseAll();
        }
    }
    
    /**
     * Resumes the AR system
     * @postcondition AR tracking is active
     */
    resume() {
        if (this.mindarThree) {
            this.mindarThree.start();
            console.log('AR resumed');
        }
    }
    
    /**
     * Stops and cleans up the AR system
     * @postcondition All resources are released
     */
    stop() {
        if (this.mindarThree) {
            this.mindarThree.stop();
            this.mindarThree = null;
        }
        
        if (this.videoManager) {
            this.videoManager.disposeAll();
        }
        
        if (this.recorder && this.recorder.isRecording()) {
            this.recorder.stopRecording();
        }
        
        console.log('AR stopped');
    }
    
    // =========================================================================
    // UI HELPERS
    // =========================================================================
    
    /**
     * Shows or hides loading overlay
     * @param {boolean} show - Whether to show loading overlay
     * @postcondition Loading overlay visibility is updated
     */
    showLoading(show) {
        const overlay = document.querySelector('#loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden');
                overlay.style.display = 'flex';
            } else {
                overlay.classList.add('hidden');
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500);
            }
        }
    }
    
    /**
     * Updates loading progress bar
     * @param {number} percent - Progress percentage (0-100)
     * @postcondition Progress bar is updated
     */
    updateProgress(percent) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }
    
    /**
     * Displays an error message
     * @param {string} title - Error title
     * @param {Error|string} error - Error object or message
     * @postcondition Error toast is displayed
     */
    handleError(title, error) {
        console.error(title, error);
        
        const errorDiv = document.getElementById('error-message');
        const errorTitle = document.getElementById('error-title');
        const errorText = document.getElementById('error-text');
        
        if (errorDiv && errorTitle && errorText) {
            errorTitle.textContent = title;
            errorText.textContent = error.message || error.toString();
            errorDiv.style.display = 'flex';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 10000);
        }
        
        this.showLoading(false);
    }
    
    /**
     * Displays an error toast
     * @param {string} title - Error title
     * @param {string} message - Error message
     */
    showError(title, message) {
        this.handleError(title, new Error(message));
    }
    
    /**
     * Displays a success message
     * @param {string} message - Success message
     * @postcondition Success toast is displayed briefly
     */
    showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        const successText = document.getElementById('success-text');
        
        if (successDiv && successText) {
            successText.textContent = message;
            successDiv.style.display = 'flex';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                successDiv.classList.add('fade-out');
                setTimeout(() => {
                    successDiv.style.display = 'none';
                    successDiv.classList.remove('fade-out');
                }, 300);
            }, 3000);
        }
    }
}

// =============================================================================
// APPLICATION ENTRY POINT
// =============================================================================

/**
 * Initialize application when DOM is ready
 * @precondition DOM is fully loaded
 * @postcondition AR application is initialized
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AR application...');
    
    // Create and initialize application
    const app = new ARApplication();
    window.arApp = app; // Expose for debugging
    
    app.init().catch(error => {
        console.error('Failed to initialize AR application:', error);
    });
});

// =============================================================================
// TOUCH EVENT HANDLING
// =============================================================================

/**
 * Prevent default touch behaviors that interfere with AR
 * Allows canvas to handle touch events directly
 */
document.addEventListener('touchmove', (e) => {
    // Only prevent default on canvas to allow UI scrolling
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });

/**
 * Handle touch start for canvas interactions
 */
document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'CANVAS') {
        // Canvas touch handling can be extended here
        // e.g., for raycasting interactions with 3D objects
    }
}, { passive: true });
