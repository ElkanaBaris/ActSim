import { useRef, useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface CameraTarget {
  x: number;
  y: number;
  z: number;
}

export function useThreeScene() {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ phi: Math.PI / 4, theta: Math.PI / 4 });
  const cameraDistanceRef = useRef(120);
  const [isInitialized, setIsInitialized] = useState(false);

  const initScene = useCallback((canvas: HTMLCanvasElement) => {
    if (sceneRef.current) return { scene: sceneRef.current, camera: cameraRef.current!, renderer: rendererRef.current! };

    // Create scene with enhanced atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5DEB3); // Sandy desert atmosphere
    scene.fog = new THREE.Fog(0xF5DEB3, 100, 500);

    // Create true first-person POV camera (immersive FPS style)
    const camera = new THREE.PerspectiveCamera(
      75, // Standard FPS FOV
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    
    // Set initial first-person position
    camera.position.set(0, 1.7, 0); // Eye level height
    camera.lookAt(0, 1.7, -10);

    // Create high-quality renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Realistic Middle Eastern daylight
    const ambientLight = new THREE.AmbientLight(0xFFF8DC, 0.6);
    scene.add(ambientLight);

    // Harsh desert sun
    const sunLight = new THREE.DirectionalLight(0xFFFAF0, 3.0);
    sunLight.position.set(100, 200, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 400;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    // Create detailed Middle Eastern environment
    createRealisticEnvironment(scene);

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Setup controls; render loop started separately
    setupAdvancedControls(canvas, camera);

    setIsInitialized(true);

    return { scene, camera, renderer };
  }, []);

  const updateCameraRotation = (camera: THREE.PerspectiveCamera) => {
    const { phi, theta } = cameraRotationRef.current;
    
    // First-person camera stays at eye level, only rotates
    const direction = new THREE.Vector3();
    direction.x = Math.sin(phi) * Math.cos(theta);
    direction.y = -Math.cos(phi);
    direction.z = Math.sin(phi) * Math.sin(theta);
    
    const target = new THREE.Vector3().addVectors(camera.position, direction);
    camera.lookAt(target);
  };

  const createRealisticEnvironment = (scene: THREE.Scene) => {
    // Realistic desert ground
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xE5C29F // Sandy color
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Main compound based on reference images
    createRealisticCompound(scene);
    
    // Surrounding urban environment
    createUrbanEnvironment(scene);
  };

  const createRealisticCompound = (scene: THREE.Scene) => {
    // Realistic Middle Eastern compound walls - weathered concrete
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xC4A069 }); // Sandy concrete color
    const wallHeight = 12;
    const compoundSize = 80;
    
    // Create detailed compound walls with realistic proportions
    const walls = [
      { pos: [0, wallHeight/2, -compoundSize/2], size: [compoundSize, wallHeight, 2] }, // North
      { pos: [0, wallHeight/2, compoundSize/2], size: [compoundSize, wallHeight, 2] }, // South
      { pos: [-compoundSize/2, wallHeight/2, 0], size: [2, wallHeight, compoundSize] }, // West
      { pos: [compoundSize/2, wallHeight/2, 0], size: [2, wallHeight, compoundSize] } // East
    ];
    
    walls.forEach(wall => {
      const geometry = new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]);
      const mesh = new THREE.Mesh(geometry, wallMaterial);
      mesh.position.set(wall.pos[0], wall.pos[1], wall.pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Main central building - multi-story with realistic Middle Eastern architecture
    const mainBuildingMaterial = new THREE.MeshLambertMaterial({ color: 0xB8956D });
    
    // Ground floor
    const groundFloor = new THREE.BoxGeometry(35, 15, 35);
    const groundFloorMesh = new THREE.Mesh(groundFloor, mainBuildingMaterial);
    groundFloorMesh.position.set(0, 7.5, 0);
    groundFloorMesh.castShadow = true;
    groundFloorMesh.receiveShadow = true;
    scene.add(groundFloorMesh);
    
    // Second floor (smaller)
    const secondFloor = new THREE.BoxGeometry(30, 12, 30);
    const secondFloorMesh = new THREE.Mesh(secondFloor, mainBuildingMaterial);
    secondFloorMesh.position.set(0, 21, 0);
    secondFloorMesh.castShadow = true;
    scene.add(secondFloorMesh);
    
    // Flat roof typical of Middle Eastern architecture
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xA0926B });
    const roof = new THREE.BoxGeometry(37, 1, 37);
    const roofMesh = new THREE.Mesh(roof, roofMaterial);
    roofMesh.position.set(0, 27.5, 0);
    roofMesh.castShadow = true;
    scene.add(roofMesh);

    // Secondary buildings in compound - varied heights and sizes
    const buildingData = [
      { pos: [-25, 0, -25], size: [15, 18, 20], color: 0xA88B5A },
      { pos: [25, 0, -25], size: [12, 14, 15], color: 0xB5945C },
      { pos: [-25, 0, 25], size: [18, 16, 18], color: 0xAA8D58 },
      { pos: [20, 0, 20], size: [14, 12, 16], color: 0xB8956D }
    ];
    
    buildingData.forEach(building => {
      const geometry = new THREE.BoxGeometry(building.size[0], building.size[1], building.size[2]);
      const material = new THREE.MeshLambertMaterial({ color: building.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(building.pos[0], building.size[1]/2, building.pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      
      // Add flat roofs
      const roofGeom = new THREE.BoxGeometry(building.size[0] + 1, 0.5, building.size[2] + 1);
      const roofMesh = new THREE.Mesh(roofGeom, roofMaterial);
      roofMesh.position.set(building.pos[0], building.size[1] + 0.25, building.pos[2]);
      scene.add(roofMesh);
    });

    // Realistic details: doors, windows, architectural elements
    createArchitecturalDetails(scene);
  };

  const createArchitecturalDetails = (scene: THREE.Scene) => {
    // Door frames and entrances
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const doorGeometry = new THREE.BoxGeometry(3, 8, 0.5);
    
    // Main building entrance
    const mainDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    mainDoor.position.set(0, 4, 17.75);
    mainDoor.castShadow = true;
    scene.add(mainDoor);
    
    // Windows (dark openings)
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x2C2C2C });
    const windowGeometry = new THREE.BoxGeometry(2, 2, 0.3);
    
    // Add windows to main building
    const windowPositions = [
      [-8, 6, 17.65], [8, 6, 17.65], [0, 18, 17.65],
      [-12, 6, 17.65], [12, 6, 17.65]
    ];
    
    windowPositions.forEach(pos => {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(pos[0], pos[1], pos[2]);
      scene.add(window);
    });

    // Add some debris and realistic ground clutter
    for (let i = 0; i < 15; i++) {
      const debrisGeometry = new THREE.BoxGeometry(
        0.5 + Math.random() * 2,
        0.2 + Math.random() * 0.8,
        0.5 + Math.random() * 2
      );
      const debrisMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.1, 0.3, 0.2 + Math.random() * 0.3) 
      });
      const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
      debris.position.set(
        (Math.random() - 0.5) * 160,
        debrisGeometry.parameters.height / 2,
        (Math.random() - 0.5) * 160
      );
      debris.rotation.y = Math.random() * Math.PI;
      debris.castShadow = true;
      debris.receiveShadow = true;
      scene.add(debris);
    }
  };

  const createUrbanEnvironment = (scene: THREE.Scene) => {
    // Surrounding city blocks at various distances
    const cityBlockPositions = [
      [-200, 0, -200], [200, 0, -200], [-200, 0, 200], [200, 0, 200],
      [-300, 0, 0], [300, 0, 0], [0, 0, -300], [0, 0, 300],
      [-150, 0, -100], [150, 0, 100], [-100, 0, 150], [100, 0, -150]
    ];
    
    cityBlockPositions.forEach(pos => {
      const blockSize = 30 + Math.random() * 40;
      const blockHeight = 20 + Math.random() * 60;
      
      const buildingGeometry = new THREE.BoxGeometry(blockSize, blockHeight, blockSize);
      const buildingMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.1, 0.2, 0.3 + Math.random() * 0.3) 
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(pos[0], blockHeight/2, pos[2]);
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);
    });

    // Street network
    const streetMaterial = new THREE.MeshLambertMaterial({ color: 0x2A2A2A });
    
    // Main roads
    for (let i = -2; i <= 2; i++) {
      const streetH = new THREE.PlaneGeometry(800, 12);
      const streetHMesh = new THREE.Mesh(streetH, streetMaterial);
      streetHMesh.rotation.x = -Math.PI / 2;
      streetHMesh.position.set(0, 0.1, i * 120);
      streetHMesh.receiveShadow = true;
      scene.add(streetHMesh);

      const streetV = new THREE.PlaneGeometry(12, 800);
      const streetVMesh = new THREE.Mesh(streetV, streetMaterial);
      streetVMesh.rotation.x = -Math.PI / 2;
      streetVMesh.position.set(i * 120, 0.1, 0);
      streetVMesh.receiveShadow = true;
      scene.add(streetVMesh);
    }
  };

  const createNaturalElements = (scene: THREE.Scene) => {
    // Enhanced palm trees
    for (let i = 0; i < 15; i++) {
      const trunkGeometry = new THREE.CylinderGeometry(1.5, 2.5, 18);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      
      const leavesGeometry = new THREE.SphereGeometry(8, 8, 6);
      const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      
      const angle = (i / 15) * Math.PI * 2;
      const radius = 180 + Math.random() * 100;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      trunk.position.set(x, 9, z);
      leaves.position.set(x, 20, z);
      leaves.scale.set(1, 0.6, 1);
      
      trunk.castShadow = true;
      leaves.castShadow = true;
      
      scene.add(trunk);
      scene.add(leaves);
    }

    // Desert rocks and environmental details
    for (let i = 0; i < 25; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(3 + Math.random() * 5);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      rock.position.set(
        (Math.random() - 0.5) * 600,
        2,
        (Math.random() - 0.5) * 600
      );
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }
  };

  const createMilitaryAssets = (scene: THREE.Scene) => {
    // Military vehicles outside compound
    const vehiclePositions = [
      [180, 0, 60], [-160, 0, -80], [220, 0, -40]
    ];
    
    vehiclePositions.forEach(pos => {
      // Vehicle body
      const vehicleBody = new THREE.BoxGeometry(12, 4, 6);
      const vehicleMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
      const vehicle = new THREE.Mesh(vehicleBody, vehicleMaterial);
      vehicle.position.set(pos[0], 2, pos[2]);
      vehicle.castShadow = true;
      scene.add(vehicle);
      
      // Vehicle wheels
      const wheelGeometry = new THREE.CylinderGeometry(1.5, 1.5, 1);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1C1C1C });
      
      const wheelPositions = [
        [pos[0] + 4, 1.5, pos[2] + 2.5],
        [pos[0] - 4, 1.5, pos[2] + 2.5],
        [pos[0] + 4, 1.5, pos[2] - 2.5],
        [pos[0] - 4, 1.5, pos[2] - 2.5]
      ];
      
      wheelPositions.forEach(wheelPos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(wheelPos[0], wheelPos[1], wheelPos[2]);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        scene.add(wheel);
      });
    });

    // Barriers and obstacles
    for (let i = 0; i < 8; i++) {
      const barrierGeometry = new THREE.BoxGeometry(8, 1.5, 0.5);
      const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6347 });
      const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
      
      const angle = (i / 8) * Math.PI * 2;
      const radius = 140;
      barrier.position.set(
        Math.cos(angle) * radius,
        0.75,
        Math.sin(angle) * radius
      );
      barrier.rotation.y = angle;
      barrier.castShadow = true;
      scene.add(barrier);
    }
  };

  const setupAdvancedControls = (canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera) => {
    let yaw = 0;
    let pitch = 0;
    
    const handleMouseDown = (event: MouseEvent) => {
      mouseRef.current.isDown = true;
      lastMouseRef.current = { x: event.clientX, y: event.clientY };
      canvas.style.cursor = 'crosshair';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current.isDown) return;

      const deltaX = event.clientX - lastMouseRef.current.x;
      const deltaY = event.clientY - lastMouseRef.current.y;

      // FPS-style mouse look
      yaw -= deltaX * 0.002;
      pitch -= deltaY * 0.002;
      
      // Clamp pitch to prevent over-rotation
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
      
      // Update camera rotation
      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
      
      lastMouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
      canvas.style.cursor = 'crosshair';
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      // Zoom by changing FOV instead of distance (more realistic)
      const currentFov = camera.fov;
      camera.fov = Math.max(30, Math.min(120, currentFov + event.deltaY * 0.1));
      camera.updateProjectionMatrix();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    canvas.style.cursor = 'crosshair';
  };

  const startRenderLoop = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };

    animate();
  }, []);

  const setCameraPosition = useCallback((position: CameraPosition, target: CameraTarget) => {
    if (cameraRef.current) {
      // Set camera position directly for first-person view
      cameraRef.current.position.set(position.x, position.y, position.z);
      cameraRef.current.lookAt(target.x, target.y, target.z);
    }
  }, []);

  const updateAspectRatio = useCallback((width: number, height: number) => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }
  }, []);

  const render = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    initScene,
    setCameraPosition,
    startRenderLoop,
    isInitialized,
    render,
    updateAspectRatio
  };
}