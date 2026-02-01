
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, Cone } from '@react-three/drei';

function DNAHelix(props) {
    const group = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = t * 0.2;
        group.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    });

    const particles = [];
    const count = 30; // Number of "base pairs"

    for (let i = 0; i < count; i++) {
        const y = (i - count / 2) * 0.4;
        const angle = i * 0.5;
        const x = Math.cos(angle) * 1.5;
        const z = Math.sin(angle) * 1.5;

        particles.push(
            <group key={i} position={[0, y, 0]}>
                <mesh position={[x, 0, z]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} roughness={0.2} />
                </mesh>
                <mesh position={[-x, 0, -z]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.5} roughness={0.2} />
                </mesh>
                {/* Connecting bar */}
                <mesh rotation={[0, -angle, Math.PI / 2]} scale={[y, 1, 1]}>
                    {/* The scale on cylinder is weird, let's just rotate cylinder to bridge them */}
                </mesh>
                <mesh position={[0, 0, 0]} rotation={[0, -angle, Math.PI / 2]}>
                    <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
                    <meshStandardMaterial color="white" opacity={0.3} transparent />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={group} {...props}>
            {particles}
        </group>
    );
}

function FloatingPills() {
    return (
        <group>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2} position={[2, 2, -1]}>
                <mesh rotation={[Math.PI / 4, 0, 0]}>
                    <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                </mesh>
                <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 4, 0, 0]}>
                    <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </mesh>
            </Float>
        </group>
    )
}

export default function Hero3D() {
    return (
        <group>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

            <DNAHelix position={[0, 0, 0]} scale={0.8} />
            <Float speed={4} rotationIntensity={1} floatIntensity={1}>
                {/* Abstract background shapes */}
                <Torus args={[3, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshBasicMaterial color="#0891b2" transparent opacity={0.1} />
                </Torus>
                <Torus args={[2, 0.03, 16, 100]} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                    <meshBasicMaterial color="#2563eb" transparent opacity={0.1} />
                </Torus>
            </Float>
        </group>
    );
}
