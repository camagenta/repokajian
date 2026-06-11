"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

function getCssColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

    const root = new THREE.Group();
    scene.add(root);

    const clay = new THREE.Color(getCssColor("--clay", "#D97757"));
    const olive = new THREE.Color(getCssColor("--olive", "#788C5D"));
    const slate = new THREE.Color(getCssColor("--slate", "#141413"));

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: clay,
      transparent: true,
      opacity: 0.32,
      wireframe: true,
    });
    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1.35, 0.045, 160, 12, 2, 5), ringMaterial);
    torus.rotation.set(0.6, -0.25, 0.1);
    root.add(torus);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: olive,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
    });
    const halo = new THREE.Mesh(new THREE.IcosahedronGeometry(2.25, 2), haloMaterial);
    root.add(halo);

    const nodeCount = 92;
    const positions = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i += 1) {
      const radius = 1.15 + Math.random() * 1.75;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const nodeMaterial = new THREE.PointsMaterial({
      color: slate,
      size: 0.035,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    });
    root.add(new THREE.Points(nodeGeometry, nodeMaterial));

    const linePositions: number[] = [];
    for (let i = 0; i < nodeCount; i += 1) {
      for (let j = i + 1; j < nodeCount; j += 1) {
        const ax = positions[i * 3];
        const ay = positions[i * 3 + 1];
        const az = positions[i * 3 + 2];
        const bx = positions[j * 3];
        const by = positions[j * 3 + 1];
        const bz = positions[j * 3 + 2];
        const distance = Math.hypot(ax - bx, ay - by, az - bz);
        if (distance < 0.74 && linePositions.length < 840) {
          linePositions.push(ax, ay, az, bx, by, bz);
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: clay,
      transparent: true,
      opacity: 0.12,
    });
    root.add(new THREE.LineSegments(lineGeometry, lineMaterial));

    const resize = () => {
      const { width, height } = parent.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    const refreshColors = () => {
      ringMaterial.color.set(getCssColor("--clay", "#D97757"));
      haloMaterial.color.set(getCssColor("--olive", "#788C5D"));
      nodeMaterial.color.set(getCssColor("--slate", "#141413"));
      lineMaterial.color.set(getCssColor("--clay", "#D97757"));
      renderer.render(scene, camera);
    };
    window.addEventListener("kajian:themechange", refreshColors);

    gsap.fromTo(
      root.scale,
      { x: 0.78, y: 0.78, z: 0.78 },
      { x: 1, y: 1, z: 1, duration: 1.4, ease: "expo.out" },
    );
    gsap.fromTo(
      [ringMaterial, haloMaterial, nodeMaterial, lineMaterial],
      { opacity: 0 },
      { opacity: (index) => [0.32, 0.16, 0.36, 0.12][index], duration: 1.1, stagger: 0.08, ease: "power2.out" },
    );

    const render = () => {
      if (!reducedMotion) {
        const t = performance.now() * 0.001;
        root.rotation.y = t * 0.13;
        root.rotation.x = Math.sin(t * 0.45) * 0.08;
        torus.rotation.z = t * 0.18;
        halo.rotation.z = -t * 0.08;
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(render);
    render();

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("kajian:themechange", refreshColors);
      observer.disconnect();
      lineGeometry.dispose();
      nodeGeometry.dispose();
      torus.geometry.dispose();
      halo.geometry.dispose();
      ringMaterial.dispose();
      haloMaterial.dispose();
      nodeMaterial.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-130px] top-[-34px] hidden h-[430px] w-[560px] opacity-90 md:block lg:right-[-40px] lg:top-[-18px]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,transparent_0%,transparent_44%,var(--ivory)_76%)]" />
    </div>
  );
}
