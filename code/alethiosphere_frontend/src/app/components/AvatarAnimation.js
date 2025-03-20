import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AvatarAnimation = ({ width = 800, height = 800, id }) => {
	const mountRef = useRef(null);
	const audioRef = useRef(null);
	const timeoutRef = useRef(null);
	const initRef = useRef(false);

	// Scene variables
	let scene, camera, renderer, mouthPlane, leftEyePlane, rightEyePlane;
	let mouthMap = {
		"A": "/images/avatar/Mouth_Open.png",
		"B": "/images/avatar/Mouth_Closed.png",
		"C": "/images/avatar/Mouth_Half.png",
		"D": "/images/avatar/Mouth_Ee.png",
	};
	
	let lipSyncData = [];
	let mouthMaterial, mouthTexture;
	let blinkInterval;

	// Clean up any ongoing animation
	const cleanupAnimation = () => {
		console.log("Cleaning up previous animation");
		
		// Clear any pending timeouts
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		
		// Stop any playing audio
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = '';
			audioRef.current = null;
		}
	};

	useEffect(() => {
		if (initRef.current) {
			// If already initialized, just clean up and load fresh assets
			cleanupAnimation();
			loadFreshAssets();
			return;
		}

		// Initialize on first mount
		initRef.current = true;

		// Initialize the scene
		const init = () => {
			// Scene Setup
			scene = new THREE.Scene();
			camera = new THREE.OrthographicCamera(-640, 640, 640, -640, 0.1, 1000);
			camera.position.z = 5;

			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
			renderer.setSize(width, height);
			mountRef.current.appendChild(renderer.domElement);

			// Load Face Texture
			const textureLoader = new THREE.TextureLoader();

			let faceTexture = textureLoader.load("/images/avatar/head_base.jpg");
			let faceMaterial = new THREE.MeshBasicMaterial({ map: faceTexture, transparent: true });
			let faceGeometry = new THREE.PlaneGeometry(1280, 1280);
			let faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
			scene.add(faceMesh);

			// Load Mouth Texture (Initial)
			mouthTexture = textureLoader.load(mouthMap["B"]);
			mouthMaterial = new THREE.MeshBasicMaterial({ map: mouthTexture, transparent: true });
			let mouthGeometry = new THREE.PlaneGeometry(1280, 1280);
			mouthPlane = new THREE.Mesh(mouthGeometry, mouthMaterial);
			mouthPlane.position.z = 1; // Ensure mouth is rendered on top
			scene.add(mouthPlane);

			// Load Eye Textures (Initial)
			let leftEyeTexture = textureLoader.load("/images/avatar/Eye_L_Open.png");
			let rightEyeTexture = textureLoader.load("/images/avatar/Eye_R_Open.png");

			let leftEyeMaterial = new THREE.MeshBasicMaterial({ map: leftEyeTexture, transparent: true });
			let rightEyeMaterial = new THREE.MeshBasicMaterial({ map: rightEyeTexture, transparent: true });

			let eyeGeometry = new THREE.PlaneGeometry(1280, 1280);
			leftEyePlane = new THREE.Mesh(eyeGeometry, leftEyeMaterial);
			rightEyePlane = new THREE.Mesh(eyeGeometry, rightEyeMaterial);

			leftEyePlane.position.z = 1; // Bring in front of face
			rightEyePlane.position.z = 1; // Bring in front of face

			scene.add(leftEyePlane);
			scene.add(rightEyePlane);

			animate();
		};

		// Blink eyes function
		const blinkEyes = () => {
			const textureLoader = new THREE.TextureLoader();

			let leftEyePath = "/images/avatar/Eye_L_Closed.png";
			let rightEyePath = "/images/avatar/Eye_R_Closed.png";

			textureLoader.load(leftEyePath, function (texture) {
				if (leftEyePlane) {
					leftEyePlane.material.map = texture;
					leftEyePlane.material.needsUpdate = true;
				}
			});

			textureLoader.load(rightEyePath, function (texture) {
				if (rightEyePlane) {
					rightEyePlane.material.map = texture;
					rightEyePlane.material.needsUpdate = true;
				}
			});

			setTimeout(() => {
				let leftEyeOpen = "/images/avatar/Eye_L_Open.png";
				let rightEyeOpen = "/images/avatar/Eye_R_Open.png";

				textureLoader.load(leftEyeOpen, function (texture) {
					if (leftEyePlane) {
						leftEyePlane.material.map = texture;
						leftEyePlane.material.needsUpdate = true;
					}
				});

				textureLoader.load(rightEyeOpen, function (texture) {
					if (rightEyePlane) {
						rightEyePlane.material.map = texture;
						rightEyePlane.material.needsUpdate = true;
					}
				});
			}, 100); // Short duration for natural blinking
		};

		let animationFrameId;

		const animate = () => {
			if (!mountRef.current) return;
			animationFrameId = requestAnimationFrame(animate);
			renderer.render(scene, camera);
		};

		// Function to set mouth shape
		const setMouthShape = (shape) => {
			if (!mouthPlane || !mouthMap[shape]) return;
			
			const textureLoader = new THREE.TextureLoader();
			textureLoader.load(mouthMap[shape || "B"], function (texture) {
				if (mouthPlane) {
					mouthPlane.material.map = texture;
					mouthPlane.material.needsUpdate = true;
				}
			});
		};

		// Lip sync function
		const lipSync = (lipSyncDataArray) => {
			if (!lipSyncDataArray || lipSyncDataArray.length === 0) return;

			// Process the first cue
			const processCue = (cueIndex) => {
				if (cueIndex >= lipSyncDataArray.length) {
					// End of cues, set mouth to closed
					setMouthShape("B");
					return;
				}

				const cue = lipSyncDataArray[cueIndex];
				const mouthShape = cue.value;
				const duration = (cue.end - cue.start) * 1000; // Convert to milliseconds

				// Set the current mouth shape
				setMouthShape(mouthShape);

				// Schedule the next cue
				timeoutRef.current = setTimeout(() => {
					processCue(cueIndex + 1);
				}, duration);
			};

			// Start processing cues
			processCue(0);
		};

		// Load fresh assets with timestamp to prevent caching
		const loadFreshAssets = () => {
			const timestamp = new Date().getTime();
			
			// Fetch lipSync data with cache busting
			fetch(`/data/lipSync.json?t=${timestamp}`)
				.then(response => response.json())
				.then(data => {
					console.log("Loaded fresh lip sync data at", timestamp);
					
					// Create a new audio element with cache busting
					const audio = new Audio(`/audio/audio.wav?t=${timestamp}`);
					audioRef.current = audio;
					
					// Set up audio events
					audio.onloadeddata = () => {
						console.log("Audio loaded, ready to play");
					};
					
					audio.onplay = () => {
						console.log("Audio started playing");
						lipSync(data.mouthCues);
					};
					
					audio.onended = () => {
						console.log("Audio finished");
						// Reset mouth shape when audio finishes
						setMouthShape("B");
					};
					
					audio.onerror = (e) => {
						console.error("Audio error:", e);
					};
					
					// Try to play audio (may be blocked by browser policy)
					audio.play().catch(err => {
						console.warn("Audio autoplay blocked, waiting for user interaction:", err);
						
						// Add a one-time click handler for user interaction
						document.body.addEventListener('click', function playOnClick() {
							audio.play().catch(e => console.error("Play error after click:", e));
							document.body.removeEventListener('click', playOnClick);
						}, { once: true });
					});
				})
				.catch(error => {
					console.error("Error loading lip sync data:", error);
				});
		};

		init();
		blinkInterval = setInterval(blinkEyes, 4000);
		
		// Initial load with small delay to ensure DOM is ready
		setTimeout(loadFreshAssets, 100);

		// Clean up function
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			clearInterval(blinkInterval);
			cleanupAnimation();

			if (renderer) {
				renderer.dispose();
				if (mountRef.current) {
					while (mountRef.current.firstChild) {
						mountRef.current.removeChild(mountRef.current.firstChild);
					}
				}
			}

			if (mouthMaterial) mouthMaterial.dispose();
			if (mouthTexture) mouthTexture.dispose();

			if (scene) scene.clear();
			
			// Don't reset initRef to allow reuse of the scene
		};
	}, [width, height, id]); // Add id to dependencies to force remount when id changes

	return <div ref={mountRef} style={{ width: `${width}px`, height: `${height}px` }} />;
};

export default AvatarAnimation;