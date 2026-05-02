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

    const earthTexture = new THREE.CanvasTexture(createEarthTexture());
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const globeGeometry = new THREE.SphereGeometry(1.72, 128, 128);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.62,
      metalness: 0.02
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    const cloudTexture = new THREE.CanvasTexture(createCloudTexture());
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.745, 96, 96),
      new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      })
    );
    globeGroup.add(clouds);

    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(1.752, 40, 40),
      new THREE.MeshBasicMaterial({
        color: 0xe8fbff,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      })
    );
    globeGroup.add(grid);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x9bd9ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide
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

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2.5, 3.4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9bd9ff, 1.35);
    rimLight.position.set(-3.2, 1.2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.AmbientLight(0xdff7f0, 0.82);
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
      earthTexture.dispose();
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

function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const ocean = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  ocean.addColorStop(0, "#0b3b82");
  ocean.addColorStop(0.5, "#0d6e9e");
  ocean.addColorStop(1, "#063764");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawLand(ctx, "#2f8f58", [
    [310, 250],
    [420, 185],
    [560, 205],
    [640, 315],
    [590, 430],
    [475, 455],
    [370, 390],
    [285, 330]
  ]);
  drawLand(ctx, "#3da263", [
    [585, 460],
    [675, 510],
    [710, 650],
    [665, 820],
    [585, 905],
    [535, 750],
    [510, 590]
  ]);
  drawLand(ctx, "#4aa96c", [
    [900, 260],
    [1030, 210],
    [1165, 265],
    [1250, 380],
    [1215, 540],
    [1065, 560],
    [940, 490],
    [850, 360]
  ]);
  drawLand(ctx, "#5bbf72", [
    [1110, 505],
    [1245, 540],
    [1325, 705],
    [1280, 880],
    [1135, 910],
    [1055, 760]
  ]);
  drawLand(ctx, "#3f9d5f", [
    [1185, 210],
    [1405, 185],
    [1605, 265],
    [1700, 410],
    [1590, 500],
    [1375, 455],
    [1230, 360]
  ]);
  drawLand(ctx, "#62b86f", [
    [1515, 620],
    [1645, 585],
    [1775, 665],
    [1825, 790],
    [1710, 860],
    [1560, 815]
  ]);
  drawLand(ctx, "#2e8354", [
    [1265, 95],
    [1420, 72],
    [1540, 120],
    [1485, 170],
    [1300, 160]
  ]);

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#d9f7ff";
  ctx.lineWidth = 1;
  for (let y = 128; y < canvas.height; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let x = 128; x < canvas.width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  return canvas;
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

function drawLand(ctx, color, points) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(217, 247, 255, 0.34)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y);
      return;
    }
    const [previousX, previousY] = points[index - 1];
    ctx.quadraticCurveTo(previousX, previousY, x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
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
