import React, { useEffect, useRef, useState } from "react";
import { Video, CheckCircle, AlertTriangle } from "lucide-react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

export default function ProctoringCamera({ onViolation }) {
    const videoRef = useRef(null);
    const [status, setStatus] = useState("Initializing...");
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [isTracking, setIsTracking] = useState(false);

    // Integrity tracking states
    const [noFaceCount, setNoFaceCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const initMediaPipe = async () => {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

                const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                if (isMounted) {
                    setFaceLandmarker(landmarker);
                    setStatus("Ready");
                }
            } catch (err) {
                console.error("MediaPipe initialization failed:", err);
                if (isMounted) setStatus("Error loading AI model");
            }
        };
        initMediaPipe();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let stream = null;
        let animationFrameId;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setStatus("Camera Access Denied");
            }
        };

        if (faceLandmarker) {
            startCamera();
        }

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [faceLandmarker]);

    const handleVideoPlay = () => {
        setIsTracking(true);
        setStatus("Tracking Active");
        let lastVideoTime = -1;

        const predict = async () => {
            if (!videoRef.current || !faceLandmarker) return;

            let startTimeMs = performance.now();
            if (lastVideoTime !== videoRef.current.currentTime) {
                lastVideoTime = videoRef.current.currentTime;

                const results = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);

                if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                    setNoFaceCount(0);
                    // Reset or log active face
                } else {
                    setNoFaceCount(prev => {
                        const newCount = prev + 1;
                        if (newCount > 30) { // roughly 1 second at 30fps
                            if (onViolation) onViolation("Face Missing - Please remain visible in camera");
                            return 0; // reset to avoid spam calls
                        }
                        return newCount;
                    });
                }
            }
            if (isTracking) {
                requestAnimationFrame(predict);
            }
        };

        requestAnimationFrame(predict);
    };

    return (
        <div className="bg-black/40 rounded-xl border border-white/10 p-3 overflow-hidden relative shadow-lg">
            <div className="absolute top-4 left-4 flex gap-2 z-10">
                <div className="bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded text-[10px] border border-red-500/30 flex items-center gap-1 backdrop-blur-md shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    REC
                </div>
                <div className={`font-semibold px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 backdrop-blur-md shadow-sm ${status === "Tracking Active"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}>
                    {status === "Tracking Active" ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                    {status}
                </div>
            </div>

            <div className="h-40 md:h-48 w-full bg-[#111] rounded-lg flex flex-col items-center justify-center text-white/30 border border-white/5 relative overflow-hidden">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    onLoadedData={handleVideoPlay}
                    playsInline
                    muted
                />

                <div className="absolute inset-0 border-[1px] border-green-500/20 rounded-lg m-[10%]" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)' }}></div>

                {!isTracking && <Video size={32} className="mb-2 opacity-50 z-0" />}
            </div>
        </div>
    );
}
