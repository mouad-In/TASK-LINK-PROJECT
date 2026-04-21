import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeDBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x0d0a1f, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0a1f);
    scene.fog = new THREE.FogExp2(0x0d0a1f, 0.008);

    const camera = new THREE.PerspectiveCamera(58, el.clientWidth / el.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 24);

    // Lights — much brighter so MeshStandardMaterial catches color
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const purpleLight = new THREE.PointLight(0xa855f7, 12, 60);
    const cyanLight   = new THREE.PointLight(0x06b6d4, 12, 60);
    const rimLight    = new THREE.PointLight(0x818cf8, 6,  40);
    rimLight.position.set(0, 12, -12);
    scene.add(purpleLight, cyanLight, rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(1, 2, 1);
    scene.add(fillLight);

    // Materials — high emissiveIntensity so shapes glow their own color
    const glowMat = (color, emissive) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 1.2,   // ← was 0.18, now full glow
        roughness: 0.18,
        metalness: 0.6,
      });

    const mPurple = glowMat(0xa855f7, 0x7c3aed);
    const mCyan   = glowMat(0x06b6d4, 0x0891b2);
    const mIndigo = glowMat(0x818cf8, 0x4f46e5);
    const mViolet = glowMat(0xc084fc, 0xa855f7);
    const mTeal   = glowMat(0x2dd4bf, 0x0d9488);
    const mBlue   = glowMat(0x38bdf8, 0x0284c7);

    const group = new THREE.Group();
    scene.add(group);
    const shapes = [];

    const addShape = (geo, mat, x, y, z, orbitR = 0, orbitSpeed = 0, orbitPhase = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { bx: x, by: y, bz: z, orbitR, orbitSpeed, orbitPhase };
      group.add(mesh);
      shapes.push(mesh);
    };

    addShape(new THREE.IcosahedronGeometry(2.0, 0), mPurple,  0,  0,  0,   0,    0,    0);
    addShape(new THREE.OctahedronGeometry(1.2),      mCyan,   5,  2, -3,  5.8, 0.38,  0);
    addShape(new THREE.OctahedronGeometry(0.85),     mViolet,-5, -2, -2,  5.8, 0.33,  Math.PI);
    addShape(new THREE.BoxGeometry(1.3, 1.3, 1.3),   mPurple,-4,  4, -5,  6.2, 0.42,  1.0);
    addShape(new THREE.BoxGeometry(1.0, 1.0, 1.0),   mTeal,   4, -4, -4,  5.3, 0.36,  3.2);
    addShape(new THREE.ConeGeometry(0.75, 1.8, 6),   mViolet, 3,  5, -6,  8.4, 0.19,  1.6);
    addShape(new THREE.ConeGeometry(0.55, 1.3, 5),   mBlue,  -3, -5, -5,  7.8, 0.21,  4.1);
    addShape(new THREE.IcosahedronGeometry(0.7, 0),  mTeal,   8,  1, -7,  9.2, 0.17,  2.6);
    addShape(new THREE.IcosahedronGeometry(0.55, 0), mBlue,  -8, -1, -6,  8.8, 0.19,  5.2);
    addShape(new THREE.TorusGeometry(0.6, 0.14, 10, 32), mIndigo, 1, 7, -6, 7.3, 0.27, 3.3);
    addShape(new THREE.OctahedronGeometry(0.65),     mCyan,  -2,  6, -7,  8.0, 0.23,  0.8);
    addShape(new THREE.BoxGeometry(0.75, 0.75, 0.75),mViolet, 7, -2, -5,  7.6, 0.31,  2.0);
    addShape(new THREE.ConeGeometry(0.45, 1.0, 4),   mPurple,-7,  2, -5,  8.2, 0.26,  4.8);

    // Large orbital torus rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.9,
      roughness: 0.18, metalness: 0.6, transparent: true, opacity: 0.75,
    });
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.9,
      roughness: 0.18, metalness: 0.6, transparent: true, opacity: 0.45,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(7, 0.15, 16, 100), ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.08, 16, 100), ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y =  Math.PI / 6;
    scene.add(ring2);

    // Wireframe shells
    const innerShell = new THREE.Mesh(
      new THREE.SphereGeometry(15, 26, 18),
      new THREE.MeshBasicMaterial({ color: 0x4338ca, wireframe: true, transparent: true, opacity: 0.08 })
    );
    group.add(innerShell);

    const outerShell = new THREE.Mesh(
      new THREE.SphereGeometry(20, 20, 14),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.04 })
    );
    group.add(outerShell);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 400;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 })
    );
    scene.add(stars);

    // Interaction
    let isDragging = false;
    let px = 0, py = 0, vx = 0, vy = 0, gx = 0, gy = 0;
    let mouseNX = 0, mouseNY = 0, targetTX = 0, targetTY = 0, curTX = 0, curTY = 0;

    const onMouseDown = (e) => { isDragging = true; px = e.clientX; py = e.clientY; vx = vy = 0; el.style.cursor = 'grabbing'; };
    const onMouseUp   = ()  => { isDragging = false; el.style.cursor = 'grab'; };
    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouseNX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseNY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      if (!isDragging) return;
      vx = (e.clientY - py) * 0.009; vy = (e.clientX - px) * 0.009;
      gx += vx; gy += vy; px = e.clientX; py = e.clientY;
    };
    const onTouchStart = (e) => { isDragging = true; px = e.touches[0].clientX; py = e.touches[0].clientY; vx = vy = 0; };
    const onTouchEnd   = ()  => { isDragging = false; };
    const onTouchMove  = (e) => {
      if (!isDragging) return;
      vx = (e.touches[0].clientY - py) * 0.009; vy = (e.touches[0].clientX - px) * 0.009;
      gx += vx; gy += vy; px = e.touches[0].clientX; py = e.touches[0].clientY;
    };
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };

    el.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mouseup',   onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('resize', onResize);

    let frameId, t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.011;

      if (!isDragging) {
        vx *= 0.96; vy *= 0.96;
        gx += vx; gy += vy;
        gy += 0.002;
      }

      targetTX = mouseNY * 0.09; targetTY = mouseNX * 0.09;
      curTX += (targetTX - curTX) * 0.045;
      curTY += (targetTY - curTY) * 0.045;
      group.rotation.x = gx + curTX;
      group.rotation.y = gy + curTY;

      ring1.rotation.z += 0.003;
      ring1.rotation.x += 0.001;
      ring2.rotation.z -= 0.002;
      ring2.rotation.y += 0.001;

      stars.rotation.y += 0.0005;
      stars.rotation.x += 0.0003;

      purpleLight.position.set(
        Math.cos(t * 0.48) * 13,
        Math.sin(t * 0.29) * 9,
        Math.sin(t * 0.48) * 13,
      );
      cyanLight.position.set(
        Math.cos(t * 0.48 + Math.PI) * 13,
        Math.cos(t * 0.29) * 9,
        Math.sin(t * 0.48 + Math.PI) * 13,
      );

      shapes.forEach((mesh, i) => {
        const { bx, by, bz, orbitR, orbitSpeed, orbitPhase } = mesh.userData;
        if (orbitR > 0) {
          const a = t * orbitSpeed + orbitPhase;
          mesh.position.x = bx * 0.18 + Math.cos(a) * orbitR;
          mesh.position.y = by * 0.18 + Math.sin(a * 0.68) * (orbitR * 0.48);
          mesh.position.z = bz + Math.sin(a) * (orbitR * 0.58);
        }
        mesh.rotation.x += 0.005 + i * 0.0009;
        mesh.rotation.y += 0.007 + i * 0.0007;
        mesh.scale.setScalar(1 + Math.sin(t * 1.1 + i * 0.85) * 0.055);
      });

      outerShell.rotation.x += 0.0007;
      outerShell.rotation.y -= 0.0005;
      innerShell.rotation.x -= 0.0004;
      innerShell.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mouseup',   onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
      el.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, cursor: 'grab' }}
    />
  );
};

export default ThreeDBackground;