import { useEffect, useRef } from "react";
import * as THREE from "three";

const riskColors = {
  Low: 0x10b981,
  Medium: 0xf59e0b,
  High: 0xef4444
};

export function TravelGlobe({ countries, selectedCountryCode, onSelectCountry }) {
  const mountRef = useRef(null);
  const selectedCountryRef = useRef(selectedCountryCode);
  const onSelectCountryRef = useRef(onSelectCountry);

  useEffect(() => {
    selectedCountryRef.current = selectedCountryCode;
    onSelectCountryRef.current = onSelectCountry;
  }, [onSelectCountry, selectedCountryCode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.65, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroup.rotation.x = -0.18;

    const globeGeometry = new THREE.SphereGeometry(1.72, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Obsidian
      roughness: 0.7,
      metalness: 0.2
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    const cloudTexture = new THREE.CanvasTexture(createCloudTexture());
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.745, 64, 64),
      new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    globeGroup.add(clouds);

    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(1.722, 36, 36),
      new THREE.MeshBasicMaterial({
        color: 0x3f3f46, // Graphite
        wireframe: true,
        transparent: true,
        opacity: 0.25
      })
    );
    globeGroup.add(grid);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x52525b, // Slate
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    );
    globeGroup.add(atmosphere);

    const markerGeometry = new THREE.SphereGeometry(0.045, 18, 18);
    const ringGeometry = new THREE.RingGeometry(0.07, 0.092, 28);
    const markers = [];
    const rings = [];

    countries.forEach((country) => {
      const color = riskColors[country.level] || riskColors.Medium;
      const position = latLonToVector3(country.lat, country.lon, 1.86);
      const marker = new THREE.Mesh(
        markerGeometry,
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.24
        })
      );
      marker.position.copy(position);
      marker.userData = country;
      globeGroup.add(marker);
      markers.push(marker);

      const pulse = new THREE.Mesh(
        ringGeometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.36,
          side: THREE.DoubleSide
        })
      );
      pulse.position.copy(position);
      pulse.lookAt(0, 0, 0);
      pulse.userData = country;
      globeGroup.add(pulse);
      rings.push(pulse);
    });

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(2.5, 3.4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-3.2, 1.2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(fillLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragState = {
      active: false,
      moved: false,
      startX: 0,
      startY: 0,
      rotationX: globeGroup.rotation.x,
      rotationY: globeGroup.rotation.y
    };

    const setPointerFromEvent = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickMarker = (event) => {
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([...markers, ...rings], false)[0];
      return hit?.object?.userData;
    };

    const handlePointerDown = (event) => {
      dragState.active = true;
      dragState.moved = false;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.rotationX = globeGroup.rotation.x;
      dragState.rotationY = globeGroup.rotation.y;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
      const hovered = pickMarker(event);
      renderer.domElement.style.cursor = hovered ? "pointer" : dragState.active ? "grabbing" : "grab";

      if (!dragState.active) return;

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
        dragState.moved = true;
      }
      globeGroup.rotation.y = dragState.rotationY + deltaX * 0.006;
      globeGroup.rotation.x = THREE.MathUtils.clamp(dragState.rotationX + deltaY * 0.004, -0.85, 0.65);
    };

    const handlePointerUp = (event) => {
      if (!dragState.moved) {
        const country = pickMarker(event);
        if (country) {
          onSelectCountryRef.current?.(country.code);
        }
      }
      dragState.active = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    const handlePointerLeave = () => {
      renderer.domElement.style.cursor = "grab";
      dragState.active = false;
    };
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);

    let frameId;
    const animate = () => {
      if (!dragState.active) {
        globeGroup.rotation.y += 0.0022;
      }
      clouds.rotation.y += 0.0009;
      markers.forEach((marker) => {
        const selected = marker.userData.code === selectedCountryRef.current;
        marker.scale.setScalar(selected ? 1.75 : 1);
      });
      rings.forEach((ring) => {
        const selected = ring.userData.code === selectedCountryRef.current;
        ring.scale.setScalar(selected ? 1.45 : 1);
        ring.material.opacity = selected ? 0.72 : 0.34;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.dispose();
      cloudTexture.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      markerGeometry.dispose();
      ringGeometry.dispose();
      globeGroup.traverse((object) => {
        if (object.material && object.material !== globeMaterial) {
          object.material.dispose();
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, [countries]);

  return <div className="globe-canvas" ref={mountRef} aria-label="3D Earth globe with travel safety markers" />;
}



function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.42)";

  for (let i = 0; i < 48; i += 1) {
    const seed = seededRandom(i + 12);
    const x = seed * canvas.width;
    const y = seededRandom(i + 48) * canvas.height;
    const width = 70 + seededRandom(i + 84) * 160;
    const height = 16 + seededRandom(i + 120) * 42;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, seededRandom(i + 156) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

function seededRandom(seed) {
  const value = Math.sin(seed * 999) * 10000;
  return value - Math.floor(value);
}



function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
