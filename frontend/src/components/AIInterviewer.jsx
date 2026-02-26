import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html, useAnimations } from "@react-three/drei";
import { MathUtils } from "three";
import { randInt } from "three/src/math/MathUtils";

const TEACHER_CONFIG = {
    female: {
        position: [0, -1.6, 0],
        scale: 1.7,
        bubblePos: [0, 2.2, 0]
    },
};

const FADE = 0.5;

function detectClip(actions, tags = []) {
    if (!actions) return null;
    const keys = Object.keys(actions);
    const lowerKeys = keys.map((k) => k.toLowerCase());

    for (let tag of tags) {
        const foundIndex = lowerKeys.findIndex((k) => k.includes(tag));
        if (foundIndex >= 0) return keys[foundIndex];
    }

    const idleIndex = lowerKeys.findIndex((k) => k.includes("idle") || k.includes("stand"));
    if (idleIndex >= 0) return keys[idleIndex];

    return keys[0];
}

function TeacherModel({ isRecording, loading, isMuted, talking }) {
    const head = useRef();
    const teacher = "female";

    const modelFile = "female_teacher";
    const animFile = "animations_female";

    const { scene: modelScene } = useGLTF(`/models/${modelFile}.glb`, true);
    const { animations } = useGLTF(`/models/${animFile}.glb`, true);

    useEffect(() => {
        const valid = new Set();
        modelScene.traverse((n) => valid.add(n.name));

        animations.forEach((clip) => {
            clip.tracks = clip.tracks.filter((track) => {
                const node = track.name.split(".")[0];
                return valid.has(node);
            });
        });
    }, [modelScene, animations]);

    const { actions, mixer } = useAnimations(animations, modelScene);

    const [state, setState] = useState("Idle");
    const [blink, setBlink] = useState(false);
    const [dots, setDots] = useState(".");
    const blinkRef = useRef();
    const thinkRef = useRef();

    useEffect(() => {
        head.current = null;
        modelScene.traverse((c) => {
            if (c.isMesh && c.morphTargetDictionary) {
                if (c.name.includes("Head") || c.name.includes("Face") || !head.current) {
                    head.current = c;
                }
            }
        });
    }, [modelScene, teacher]);

    // State Logic
    useEffect(() => {
        if (loading) {
            setState("Thinking");
        } else {
            if (isMuted) setState("Idle");
            else if (talking) setState("Talking");
            else setState("Idle");
        }
    }, [loading, isMuted, talking]);

    // Blinking Loop
    useEffect(() => {
        function loop() {
            blinkRef.current = setTimeout(() => {
                setBlink(true);
                setTimeout(() => setBlink(false), 120);
                loop();
            }, randInt(1500, 4200));
        }
        loop();
        return () => clearTimeout(blinkRef.current);
    }, [teacher]);

    // Thinking Dots
    useEffect(() => {
        if (!loading) return setDots(".");
        let i = 1;
        thinkRef.current = setInterval(() => { i = i === 3 ? 1 : i + 1; setDots(".".repeat(i)); }, 420);
        return () => clearInterval(thinkRef.current);
    }, [loading]);

    // Handle Animation Mixer
    useEffect(() => {
        if (!actions) return;
        const idleClip = detectClip(actions, ["idle", "stand"]);
        const talkClip = detectClip(actions, ["talk", "speak"]);
        const thinkClip = detectClip(actions, ["think", "ponder"]);

        let targetClipName = idleClip;
        if (state === "Talking" && talkClip) targetClipName = talkClip;
        if (state === "Thinking") targetClipName = thinkClip || idleClip;

        Object.values(actions).forEach((action) => {
            if (action.getClip().name !== targetClipName) action.fadeOut(FADE);
        });

        if (actions[targetClipName]) actions[targetClipName].reset().fadeIn(FADE).play();
    }, [actions, state, teacher]);

    useEffect(() => {
        if (mixer) mixer.stopAllAction();
        if (head.current?.morphTargetInfluences) head.current.morphTargetInfluences.fill(0);
    }, [teacher, mixer]);

    const morph = (name, v, sp = 0.2) => {
        if (!head.current) return;
        const dict = head.current.morphTargetDictionary;
        const infl = head.current.morphTargetInfluences;
        if (dict && dict[name] !== undefined) {
            infl[dict[name]] = MathUtils.lerp(infl[dict[name]], v, sp);
        }
    };

    useFrame((_threeState) => {
        // 1. Blinking
        morph("eye_close", blink ? 1 : 0, 0.25);

        // 2. Lip Sync Logic
        if (state === "Talking" && props.lipSync) {
            const currentTime = props.audioContextTime || 0; // Assume we pass current audio time
            const cue = props.lipSync.mouthCues?.find(
                (c) => currentTime >= c.start && currentTime <= c.end
            );

            if (cue) {
                // Map Rhubarb A,B,C,D,E,F,G,H,X to morph targets
                // For now, map to common jaw/mouth targets
                const mouthTargets = {
                    'A': { jawOpen: 0.1, mouthSmile: 0.1 },
                    'B': { jawOpen: 0.2, mouthSmile: 0.2 },
                    'C': { jawOpen: 0.4, mouthSmile: 0.1 },
                    'D': { jawOpen: 0.6, mouthSmile: 0.1 },
                    'E': { jawOpen: 0.3, mouthSmile: 0.3 },
                    'F': { jawOpen: 0.5, mouthSmile: 0.1 },
                    'G': { jawOpen: 0.2, mouthSmile: 0.4 },
                    'H': { jawOpen: 0.1, mouthSmile: 0.5 },
                    'X': { jawOpen: 0, mouthSmile: 0 }
                };
                const config = mouthTargets[cue.value] || mouthTargets['X'];
                morph("jawOpen", config.jawOpen, 0.5);
                morph("mouthSmile", config.mouthSmile, 0.5);
            }
        } else if (talking) {
            // Fallback: Simple jaw oscillation
            const jawValue = (Math.sin(Date.now() / 100) + 1) / 2;
            morph("jawOpen", jawValue * 0.6, 0.5);
        } else {
            // Reset mouth
            morph("jawOpen", 0, 0.2);
            morph("mouthSmile", 0, 0.2);
        }
    });

    const config = TEACHER_CONFIG[teacher];

    return (
        <group position={config.position} scale={config.scale}>
            {(loading) && (
                <Html position={config.bubblePos}>
                    <div className="flex justify-center relative">
                        <span className="animate-ping absolute h-8 w-8 rounded-full bg-accent opacity-75"></span>
                        <span className="relative h-8 w-8 rounded-full bg-white shadow flex items-center justify-center text-accent font-bold text-sm">{dots}</span>
                    </div>
                </Html>
            )}
            <primitive object={modelScene} />
        </group>
    );
}

export default function AIInterviewer(props) {
    return (
        <div className="w-full h-full relative z-10 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <Canvas camera={{ position: [0, 0, 2.5], fov: 35 }}>
                <ambientLight intensity={0.6} />
                <directionalLight intensity={1.2} position={[5, 5, 5]} />
                <Suspense fallback={
                    <Html center>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white/70 mt-2 text-xs">Loading AI...</span>
                        </div>
                    </Html>
                }>
                    <TeacherModel {...props} />
                    <Environment preset="city" />
                </Suspense>
                <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} target={[0, 0.2, 0]} />
            </Canvas>
            <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded text-xs border border-red-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    REC
                </div>
            </div>
        </div>
    );
}
