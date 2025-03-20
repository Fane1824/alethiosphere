"use client";

import AvatarAnimation from "@/app/components/AvatarAnimation";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/(auth)/client-jwt";

export default function ChatPage() {
	const router = useRouter();
	const [transcript, setTranscript] = useState([]);
	const [currentSentence, setCurrentSentence] = useState("");
	const videoRef = useRef(null); // Ref for the live camera stream
	const mainVideoRef = useRef(null); // Ref for the AI video
	const [recognitionInstance, setRecognitionInstance] = useState(null);
	const transcriptContainerRef = useRef(null); // New ref for transcript container

	const [animationKey, setAnimationKey] = useState(null); // initialize as null
	const [isMuted, setIsMuted] = useState(false);
	const [isVideoOn, setIsVideoOn] = useState(true);
	const [userStream, setUserStream] = useState(null);

	// Authentication check
	useEffect(() => {
		if (!isAuthenticated()) {
			router.push('/login?auth_required=true');
		}
	}, [router]);

	// Access the user's camera and stream live video
	useEffect(() => {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					if (videoRef.current) {
						videoRef.current.srcObject = stream;
						setUserStream(stream);
					}
				})
				.catch((error) => {
					console.error("Error accessing the camera or microphone:", error);
				});
		}

		// Initialize AI video if available
		if (mainVideoRef.current) {
			mainVideoRef.current.play().catch(error => {
				console.error("Error playing AI video:", error);
			});
		}

		// Cleanup function to stop the stream when component unmounts
		return () => {
			if (userStream) {
				userStream.getTracks().forEach(track => track.stop());
			}
		};
	}, []);

	// New function to generate AI response via API call
	const generateResponse = async (userMessage) => {
		try {
			const res = await fetch("/api/generateResponse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					conversation: transcript,
					userMessage
				}),
			});
			const data = await res.json();
			return data.response;
		} catch (error) {
			console.error(error);
			return "I'm reflecting on what you shared—could you elaborate?";
		}
	};

	// Modify cueSpeech to ensure synchronization between response and audio
	async function cueSpeech(aiResponse) {
		try {
			console.log("Generating speech for response:", aiResponse.substring(0, 30) + "...");
			
			// Generate lip sync data
			const lipsyncResponse = await fetch("/api/generate_lipsync", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: aiResponse })
			});
			
			const lipsyncData = await lipsyncResponse.json();
			
			if (lipsyncData.success) {
				console.log("Speech generated successfully, triggering avatar animation");
				
				// Force component remount with a unique timestamp to ensure fresh files are loaded
				setAnimationKey(Date.now());
				
				return true;
			} else {
				console.error("Failed to generate speech:", lipsyncData.error || "Unknown error");
				return false;
			}
		} catch (error) {
			console.error("Speech generation error:", error);
			return false;
		}
	}

	useEffect(() => {
		if ("webkitSpeechRecognition" in window) {
			const recognition = new window.webkitSpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = false;
			recognition.lang = "en-US";
			recognition.onresult = async (event) => {
				const lastResult = event.results[event.results.length - 1];
				if (lastResult.isFinal) {
					const recognizedText = lastResult[0].transcript;
					
					// Add user message to transcript
					setTranscript(prev => [...prev, { text: recognizedText, sender: "user" }]);
					
					// Generate AI response
					const aiResponse = await generateResponse(recognizedText);
					
					// Generate speech and update animation before adding AI message to transcript
					await cueSpeech(aiResponse);
					
					// Then add AI message to transcript
					setTranscript(prev => [...prev, { text: aiResponse, sender: "ai" }]);
				}
			};
			setRecognitionInstance(recognition);
		}
	}, []);

	// Update the speech recognition when mute state changes
	useEffect(() => {
		if (recognitionInstance) {
			if (!isMuted) {
				recognitionInstance.start();
			} else {
				recognitionInstance.stop();
			}
		}
	}, [isMuted, recognitionInstance]);

	const handleInputChange = async(e) => {
		setCurrentSentence(e.target.value);
	};
	// Add autoscroll effect that runs whenever transcript changes
	useEffect(() => {
		if (transcriptContainerRef.current) {
			transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
		}
	}, [transcript]);

	// const handleInputChange = (e) => {
	//   setCurrentSentence(e.target.value);
	// };

	// Replace text input response placeholder with API call
	const handleInputKeyPress = async (e) => {
		if (e.key === "Enter" && currentSentence.trim() !== "") {
			const userText = currentSentence.trim();
			setCurrentSentence("");
			
			// Add user message to transcript
			setTranscript(prev => [...prev, { text: userText, sender: "user" }]);
			
			// Generate AI response
			const aiResponse = await generateResponse(userText);
			
			// Generate speech and update animation before adding AI message to transcript
			// This ensures the avatar speaks the current response, not the previous one
			await cueSpeech(aiResponse);
			
			// Then add AI message to transcript
			setTranscript(prev => [...prev, { text: aiResponse, sender: "ai" }]);
		}
	};

	// New functions for video controls
	const toggleMute = () => {
		if (userStream) {
			userStream.getAudioTracks().forEach(track => {
				track.enabled = isMuted;
			});
			setIsMuted(!isMuted);
		}
	};

	const toggleVideo = () => {
		if (userStream) {
			userStream.getVideoTracks().forEach(track => {
				track.enabled = !isVideoOn; // Toggle the current state
			});
			setIsVideoOn(!isVideoOn);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#55DBCB] to-[#189195] font-[PoppinsFont]">
			{/* Navigation */}
			<nav className="bg-[#55DBCB] shadow-md w-full z-10 p-4">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center">
						<div className="flex-shrink-0 flex items-center">
							<span className="text-[#453823] text-xl font-bold">AlethioSphere</span>
						</div>
						<div className="flex items-center space-x-4">
							<button
								onClick={() => router.push('/home')}
								className="text-[#453823] hover:bg-[#189195] hover:text-white px-3 py-2 rounded-md font-medium transition-colors"
							>
								Back to Home
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Chat Interface */}
			<div className="container mx-auto px-4 py-8 mt-8">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Left Section - Video & Info */}
					<div className="md:w-1/2 sm:w-full">
						<div className="bg-[#189195] rounded-lg shadow-xl overflow-hidden mb-6">
							<div className="p-5 bg-[#0F7478] text-white">
								<h2 className="text-2xl font-bold">Alethia</h2>
								<p className="text-sm opacity-80">Your personal journaling companion</p>
							</div>

							{/* Main Video Container */}
							<div id="avatar" className="relative w-full aspect-video flex item-center justify-center align-center">
								{animationKey !== null && (
									<AvatarAnimation key={animationKey} width="600" height="600" id={animationKey} />
								)}

								{/* User Video Feed with Controls */}
								<div className="absolute bottom-4 right-4">
									<div className="w-32 h-32 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white relative">
										{isVideoOn ? (
											<video
												ref={videoRef}
												className="w-full h-full object-cover"
												autoPlay
												muted  // Always mute the video element
												playsInline  // Add playsInline for better mobile support
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
											</div>
										)}

										{/* Video Controls Overlay */}
										<div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1 p-1 bg-black/50">
											{/* Microphone Toggle Button */}
											<button
												onClick={toggleMute}
												className={`p-1 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'} hover:opacity-80 transition-opacity`}
												title={isMuted ? "Unmute microphone" : "Mute microphone"}
											>
												{isMuted ? (
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
													</svg>
												) : (
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
													</svg>
												)}
											</button>

											{/* Camera Toggle Button */}
											<button
												onClick={toggleVideo}
												className={`p-1 rounded-full ${isVideoOn ? 'bg-green-500' : 'bg-red-500'} hover:opacity-80 transition-opacity`}
												title={isVideoOn ? "Turn off camera" : "Turn on camera"}
											>
												{isVideoOn ? (
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
													</svg>
												) : (
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
													</svg>
												)}
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Section - Transcript & Input */}
					<div className="md:w-1/2 sm:w-full">
						<div className="bg-white rounded-lg shadow-xl overflow-hidden h-[calc(100vh-12rem)] flex flex-col justify-between">
							<div className="p-4 bg-[#453823] text-white">
								<h2 className="text-xl font-bold">Conversation Transcript</h2>
							</div>

							{/* Transcript Area - add ref here */}
							<div
								ref={transcriptContainerRef}
								className="h-[calc(100%-8rem)] overflow-y-scroll p-4"
							>
								{transcript.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-auto text-gray-400 text-center">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
										</svg>
										<p>Your conversation will appear here.</p>
										<p className="text-sm mt-2">Start by typing a message below.</p>
									</div>
								) : (
									<div className="space-y-4">
										{transcript.map((message, index) => (
											<div
												key={index}
												className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
											>
												<div
													className={`max-w-3/4 p-3 rounded-lg ${
														message.sender === 'user'
															? 'bg-[#189195]/10 text-[#233855] rounded-tr-none'
															: 'bg-[#189195]/80 text-white rounded-tl-none'
													}`}
												>
													{message.text}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
							{/* Input Area */}
							<div className="p-4 border-t">
								<div className="flex">
									<input
										type="text"
										value={currentSentence}
										onChange={handleInputChange}
										onKeyUp={handleInputKeyPress}
										className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#189195] text-[#453823]"
										placeholder="Type your message..."
									/>
								</div>
								<p className="mt-2 text-xs text-gray-500 text-center">
									Press Enter to send
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
