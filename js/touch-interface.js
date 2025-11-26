/**
 * TouchInterface Class
 * Manages interactive hotspots and popup cards for 3D AR models
 * 
 * @class TouchInterface
 * @description Converts 3D positions to 2D screen coordinates and handles touch interactions
 * @author AR Application Team
 * @date November 25, 2025
 */

import * as THREE from 'three';

export class TouchInterface {
    /**
     * Creates a TouchInterface instance
     * @constructor
     * @param {THREE.Camera} camera - Three.js camera for projection
     * @param {HTMLElement} container - Container element for hotspots
     * @precondition camera and container must be valid
     * @postcondition TouchInterface is initialized and ready to manage hotspots
     */
    constructor(camera, container) {
        this.camera = camera;
        this.container = container;
        this.hotspots = [];
        this.activePopup = null;
        this.enabled = false;
        
        // Create touch interface overlay
        this.interfaceElement = this.createInterfaceElement();
        
        // Bind methods
        this.updateHotspotPositions = this.updateHotspotPositions.bind(this);
        this.handleHotspotClick = this.handleHotspotClick.bind(this);
        this.handleClosePopup = this.handleClosePopup.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }
    
    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    
    /**
     * Creates the touch interface overlay element
     * @returns {HTMLElement} The interface container
     * @postcondition Interface element is created but not yet attached
     */
    createInterfaceElement() {
        const element = document.createElement('div');
        element.id = 'touch-interface';
        element.className = 'touch-interface-overlay';
        element.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        `;
        return element;
    }
    
    /**
     * Initializes and attaches the touch interface
     * @precondition Container element must exist in DOM
     * @postcondition Interface is attached and event listeners are registered
     */
    init() {
        this.container.appendChild(this.interfaceElement);
        this.enabled = true;
        
        // Global click handler to close popups when clicking outside
        document.addEventListener('click', this.handleOutsideClick);
        
        console.log('Touch interface initialized');
    }
    
    // =========================================================================
    // HOTSPOT MANAGEMENT
    // =========================================================================
    
    /**
     * Adds a new interactive hotspot
     * @param {Object} config - Hotspot configuration
     * @param {THREE.Vector3} config.position - 3D position in world space
     * @param {string} config.label - Hotspot label/title
     * @param {string} config.content - Popup content (HTML supported)
     * @param {string} [config.icon='ℹ️'] - Hotspot icon/emoji
     * @param {THREE.Object3D} [config.parent=null] - Parent 3D object (for relative positioning)
     * @returns {Object} Hotspot object with element and popup references
     * @precondition position must be a valid Vector3
     * @postcondition Hotspot is created and added to the interface
     */
    addHotspot(config) {
        const hotspotId = `hotspot-${this.hotspots.length}`;
        const popupId = `popup-${this.hotspots.length}`;
        
        // Create hotspot button
        const hotspotElement = document.createElement('button');
        hotspotElement.className = 'ar-hotspot';
        hotspotElement.id = hotspotId;
        hotspotElement.setAttribute('data-position', `${config.position.x},${config.position.y},${config.position.z}`);
        hotspotElement.setAttribute('data-info', popupId);
        hotspotElement.setAttribute('aria-label', config.label);
        hotspotElement.style.pointerEvents = 'auto';
        
        // Hotspot icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'hotspot-icon';
        iconSpan.textContent = config.icon || 'ℹ️';
        hotspotElement.appendChild(iconSpan);
        
        // Create popup card
        const popupElement = document.createElement('div');
        popupElement.className = 'popup-card hidden';
        popupElement.id = popupId;
        popupElement.style.pointerEvents = 'auto';
        
        // Popup header
        const popupHeader = document.createElement('div');
        popupHeader.className = 'popup-header';
        
        const popupTitle = document.createElement('h3');
        popupTitle.textContent = config.label;
        popupHeader.appendChild(popupTitle);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'popup-close-btn';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '✕';
        closeBtn.addEventListener('click', this.handleClosePopup);
        popupHeader.appendChild(closeBtn);
        
        popupElement.appendChild(popupHeader);
        
        // Popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        popupContent.innerHTML = config.content;
        popupElement.appendChild(popupContent);
        
        // Add event listener
        hotspotElement.addEventListener('click', this.handleHotspotClick);
        
        // Append to interface
        this.interfaceElement.appendChild(hotspotElement);
        this.interfaceElement.appendChild(popupElement);
        
        // Store hotspot data
        const hotspot = {
            id: hotspotId,
            element: hotspotElement,
            popup: popupElement,
            position: config.position.clone(),
            parent: config.parent || null,
            visible: false
        };
        
        this.hotspots.push(hotspot);
        
        console.log(`Hotspot added: ${config.label}`);
        return hotspot;
    }
    
    /**
     * Removes a hotspot by ID
     * @param {string} hotspotId - ID of the hotspot to remove
     * @precondition Hotspot with given ID must exist
     * @postcondition Hotspot and its popup are removed from DOM and array
     */
    removeHotspot(hotspotId) {
        const index = this.hotspots.findIndex(h => h.id === hotspotId);
        if (index !== -1) {
            const hotspot = this.hotspots[index];
            hotspot.element.remove();
            hotspot.popup.remove();
            this.hotspots.splice(index, 1);
            console.log(`Hotspot removed: ${hotspotId}`);
        }
    }
    
    /**
     * Clears all hotspots
     * @postcondition All hotspots and popups are removed
     */
    clearHotspots() {
        this.hotspots.forEach(hotspot => {
            hotspot.element.remove();
            hotspot.popup.remove();
        });
        this.hotspots = [];
        console.log('All hotspots cleared');
    }
    
    // =========================================================================
    // PROJECTION & POSITIONING
    // =========================================================================
    
    /**
     * Projects 3D world position to 2D screen coordinates
     * @param {THREE.Vector3} position - 3D position in world space
     * @param {THREE.Object3D} [parent=null] - Parent object for relative positioning
     * @returns {Object} Screen coordinates {x, y, visible}
     * @precondition position must be a valid Vector3
     * @postcondition Returns screen position and visibility flag
     */
    project3DTo2D(position, parent = null) {
        const pos = position.clone();
        
        // If parent exists, convert from local to world space
        if (parent) {
            parent.localToWorld(pos);
        }
        
        // Project to normalized device coordinates (NDC)
        const vector = pos.clone();
        vector.project(this.camera);
        
        // Check if point is in front of camera (visible)
        const visible = vector.z < 1;
        
        // Convert NDC to screen coordinates
        const canvas = this.container.querySelector('canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : this.container.getBoundingClientRect();
        
        const x = (vector.x * 0.5 + 0.5) * rect.width;
        const y = (vector.y * -0.5 + 0.5) * rect.height;
        
        return { x, y, visible };
    }
    
    /**
     * Updates all hotspot positions based on current camera view
     * @precondition Camera must be initialized
     * @postcondition All hotspot positions are updated to match 3D world positions
     */
    updateHotspotPositions() {
        if (!this.enabled) return;
        
        this.hotspots.forEach(hotspot => {
            const screenPos = this.project3DTo2D(hotspot.position, hotspot.parent);
            
            // Update position
            hotspot.element.style.left = `${screenPos.x}px`;
            hotspot.element.style.top = `${screenPos.y}px`;
            
            // Update visibility
            if (screenPos.visible) {
                hotspot.element.classList.remove('hidden');
                hotspot.visible = true;
            } else {
                hotspot.element.classList.add('hidden');
                hotspot.visible = false;
                
                // Hide popup if hotspot is not visible
                if (this.activePopup === hotspot.popup) {
                    this.closePopup();
                }
            }
        });
    }
    
    /**
     * Positions popup relative to its hotspot
     * @param {HTMLElement} popup - Popup element to position
     * @param {HTMLElement} anchor - Hotspot element to anchor to
     * @precondition popup and anchor must be valid DOM elements
     * @postcondition Popup is positioned near the hotspot with smart placement
     */
    positionPopup(popup, anchor) {
        const rect = anchor.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        // Default: position below and centered
        let left = rect.left - popupRect.width / 2 + rect.width / 2;
        let top = rect.bottom + 10;
        
        // Adjust if popup goes off right edge
        if (left + popupRect.width > containerRect.width) {
            left = containerRect.width - popupRect.width - 10;
        }
        
        // Adjust if popup goes off left edge
        if (left < 10) {
            left = 10;
        }
        
        // Position above if below would go off screen
        if (top + popupRect.height > containerRect.height) {
            top = rect.top - popupRect.height - 10;
        }
        
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    }
    
    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================
    
    /**
     * Handles hotspot click events
     * @param {Event} e - Click event
     * @precondition Event must be from a hotspot element
     * @postcondition Associated popup is displayed
     */
    handleHotspotClick(e) {
        e.stopPropagation();
        
        const hotspot = e.currentTarget;
        const popupId = hotspot.getAttribute('data-info');
        const popup = document.getElementById(popupId);
        
        if (popup) {
            // Close any existing popup
            this.closePopup();
            
            // Show new popup
            popup.classList.remove('hidden');
            this.activePopup = popup;
            
            // Position popup
            requestAnimationFrame(() => {
                this.positionPopup(popup, hotspot);
            });
            
            console.log('Popup opened:', popupId);
        }
    }
    
    /**
     * Handles popup close button clicks
     * @param {Event} e - Click event
     * @postcondition Current popup is closed
     */
    handleClosePopup(e) {
        e.stopPropagation();
        this.closePopup();
    }
    
    /**
     * Handles clicks outside popups to close them
     * @param {Event} e - Click event
     * @postcondition Popup is closed if click is outside
     */
    handleOutsideClick(e) {
        if (this.activePopup && !this.activePopup.contains(e.target) && 
            !e.target.closest('.ar-hotspot')) {
            this.closePopup();
        }
    }
    
    /**
     * Closes the currently active popup
     * @postcondition Active popup is hidden
     */
    closePopup() {
        if (this.activePopup) {
            this.activePopup.classList.add('hidden');
            this.activePopup = null;
        }
    }
    
    // =========================================================================
    // UTILITY METHODS
    // =========================================================================
    
    /**
     * Enables the touch interface
     * @postcondition Interface is enabled and hotspots are visible
     */
    enable() {
        this.enabled = true;
        this.interfaceElement.style.display = '';
    }
    
    /**
     * Disables the touch interface
     * @postcondition Interface is disabled and hotspots are hidden
     */
    disable() {
        this.enabled = false;
        this.interfaceElement.style.display = 'none';
        this.closePopup();
    }
    
    /**
     * Cleans up resources and removes event listeners
     * @postcondition All event listeners removed and elements cleared
     */
    dispose() {
        document.removeEventListener('click', this.handleOutsideClick);
        this.clearHotspots();
        this.interfaceElement.remove();
        console.log('Touch interface disposed');
    }
}
