
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random'

function Stars(props) {
    const ref = useRef()
    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }))

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10
        ref.current.rotation.y -= delta / 15
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#06b6d4" // Cyan color
                    size={0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    )
}

function FloatingShape() {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.position.y = Math.sin(time / 2) * 0.1;
        meshRef.current.rotation.x = time * 0.1;
        meshRef.current.rotation.y = time * 0.1;
    });

    return (
        <mesh ref={meshRef} position={[2, 0, 0]} scale={0.5}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#0ea5e9" wireframe opacity={0.3} transparent />
        </mesh>
    );
}


import { useTheme } from '../contexts/ThemeContext' // Import hook

export default function ThreeBackground() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`fixed inset-0 z-[-1] transition-colors duration-500 ${isDark ? "bg-gradient-to-b from-slate-950 to-slate-900" : "bg-gradient-to-b from-slate-50 to-slate-200"}`}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <fog attach="fog" args={[isDark ? '#020617' : '#f0f9ff', 8.5, 12]} />
                <ambientLight intensity={isDark ? 0.2 : 0.5} />
                <Stars />
                {/* We can add more subtle background elements here */}
            </Canvas>
        </div>
    )
}
