import React, { useRef, useEffect, useState } from 'react';

/**
 * High-Performance Interactive 3D Medical Canvas Component
 * Renders an interactive 3D DNA & Particle Helix with glowing nodes.
 * Works across all hardware with zero WebGL crashes or context loss.
 */
function Interactive3DHero() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let width = (canvas.width = canvas.parentElement.offsetWidth || 500);
        let height = (canvas.height = canvas.parentElement.offsetHeight || 500);

        const handleResize = () => {
            if (canvas && canvas.parentElement) {
                width = canvas.width = canvas.parentElement.offsetWidth || 500;
                height = canvas.height = canvas.parentElement.offsetHeight || 500;
            }
        };

        window.addEventListener('resize', handleResize);

        // Generate 3D Helix base pairs
        const totalNodes = 40;
        let angleOffset = 0;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left - width / 2) * 0.001;
            mouseY = (e.clientY - rect.top - height / 2) * 0.001;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            angleOffset += 0.015;

            const cx = width / 2;
            const cy = height / 2;
            const radius = Math.min(width, height) * 0.3;

            for (let i = 0; i < totalNodes; i++) {
                const y = (i - totalNodes / 2) * 9;
                const angle = i * 0.35 + angleOffset + mouseX;

                // 3D coordinates for strand 1
                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;

                // 3D coordinates for strand 2 (180 deg out of phase)
                const x2 = Math.cos(angle + Math.PI) * radius;
                const z2 = Math.sin(angle + Math.PI) * radius;

                // Perspective projection factor
                const fov = 400;
                const scale1 = fov / (fov + z1);
                const scale2 = fov / (fov + z2);

                const projX1 = cx + x1 * scale1;
                const projY1 = cy + y * scale1 + mouseY * 50;

                const projX2 = cx + x2 * scale2;
                const projY2 = cy + y * scale2 + mouseY * 50;

                // Draw Connecting Base Pair Line
                ctx.beginPath();
                ctx.moveTo(projX1, projY1);
                ctx.lineTo(projX2, projY2);
                ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * scale1})`;
                ctx.lineWidth = 1.5 * scale1;
                ctx.stroke();

                // Draw Strand Node 1 (Cyan Glow)
                ctx.beginPath();
                ctx.arc(projX1, projY1, Math.max(1, 4.5 * scale1), 0, Math.PI * 2);
                ctx.fillStyle = z1 > 0 ? '#06b6d4' : '#0891b2';
                ctx.shadowBlur = z1 > 0 ? 12 : 0;
                ctx.shadowColor = '#06b6d4';
                ctx.fill();

                // Draw Strand Node 2 (Blue/Purple Glow)
                ctx.beginPath();
                ctx.arc(projX2, projY2, Math.max(1, 4.5 * scale2), 0, Math.PI * 2);
                ctx.fillStyle = z2 > 0 ? '#3b82f6' : '#1d4ed8';
                ctx.shadowBlur = z2 > 0 ? 12 : 0;
                ctx.shadowColor = '#3b82f6';
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full h-full min-h-[380px] relative flex items-center justify-center">
            {/* Background Radial Glow */}
            <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl -z-10 animate-pulse pointer-events-none"></div>
            <div className="absolute w-60 h-60 rounded-full bg-blue-600/10 blur-3xl -z-10 pointer-events-none"></div>

            {/* Interactive 3D Canvas */}
            <canvas ref={canvasRef} className="w-full h-full max-h-[480px] cursor-grab active:cursor-grabbing" />

            {/* Glassmorphism Floating Pill Badge */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Interactive 3D DNA Simulation</span>
            </div>
        </div>
    );
}

export default Interactive3DHero;
