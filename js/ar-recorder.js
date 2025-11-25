/**
 * ARRecorder Class
 * Records AR sessions with 3D overlays to video
 * 
 * @class ARRecorder
 * @description Captures canvas stream and exports as WebM video
 * @author Generated from Technical Specification
 * @date November 20, 2025
 */

export class ARRecorder {
    /**
     * Creates an ARRecorder instance
     * @constructor
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.Camera} camera - Three.js camera
     * @precondition renderer, scene, and camera must be valid Three.js objects
     * @postcondition ARRecorder is initialized and ready to record
     */
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.startTime = null;
        this.timerInterval = null;
    }
    
    // =========================================================================
    // RECORDING CONTROL
    // =========================================================================
    
    /**
     * Starts recording the AR session
     * @param {Object} [options] - Recording options
     * @param {number} [options.fps=30] - Frames per second
     * @param {number} [options.videoBitsPerSecond=5000000] - Video bitrate (5 Mbps default)
     * @returns {boolean} True if recording started successfully
     * @precondition Canvas must be available and browser must support MediaRecorder
     * @postcondition Recording is active, timer is running
     */
    startRecording(options = {}) {
        try {
            const canvas = this.renderer.domElement;
            const fps = options.fps || 30;
            const videoBitsPerSecond = options.videoBitsPerSecond || 5000000;
            
            // Capture canvas stream at specified frame rate
            const stream = canvas.captureStream(fps);
            
            // Determine best codec (VP9 preferred, fallback to VP8)
            let mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm';
                }
            }
            
            // Create MediaRecorder with optimal settings
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: videoBitsPerSecond
            });
            
            // Handle data availability (chunks of recorded video)
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            // Handle recording stop
            this.mediaRecorder.onstop = () => {
                this.onRecordingStop();
            };
            
            // Handle errors
            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                this.stopRecording();
            };
            
            // Clear previous recording
            this.recordedChunks = [];
            this.startTime = Date.now();
            
            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            
            // Start timer display
            this.startTimer();
            
            console.log('Recording started');
            return true;
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            return false;
        }
    }
    
    /**
     * Stops the recording
     * @precondition Recording must be active
     * @postcondition Recording is stopped, video is ready for download
     */
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.stopTimer();
            console.log('Recording stopped');
        }
    }
    
    /**
     * Handles recording stop event
     * @private
     * @postcondition Video blob is created and download is initiated
     */
    onRecordingStop() {
        // Create blob from recorded chunks
        const blob = new Blob(this.recordedChunks, {
            type: 'video/webm'
        });
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        
        // Automatically download the video
        this.downloadVideo(url, blob.size);
        
        // Clear recorded chunks
        this.recordedChunks = [];
    }
    
    // =========================================================================
    // DOWNLOAD & EXPORT
    // =========================================================================
    
    /**
     * Downloads the recorded video
     * @param {string} url - Blob URL of the video
     * @param {number} size - File size in bytes
     * @private
     * @postcondition Video file is downloaded to user's device
     */
    downloadVideo(url, size) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ar-recording-${timestamp}.webm`;
        
        // Create temporary download link
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log(`Video downloaded: ${filename} (${(size / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    // =========================================================================
    // TIMER MANAGEMENT
    // =========================================================================
    
    /**
     * Starts the recording timer display
     * @private
     * @postcondition Timer element is updated every second
     */
    startTimer() {
        const timerElement = document.getElementById('record-timer');
        if (!timerElement) return;
        
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            
            timerElement.textContent = 
                `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    /**
     * Stops the recording timer
     * @private
     * @postcondition Timer is cleared
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    // =========================================================================
    // STATE QUERIES
    // =========================================================================
    
    /**
     * Checks if currently recording
     * @returns {boolean} True if recording is active
     */
    isRecording() {
        return this.mediaRecorder && this.mediaRecorder.state === 'recording';
    }
    
    /**
     * Gets elapsed recording time in seconds
     * @returns {number} Elapsed time in seconds
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    
    /**
     * Gets supported MIME types for recording
     * @static
     * @returns {string[]} Array of supported MIME types
     */
    static getSupportedMimeTypes() {
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm;codecs=h264',
            'video/webm'
        ];
        
        return types.filter(type => MediaRecorder.isTypeSupported(type));
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARRecorder;
}
