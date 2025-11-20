/**
 * VideoManager Class
 * Manages video textures, playback, and controls for AR scenes
 * 
 * @class VideoManager
 * @description Handles loading, playing, and controlling video content in 3D space
 * @author Generated from Technical Specification
 * @date November 20, 2025
 */

class VideoManager {
    /**
     * Creates a VideoManager instance
     * @constructor
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} anchor - The MindAR anchor object
     * @precondition scene and anchor must be valid Three.js objects
     * @postcondition VideoManager is initialized and ready to load videos
     */
    constructor(scene, anchor) {
        this.scene = scene;
        this.anchor = anchor;
        this.videos = new Map();
        this.activeVideo = null;
    }
    
    // =========================================================================
    // VIDEO LOADING & SETUP
    // =========================================================================
    
    /**
     * Loads and configures a video for AR display
     * @param {string} id - Unique identifier for the video
     * @param {Object} config - Video configuration object
     * @param {string} config.src - Video source URL
     * @param {boolean} [config.loop=false] - Whether to loop the video
     * @param {boolean} [config.muted=false] - Whether to mute the video
     * @param {number} [config.volume=1.0] - Initial volume (0.0-1.0)
     * @param {string} [config.shape='plane'] - Geometry shape: 'plane', 'sphere', 'curved'
     * @param {Object} [config.position] - Position {x, y, z}
     * @param {Object} [config.rotation] - Rotation {x, y, z}
     * @param {number} [config.scale] - Uniform scale factor
     * @param {Function} [config.onEnded] - Callback when video ends
     * @param {Function} [config.onTimeUpdate] - Callback on time update
     * @returns {HTMLVideoElement} The video element
     * @precondition id must be unique, config.src must be valid URL
     * @postcondition Video is loaded and added to scene, hidden initially
     */
    loadVideo(id, config) {
        // Create video element with HTML5 Video API
        const video = document.createElement('video');
        video.src = config.src;
        video.loop = config.loop || false;
        video.muted = config.muted || false;
        video.volume = config.volume || 1.0;
        video.playsInline = true; // Essential for iOS Safari
        video.crossOrigin = 'anonymous'; // For external sources
        video.preload = 'auto';
        
        // Create Three.js VideoTexture for mapping to 3D geometry
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter; // Disable mipmaps for performance
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        
        // Create material with video texture
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
            transparent: config.transparent || false,
            opacity: config.opacity || 1.0
        });
        
        // Create geometry based on shape configuration
        let geometry;
        if (config.shape === 'sphere') {
            // Sphere for 360° videos
            geometry = new THREE.SphereGeometry(
                config.radius || 0.5,
                config.segments || 32,
                config.segments || 32
            );
        } else if (config.shape === 'curved') {
            // Curved cylinder for theater-like experience
            geometry = new THREE.CylinderGeometry(
                config.radius || 1,
                config.radius || 1,
                config.height || 0.5,
                config.segments || 32,
                1,
                true // Open-ended
            );
        } else {
            // Default: flat plane screen
            geometry = new THREE.PlaneGeometry(
                config.width || 1,
                config.height || 0.5625 // 16:9 aspect ratio
            );
        }
        
        // Create mesh combining geometry and material
        const mesh = new THREE.Mesh(geometry, material);
        
        // Apply transformations
        if (config.position) {
            mesh.position.set(
                config.position.x || 0,
                config.position.y || 0,
                config.position.z || 0
            );
        }
        
        if (config.rotation) {
            mesh.rotation.set(
                config.rotation.x || 0,
                config.rotation.y || 0,
                config.rotation.z || 0
            );
        }
        
        if (config.scale) {
            mesh.scale.set(config.scale, config.scale, config.scale);
        }
        
        // Initially hidden until target is found
        mesh.visible = false;
        this.anchor.group.add(mesh);
        
        // Store video data for management
        this.videos.set(id, {
            element: video,
            texture: texture,
            material: material,
            mesh: mesh,
            geometry: geometry,
            config: config
        });
        
        // Setup event listeners for video lifecycle
        this.setupVideoEvents(id, video);
        
        return video;
    }
    
    /**
     * Sets up event listeners for video element
     * @param {string} id - Video identifier
     * @param {HTMLVideoElement} video - Video element
     * @private
     * @precondition Video element must be valid
     * @postcondition Event listeners are attached for lifecycle events
     */
    setupVideoEvents(id, video) {
        video.addEventListener('loadedmetadata', () => {
            console.log(`Video ${id} loaded:`, {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight
            });
        });
        
        video.addEventListener('error', (e) => {
            console.error(`Video ${id} error:`, e);
        });
        
        video.addEventListener('ended', () => {
            const videoData = this.videos.get(id);
            if (videoData && videoData.config.onEnded) {
                videoData.config.onEnded();
            }
        });
        
        video.addEventListener('timeupdate', () => {
            const videoData = this.videos.get(id);
            if (videoData && videoData.config.onTimeUpdate) {
                videoData.config.onTimeUpdate(video.currentTime);
            }
        });
    }
    
    // =========================================================================
    // VIDEO PLAYBACK CONTROL
    // =========================================================================
    
    /**
     * Plays a video by ID
     * @param {string} id - Video identifier
     * @returns {Promise<void>}
     * @precondition Video with given id must exist
     * @postcondition Video is playing and visible, or error is logged
     */
    play(id) {
        const videoData = this.videos.get(id);
        if (!videoData) {
            console.warn(`Video ${id} not found`);
            return;
        }
        
        // Handle autoplay restrictions (browsers require user interaction)
        const playPromise = videoData.element.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    videoData.mesh.visible = true;
                    this.activeVideo = id;
                    console.log(`Video ${id} playing`);
                })
                .catch(error => {
                    console.warn(`Autoplay prevented for ${id}:`, error);
                    // Fallback: mute and retry
                    videoData.element.muted = true;
                    videoData.element.play().catch(e => {
                        console.error(`Failed to play ${id}:`, e);
                    });
                });
        }
    }
    
    /**
     * Pauses a video by ID
     * @param {string} id - Video identifier
     * @precondition Video with given id must exist
     * @postcondition Video playback is paused
     */
    pause(id) {
        const videoData = this.videos.get(id);
        if (!videoData) return;
        
        videoData.element.pause();
    }
    
    /**
     * Stops a video and resets to beginning
     * @param {string} id - Video identifier
     * @precondition Video with given id must exist
     * @postcondition Video is paused, reset to 0, and hidden
     */
    stop(id) {
        const videoData = this.videos.get(id);
        if (!videoData) return;
        
        videoData.element.pause();
        videoData.element.currentTime = 0;
        videoData.mesh.visible = false;
    }
    
    /**
     * Pauses all loaded videos
     * @postcondition All videos are paused
     */
    pauseAll() {
        this.videos.forEach((videoData, id) => {
            this.pause(id);
        });
    }
    
    /**
     * Stops all loaded videos
     * @postcondition All videos are stopped and hidden
     */
    stopAll() {
        this.videos.forEach((videoData, id) => {
            this.stop(id);
        });
    }
    
    // =========================================================================
    // VIDEO CONTROLS
    // =========================================================================
    
    /**
     * Sets volume for a video
     * @param {string} id - Video identifier
     * @param {number} volume - Volume level (0.0 - 1.0)
     * @precondition Video exists, volume is between 0 and 1
     * @postcondition Video volume is updated
     */
    setVolume(id, volume) {
        const videoData = this.videos.get(id);
        if (!videoData) return;
        
        videoData.element.volume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Mutes or unmutes a video
     * @param {string} id - Video identifier
     * @param {boolean} [muted=true] - Mute state
     * @precondition Video with given id must exist
     * @postcondition Video mute state is updated
     */
    mute(id, muted = true) {
        const videoData = this.videos.get(id);
        if (!videoData) return;
        
        videoData.element.muted = muted;
    }
    
    /**
     * Seeks to specific time in video
     * @param {string} id - Video identifier
     * @param {number} time - Time in seconds
     * @precondition Video exists, time is valid
     * @postcondition Video playhead is at specified time
     */
    seek(id, time) {
        const videoData = this.videos.get(id);
        if (!videoData) return;
        
        videoData.element.currentTime = time;
    }
    
    /**
     * Sets playback rate
     * @param {string} id - Video identifier
     * @param {number} rate - Playback rate (0.5 = half speed, 2.0 = double speed)
     * @precondition Video exists, rate is positive
     * @postcondition Video playback rate is updated
     */
    setPlaybackRate(id, rate) {
        const videoData = this.videos.get(id);
        if (!videoData) return;
        
        videoData.element.playbackRate = rate;
    }
    
    // =========================================================================
    // VIDEO STATE QUERIES
    // =========================================================================
    
    /**
     * Checks if video is currently playing
     * @param {string} id - Video identifier
     * @returns {boolean} True if video is playing
     * @precondition Video with given id must exist
     */
    isPlaying(id) {
        const videoData = this.videos.get(id);
        if (!videoData) return false;
        
        return !videoData.element.paused && 
               !videoData.element.ended &&
               videoData.element.currentTime > 0;
    }
    
    /**
     * Gets video duration
     * @param {string} id - Video identifier
     * @returns {number} Duration in seconds
     */
    getDuration(id) {
        const videoData = this.videos.get(id);
        return videoData ? videoData.element.duration : 0;
    }
    
    /**
     * Gets current playback time
     * @param {string} id - Video identifier
     * @returns {number} Current time in seconds
     */
    getCurrentTime(id) {
        const videoData = this.videos.get(id);
        return videoData ? videoData.element.currentTime : 0;
    }
    
    // =========================================================================
    // CLEANUP
    // =========================================================================
    
    /**
     * Disposes a video and frees resources
     * @param {string} id - Video identifier
     * @precondition Video with given id must exist
     * @postcondition Video is removed from scene and memory is freed
     */
    dispose(id) {
        const videoData = this.videos.get(id);
        if (!videoData) return;
        
        this.stop(id);
        
        // Remove from scene
        this.anchor.group.remove(videoData.mesh);
        
        // Dispose Three.js resources to free memory
        videoData.geometry.dispose();
        videoData.material.dispose();
        videoData.texture.dispose();
        
        // Clean up video element
        videoData.element.src = '';
        videoData.element.load();
        
        this.videos.delete(id);
    }
    
    /**
     * Disposes all videos
     * @postcondition All videos are removed and memory is freed
     */
    disposeAll() {
        const ids = Array.from(this.videos.keys());
        ids.forEach(id => this.dispose(id));
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoManager;
}
