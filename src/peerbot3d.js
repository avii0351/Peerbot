import * as THREE from 'three';
import { SoundFX } from './sound.js';

export class Peerbot3DViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      autoRotate: true,
      rotationSpeed: 0.003
    }, options);

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 };
    this.modelRotation = { x: 0.08, y: 0.35 };
    this.isWireframe = false;
    this.mouseCoords = { x: 0, y: 0 };
    this.autoRotate = this.options.autoRotate;

    // Eye expression state
    this.currentExpression = 'idle'; // 'idle', 'happy', 'listening', 'speaking', 'wink'
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.speakingPulse = 0;

    this.initScene();
    this.initOLEDCanvas();
    this.createNakedPeerbotModel();
    this.initEventListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    this.camera.position.set(0, 0.1, 7.8);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // Warm studio lighting setup
    const ambientLight = new THREE.AmbientLight(0xfffaf0, 1.3);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 7, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f4ff, 1.2);
    fillLight.position.set(-6, 3, 4);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    rimLight.position.set(0, -4, -6);
    this.scene.add(rimLight);

    // Soft studio floor shadow
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    this.groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.groundShadow.rotation.x = -Math.PI / 2;
    this.groundShadow.position.y = -1.6;
    this.groundShadow.receiveShadow = true;
    this.scene.add(this.groundShadow);

    // Subtle Spatial Depth Floor Rings
    const ringGroup = new THREE.Group();
    const ringGeo1 = new THREE.RingGeometry(1.65, 1.665, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2350C9,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = -1.58;
    ringGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.1, 2.115, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xE8A317,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = -1.58;
    ringGroup.add(ring2);

    // 4 cardinal spatial ticks
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const tickGeo = new THREE.PlaneGeometry(0.02, 0.22);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0x2350C9, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.rotation.x = -Math.PI / 2;
      tick.rotation.z = angle;
      tick.position.set(Math.cos(angle) * 1.65, -1.58, Math.sin(angle) * 1.65);
      ringGroup.add(tick);
    }
    this.scene.add(ringGroup);

    // Master group
    this.peerbotGroup = new THREE.Group();
    this.scene.add(this.peerbotGroup);
  }

  // Dynamic OLED eye matrix texture
  initOLEDCanvas() {
    this.oledCanvas = document.createElement('canvas');
    this.oledCanvas.width = 512;
    this.oledCanvas.height = 256;
    this.oledCtx = this.oledCanvas.getContext('2d');

    this.oledTexture = new THREE.CanvasTexture(this.oledCanvas);
    this.oledTexture.generateMipmaps = false;
    this.oledTexture.minFilter = THREE.LinearFilter;
    this.oledTexture.magFilter = THREE.LinearFilter;

    this.renderOLED();
  }

  renderOLED() {
    const ctx = this.oledCtx;
    const w = 512;
    const h = 256;

    // True OLED black
    ctx.fillStyle = '#060a0e';
    ctx.fillRect(0, 0, w, h);

    const eyeCyan = '#00F0FF';
    ctx.save();
    ctx.shadowColor = eyeCyan;
    ctx.shadowBlur = 18;

    const leftCenter = { x: 170, y: 128 };
    const rightCenter = { x: 342, y: 128 };

    const offsetX = Math.max(-18, Math.min(18, this.mouseCoords.x * 22));
    const offsetY = Math.max(-14, Math.min(14, this.mouseCoords.y * 18));

    if (this.currentExpression === 'happy') {
      this.drawHappyEye(ctx, leftCenter.x, leftCenter.y, eyeCyan);
      this.drawHappyEye(ctx, rightCenter.x, rightCenter.y, eyeCyan);
    } else if (this.currentExpression === 'wink') {
      this.drawHappyEye(ctx, leftCenter.x, leftCenter.y, eyeCyan);
      this.drawMatrixEye(ctx, rightCenter.x + offsetX, rightCenter.y + offsetY, 42, eyeCyan, false);
    } else if (this.currentExpression === 'listening') {
      this.drawListeningWaves(ctx, w, h, eyeCyan);
    } else {
      const scaleY = this.isBlinking ? 0.08 : (this.currentExpression === 'speaking' ? (1 + Math.sin(this.speakingPulse) * 0.15) : 1);
      const radius = 42 * (this.currentExpression === 'speaking' ? (1 + Math.sin(this.speakingPulse * 1.5) * 0.08) : 1);

      this.drawMatrixEye(ctx, leftCenter.x + offsetX, leftCenter.y + offsetY, radius, eyeCyan, scaleY < 0.2);
      this.drawMatrixEye(ctx, rightCenter.x + offsetX, rightCenter.y + offsetY, radius, eyeCyan, scaleY < 0.2);
    }

    ctx.restore();
    this.oledTexture.needsUpdate = true;
  }

  drawMatrixEye(ctx, cx, cy, radius, color, isClosed) {
    if (isClosed) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(cx - 36, cy - 4, 72, 8, 4);
      ctx.fill();
      return;
    }

    const dotSize = 3.6;
    const spacing = 7.5;
    const count = 10;

    for (let ix = -count; ix <= count; ix++) {
      for (let iy = -count; iy <= count; iy++) {
        const dx = ix * spacing;
        const dy = iy * spacing;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const inPupil = dist <= radius;
        const isHighlight = (ix >= 1 && ix <= 3 && iy >= -4 && iy <= -2);

        if (inPupil && !isHighlight) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (isHighlight) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, dotSize * 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  drawHappyEye(ctx, cx, cy, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + 18, 42, Math.PI * 1.15, Math.PI * 1.85, false);
    ctx.stroke();
  }

  drawListeningWaves(ctx, w, h, color) {
    const time = Date.now() * 0.008;
    const barCount = 14;
    const barWidth = 12;
    const spacing = 18;
    const totalWidth = barCount * spacing;
    const startX = (w - totalWidth) / 2;

    ctx.fillStyle = color;
    for (let i = 0; i < barCount; i++) {
      const height = Math.abs(Math.sin(time + i * 0.5)) * 90 + 20;
      const x = startX + i * spacing;
      const y = (h - height) / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, height, 6);
      ctx.fill();
    }
  }

  // Create the transparent naked engineering prototype with internal boards, chips & wiring
  createNakedPeerbotModel() {
    this.materials = {
      // Clear smoked transparent polycarbonate chassis
      clearShell: new THREE.MeshPhysicalMaterial({
        color: 0xf0f4f8,
        transparent: true,
        opacity: 0.28,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        depthWrite: false
      }),
      // Smoked transparent front visor
      smokedVisor: new THREE.MeshPhysicalMaterial({
        color: 0x05070a,
        transparent: true,
        opacity: 0.35,
        roughness: 0.08,
        clearcoat: 1.0,
        depthWrite: false
      }),
      // Dark anodized aluminum internal chassis brackets
      chassisBracket: new THREE.MeshStandardMaterial({
        color: 0x333940,
        roughness: 0.35,
        metalness: 0.75
      }),
      // Matte black PCB substrate
      pcbBlack: new THREE.MeshStandardMaterial({
        color: 0x141816,
        roughness: 0.4,
        metalness: 0.25
      }),
      // Blue breakout PCB (MAX98357A amp)
      pcbBlue: new THREE.MeshStandardMaterial({
        color: 0x1a3d6d,
        roughness: 0.35,
        metalness: 0.3
      }),
      // ENIG Gold contacts & trace pads
      goldPads: new THREE.MeshStandardMaterial({
        color: 0xdfb15b,
        roughness: 0.25,
        metalness: 0.95
      }),
      // Silver metal RF shields & USB-C shell
      silverMetal: new THREE.MeshStandardMaterial({
        color: 0xd8dde4,
        roughness: 0.2,
        metalness: 0.9
      }),
      // Brushed copper capacitive touch disc
      copperTouch: new THREE.MeshStandardMaterial({
        color: 0xd47a46,
        roughness: 0.25,
        metalness: 0.85
      }),
      // Speaker neodymium magnet & voice coil
      speakerMagnet: new THREE.MeshStandardMaterial({
        color: 0x24282c,
        roughness: 0.3,
        metalness: 0.8
      }),
      speakerCone: new THREE.MeshStandardMaterial({
        color: 0x484e55,
        roughness: 0.7,
        metalness: 0.1
      }),
      // Camera lens glass & barrel
      cameraLens: new THREE.MeshStandardMaterial({
        color: 0x0d1117,
        roughness: 0.1,
        metalness: 0.85
      }),
      cameraGlass: new THREE.MeshPhysicalMaterial({
        color: 0x00f0ff,
        roughness: 0.0,
        transmission: 0.8,
        thickness: 0.3
      }),
      // OLED emissive surface
      oledScreen: new THREE.MeshBasicMaterial({
        map: this.oledTexture,
        toneMapped: false,
        transparent: true
      }),
      // Copper traces & brass standoffs
      brassStandoff: new THREE.MeshStandardMaterial({
        color: 0xc89d42,
        roughness: 0.3,
        metalness: 0.9
      }),
      // Silicone rubber feet
      rubber: new THREE.MeshStandardMaterial({
        color: 0x1c1e21,
        roughness: 0.9
      }),
      // Wire materials:
      wireRed: new THREE.MeshStandardMaterial({ color: 0xdd3838, roughness: 0.5 }),   // VCC 3.3V
      wireBlack: new THREE.MeshStandardMaterial({ color: 0x222426, roughness: 0.5 }), // GND
      wireYellow: new THREE.MeshStandardMaterial({ color: 0xf5b041, roughness: 0.5 }),// I2C SCL
      wireGreen: new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.5 }), // I2C SDA
      wireBlue: new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.5 }),  // I2S Data
      wireOrange: new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.5 }) // GPIO 2 Touch
    };

    const g = this.peerbotGroup;

    // 1. Transparent Clear Enclosure (Naked Polycarbonate Chassis)
    const shellGeo = new THREE.BoxGeometry(2.35, 2.2, 1.45);
    const shellMesh = new THREE.Mesh(shellGeo, this.materials.clearShell);
    shellMesh.renderOrder = 10;
    g.add(shellMesh);

    // Front Visor Tint Section
    const visorGeo = new THREE.BoxGeometry(1.95, 0.92, 0.1);
    const visorMesh = new THREE.Mesh(visorGeo, this.materials.smokedVisor);
    visorMesh.position.set(0, 0.42, 0.72);
    visorMesh.renderOrder = 9;
    g.add(visorMesh);

    // Internal Metal Standoffs (4 corners holding structure)
    const standoffCoords = [
      [-0.95, 0.85, 0.4], [0.95, 0.85, 0.4],
      [-0.95, -0.85, 0.4], [0.95, -0.85, 0.4],
      [-0.95, 0.85, -0.4], [0.95, 0.85, -0.4],
      [-0.95, -0.85, -0.4], [0.95, -0.85, -0.4]
    ];
    standoffCoords.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12), this.materials.brassStandoff);
      post.position.set(x, y, z);
      g.add(post);
    });

    // 2. Seeed Studio XIAO ESP32-S3 Sense Mainboard (Mounted at Center-Back)
    const xaoGroup = new THREE.Group();
    xaoGroup.position.set(0, 0.05, -0.15);

    // Mainboard PCB
    const pcbGeo = new THREE.BoxGeometry(1.5, 1.1, 0.06);
    const pcbMesh = new THREE.Mesh(pcbGeo, this.materials.pcbBlack);
    xaoGroup.add(pcbMesh);

    // Gold Castellated Edge Pads on left & right
    for (let i = -5; i <= 5; i++) {
      const pinL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.08), this.materials.goldPads);
      pinL.position.set(-0.72, i * 0.085, 0);
      const pinR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.08), this.materials.goldPads);
      pinR.position.set(0.72, i * 0.085, 0);
      xaoGroup.add(pinL);
      xaoGroup.add(pinR);
    }

    // Metal RF Shield with "ESP32-S3" engraving look
    const rfShield = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.1), this.materials.silverMetal);
    rfShield.position.set(-0.15, 0.08, 0.07);
    xaoGroup.add(rfShield);

    // Gold serpentine Wi-Fi antenna trace
    const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.02), this.materials.goldPads);
    antenna.position.set(0.48, 0.12, 0.04);
    xaoGroup.add(antenna);

    // USB-C Receptacle on bottom
    const usb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.3), this.materials.silverMetal);
    usb.position.set(0, -0.56, 0.05);
    xaoGroup.add(usb);

    // OPI PSRAM chip
    const psram = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.06), this.materials.chassisBracket);
    psram.position.set(-0.15, -0.32, 0.05);
    xaoGroup.add(psram);

    g.add(xaoGroup);

    // 3. 1.3" OLED Display Module (Mounted at Upper Front)
    const oledGroup = new THREE.Group();
    oledGroup.position.set(0, 0.42, 0.58);

    const oledPcb = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.85, 0.04), this.materials.pcbBlack);
    oledGroup.add(oledPcb);

    // Glowing OLED Screen face
    const oledScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.76, 0.76), this.materials.oledScreen);
    oledScreen.position.z = 0.03;
    oledScreen.renderOrder = 2;
    oledGroup.add(oledScreen);

    // Display driver ribbon flex cable extending down
    const oledRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.02), this.materials.copperTouch);
    oledRibbon.position.set(0, -0.48, -0.05);
    oledGroup.add(oledRibbon);

    g.add(oledGroup);

    // 4. OV2640 HD Camera Sensor Module (Centered above OLED)
    const camGroup = new THREE.Group();
    camGroup.position.set(0, 0.82, 0.62);

    const camSensorPcb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.06), this.materials.pcbBlack);
    camGroup.add(camSensorPcb);

    const camBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 24), this.materials.cameraLens);
    camBarrel.rotateX(Math.PI / 2);
    camBarrel.position.z = 0.07;
    camGroup.add(camBarrel);

    const camGlass = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), this.materials.cameraGlass);
    camGlass.position.z = 0.12;
    camGlass.scale.set(1, 1, 0.3);
    camGroup.add(camGlass);

    // Gold flex cable linking camera to ESP32
    this.createRibbonCable(
      new THREE.Vector3(0, 0.82, 0.58),
      new THREE.Vector3(0, 0.35, -0.1),
      0.18,
      this.materials.copperTouch
    );

    g.add(camGroup);

    // 5. Capacitive Touch Button Sensor Disc (GPIO 2, Front Center)
    const touchGroup = new THREE.Group();
    touchGroup.position.set(0, -0.16, 0.72);

    const touchDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 32), this.materials.copperTouch);
    touchDisc.rotateX(Math.PI / 2);
    touchGroup.add(touchDisc);

    // Subtle brushed inner ring
    const touchInner = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.045, 32), this.materials.silverMetal);
    touchInner.rotateX(Math.PI / 2);
    touchGroup.add(touchInner);

    g.add(touchGroup);

    // 6. MAX98357A I2S Class-D Amplifier Breakout Board (Mounted Lower-Mid)
    const ampGroup = new THREE.Group();
    ampGroup.position.set(-0.55, -0.52, 0.1);

    const ampPcb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 0.04), this.materials.pcbBlue);
    ampGroup.add(ampPcb);

    // Amp chip & filter inductors
    const ampChip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.05), this.materials.chassisBracket);
    ampChip.position.set(0, 0.04, 0.04);
    ampGroup.add(ampChip);

    const inductorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.06), this.materials.chassisBracket);
    inductorL.position.set(-0.16, -0.12, 0.04);
    ampGroup.add(inductorL);

    const inductorR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.06), this.materials.chassisBracket);
    inductorR.position.set(0.16, -0.12, 0.04);
    ampGroup.add(inductorR);

    g.add(ampGroup);

    // 7. Speaker Transducer & Neodymium Driver Assembly (Bottom)
    const speakerGroup = new THREE.Group();
    speakerGroup.position.set(0.3, -0.65, 0.25);

    // Neodymium magnet backplate
    const magnet = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.18, 32), this.materials.speakerMagnet);
    magnet.rotateX(Math.PI / 2);
    speakerGroup.add(magnet);

    // Copper voice coil collar
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 24), this.materials.copperTouch);
    coil.rotateX(Math.PI / 2);
    coil.position.z = 0.08;
    speakerGroup.add(coil);

    // Speaker diaphragm cone
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.18, 32, 1, true), this.materials.speakerCone);
    cone.rotateX(-Math.PI / 2);
    cone.position.z = 0.16;
    speakerGroup.add(cone);

    g.add(speakerGroup);

    // 8. 4 Bottom Silicone Non-Skid Feet
    const feetPositions = [
      [-0.85, -1.12, 0.45], [0.85, -1.12, 0.45],
      [-0.85, -1.12, -0.45], [0.85, -1.12, -0.45]
    ];
    feetPositions.forEach(([x, y, z]) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 16), this.materials.rubber);
      foot.position.set(x, y, z);
      g.add(foot);
    });

    // 9. REALISTIC 3D WIRING HARNESSES (Colored jumper wires linking boards)
    // Wire 1: 3.3V Power (Red) from ESP32 to OLED
    this.createJumperWire(
      new THREE.Vector3(-0.7, 0.25, -0.15),
      new THREE.Vector3(-0.8, 0.35, 0.2),
      new THREE.Vector3(-0.7, 0.42, 0.55),
      this.materials.wireRed
    );

    // Wire 2: Ground (Black) from ESP32 to OLED
    this.createJumperWire(
      new THREE.Vector3(-0.7, 0.15, -0.15),
      new THREE.Vector3(-0.85, 0.28, 0.2),
      new THREE.Vector3(-0.6, 0.42, 0.55),
      this.materials.wireBlack
    );

    // Wire 3: I2C SCL (Yellow) from ESP32 to OLED
    this.createJumperWire(
      new THREE.Vector3(0.7, 0.25, -0.15),
      new THREE.Vector3(0.85, 0.32, 0.2),
      new THREE.Vector3(0.65, 0.42, 0.55),
      this.materials.wireYellow
    );

    // Wire 4: I2C SDA (Green) from ESP32 to OLED
    this.createJumperWire(
      new THREE.Vector3(0.7, 0.15, -0.15),
      new THREE.Vector3(0.8, 0.22, 0.2),
      new THREE.Vector3(0.55, 0.42, 0.55),
      this.materials.wireGreen
    );

    // Wire 5: I2S Audio Bus (Blue) from ESP32 down to MAX98357A Amp
    this.createJumperWire(
      new THREE.Vector3(-0.7, -0.15, -0.15),
      new THREE.Vector3(-0.8, -0.35, -0.05),
      new THREE.Vector3(-0.55, -0.45, 0.1),
      this.materials.wireBlue
    );

    // Wire 6: Speaker Driver Twisted Pair (Red & Black) from Amp to Speaker Transducer
    this.createJumperWire(
      new THREE.Vector3(-0.4, -0.55, 0.1),
      new THREE.Vector3(-0.1, -0.62, 0.18),
      new THREE.Vector3(0.18, -0.65, 0.22),
      this.materials.wireRed
    );
    this.createJumperWire(
      new THREE.Vector3(-0.4, -0.58, 0.1),
      new THREE.Vector3(-0.08, -0.68, 0.18),
      new THREE.Vector3(0.18, -0.68, 0.22),
      this.materials.wireBlack
    );

    // Wire 7: Capacitive Touch Sensor Wire (Orange) from Front Button to GPIO 2 on ESP32
    this.createJumperWire(
      new THREE.Vector3(0, -0.16, 0.7),
      new THREE.Vector3(0.35, -0.08, 0.35),
      new THREE.Vector3(0.7, -0.05, -0.15),
      this.materials.wireOrange
    );
  }

  // Create smooth curved 3D jumper wire
  createJumperWire(p1, p2, p3, material) {
    const curve = new THREE.CatmullRomCurve3([p1, p2, p3]);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.022, 8, false);
    const wireMesh = new THREE.Mesh(tubeGeo, material);
    this.peerbotGroup.add(wireMesh);
  }

  // Create flat ribbon flex cable
  createRibbonCable(p1, p2, width, material) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const ribbonGeo = new THREE.BoxGeometry(width, length, 0.012);
    const ribbon = new THREE.Mesh(ribbonGeo, material);
    ribbon.position.copy(mid);
    ribbon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    this.peerbotGroup.add(ribbon);
  }

  setExpression(expr) {
    this.currentExpression = expr;
    this.renderOLED();
    if (expr === 'speaking') {
      this.speakingPulse = 0;
    }
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    Object.values(this.materials).forEach(mat => {
      if (mat !== this.materials.oledScreen) {
        mat.wireframe = this.isWireframe;
      }
    });
    return this.isWireframe;
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  resetRotation() {
    this.modelRotation = { x: 0.06, y: 0.25 };
    this.rotationVelocity = { x: 0, y: 0 };
  }

  initEventListeners() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      const rect = dom.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.mouseCoords.x = nx;
      this.mouseCoords.y = ny;

      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.rotationVelocity.x = deltaY * 0.004;
      this.rotationVelocity.y = deltaX * 0.004;

      this.modelRotation.x += this.rotationVelocity.x;
      this.modelRotation.y += this.rotationVelocity.y;

      this.modelRotation.x = Math.max(-0.55, Math.min(0.55, this.modelRotation.x));
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.rotationVelocity = { x: 0, y: 0 };
    });

    // Touch support for phones & tablets
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.modelRotation.x += deltaY * 0.005;
      this.modelRotation.y += deltaX * 0.005;
      this.modelRotation.x = Math.max(-0.55, Math.min(0.55, this.modelRotation.x));

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    dom.addEventListener('dblclick', () => {
      this.resetRotation();
      SoundFX.playTap();
    });

    window.addEventListener('resize', () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Continuous smooth turntable rotation if enabled & not being dragged
    if (this.autoRotate && !this.isDragging) {
      this.modelRotation.y += this.options.rotationSpeed;
    }

    // Inertia damping
    if (!this.isDragging) {
      this.rotationVelocity.x *= 0.92;
      this.rotationVelocity.y *= 0.92;
      this.modelRotation.x += this.rotationVelocity.x;
      this.modelRotation.y += this.rotationVelocity.y;
    }

    this.peerbotGroup.rotation.x = this.modelRotation.x;
    this.peerbotGroup.rotation.y = this.modelRotation.y;

    // Natural blinking
    this.blinkTimer += 0.016;
    if (this.blinkTimer > 3.6) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.8) {
        this.isBlinking = false;
        this.blinkTimer = Math.random() * 1.5;
      }
      this.renderOLED();
    }

    // Speaking pulse
    if (this.currentExpression === 'speaking') {
      this.speakingPulse += 0.18;
      this.renderOLED();
    } else if (this.currentExpression === 'listening') {
      this.renderOLED();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
