import { SoundFX } from './sound.js';

/**
 * Peerbot Client Concierge & Interactive Workflow Tour Guide
 * Provides instant answers to client questions and conducts a step-by-step
 * executive walkthrough of the hardware, architecture, and real estate workflows.
 */

// Tour Stops definition
const TOUR_STOPS = [
  {
    step: 1,
    title: 'Stop 1 of 4: Naked 3D Hardware Prototype',
    targetId: 'hardware-3d',
    face: 'happy',
    narrative: `**Stop 1: The Modular Hardware Limb**\n\nPeerbot is built as an ultra-compact sensory node around the **Seeed Studio XIAO ESP32-S3 Sense** (dual-core 240MHz, 8MB PSRAM, Wi-Fi 4).\n\nNotice the exposed layout inside the smoked enclosure:\n• **OV2640 HD Camera** for client document verification\n• **1.3" SH1106 OLED** showing expressive dot-matrix eyes\n• **MAX98357A I2S Class-D Amp** driving natural acoustic TTS\n• **Capacitive Touch Pad (GPIO 2)** for physical push-to-talk\n\n*Key takeaway:* Peerbot does NOT run power-hungry local LLMs. It remains a lightweight, reliable sensory limb.`,
    promptActionText: 'Proceed to Architecture →',
    nextIndex: 1
  },
  {
    step: 2,
    title: 'Stop 2 of 4: Decoupled Brain & Limbs Architecture',
    targetId: 'architecture',
    face: 'speaking',
    narrative: `**Stop 2: The Fastpeer Ecosystem**\n\nPeerbot represents only 10% of the system. The remaining 90% is the **Fastpeer Central Intelligence** hosted in the cloud.\n\n• **Zero Firmware Debt:** When you upgrade LLM models or connect new MLS data feeds, Peerbot never needs a firmware re-flash.\n• **Universal Hardware Connector:** All devices communicate via typed JSON packets over bidirectional WebSockets.\n• **Model Context Protocol (MCP):** Connects Google Drive, CRM databases, MLS boards, and robotic actuators without hardware changes.`,
    promptActionText: 'See Real Estate Workflows →',
    nextIndex: 2
  },
  {
    step: 3,
    title: 'Stop 3 of 4: Ambient Real Estate Workflows',
    targetId: 'workflows',
    face: 'wink',
    narrative: `**Stop 3: Hands-Free Client Interactions**\n\nIn real estate consultations or open houses, looking down at a laptop kills client engagement. Peerbot enables screenless ambient execution:\n\n1. **Voice Notes to CRM:** "Take a note about the lease terms." Fastpeer transcribes, extracts terms, and updates the CRM.\n2. **Master Agent MLS:** "Find 4-bedroom comps nearby." Fastpeer queries live MLS and Peerbot speaks the summary.\n3. **Physical Stamping:** An incoming purchase offer triggers a physical robotic arm to stamp the paperwork while Peerbot alerts the room.`,
    promptActionText: 'Inspect Live Console →',
    nextIndex: 3
  },
  {
    step: 4,
    title: 'Stop 4 of 4: Live Universal Hardware Connector',
    targetId: 'live-console',
    face: 'happy',
    narrative: `**Stop 4: The Developer Test Bench**\n\nHere you can see the real-time event bus in action:\n\n• Audio chunks stream over **WebSocket event \`audio_stream\`**.\n• Fastpeer returns structured text-to-speech payloads with **event \`tts_response\`**.\n• Vision feeds stream 640x480 MJPEG frames with edge metadata.\n\n**Tour Complete!** You've seen the hardware, architecture, real-estate workflows, and WebSocket event bus. Would you like to reserve an early-access DevKit or ask specific questions?`,
    promptActionText: 'Reserve Developer Kit',
    actionType: 'modal',
    nextIndex: null
  }
];

// Comprehensive Knowledge Base for Q&A
const KNOWLEDGE_BASE = [
  {
    keywords: ['hardware', 'specs', 'components', 'board', 'esp32', 'parts', 'chip', 'processor', 'bom'],
    answer: `**Peerbot Hardware Bill of Materials (BOM):**\n\n• **Main SoC:** Seeed Studio XIAO ESP32-S3 Sense (Dual-core Xtensa LX7 @ 240MHz, 8MB PSRAM, 8MB Flash, Wi-Fi 4 + BLE 5.0)\n• **Vision Sensor:** OV2640 HD camera module (640x480 MJPEG @ 15fps)\n• **Display:** 1.3" SH1106 OLED (128x64 mono dot matrix via I2C at 0x3C)\n• **Audio Amp:** MAX98357A I2S 3.2W Class-D mono amplifier\n• **Speaker:** 1W 8-ohm acoustic micro-transducer\n• **Microphone:** Onboard PDM digital microphone on Seeed Sense expansion\n• **Input:** Capacitive touch wake interrupt on GPIO 2\n• **Power:** 5V USB-C or LiPo battery via onboard charging circuit.`
  },
  {
    keywords: ['brain', 'limbs', 'decoupled', 'philosophy', 'concept', 'architecture'],
    answer: `**The Decoupled Brain & Limbs Architecture:**\n\nTraditional smart devices put heavy compute on the edge, which leads to rapid obsolescence and difficult firmware updates.\n\nPeerbot treats the physical device strictly as a **"Limb"**—a modular sensory and actuator endpoint. The **"Brain"** lives entirely on Fastpeer's cloud orchestrator.\n\n*Advantages:*\n1. **Instant Intelligence Upgrades:** Switch from Claude to Gemini or add MCP tools with zero device re-flashing.\n2. **Ultra-Low Cost & Power:** Device BOM remains under $35 while delivering state-of-the-art reasoning.\n3. **Universal Connector:** The same WebSocket bus controls desk bots, robotic arms, or environmental sensors.`
  },
  {
    keywords: ['real estate', 'realtor', 'broker', 'use case', 'open house', 'workflow', 'meeting', 'client'],
    answer: `**Peerbot Real Estate Use Cases:**\n\n• **Open House Concierge:** Sits on the welcome counter. Greets visiting buyers, answers property questions (HOA fees, school districts, recent comps), and registers buyer contact info into the broker CRM.\n• **Hands-Free Client Consultations:** During buyer meetings, the agent speaks naturally: *"Peerbot, pull comps for 742 Maplewood."* Peerbot speaks the highlights without the agent opening a laptop.\n• **Document Processing:** Hold a contract or proof-of-funds letter up to Peerbot's camera to trigger OCR verification and instant archival into Google Drive via Fastpeer MCP.`
  },
  {
    keywords: ['privacy', 'security', 'always listening', 'recording', 'eavesdropping', 'safe'],
    answer: `**Privacy & Data Protection by Design:**\n\n• **No Continuous Recording:** Audio is NOT streamed continuously to the cloud. Audio streaming only activates upon capacitive touch interrupt (GPIO 2) or explicit wake state.\n• **Local LED Indicator:** An optical hardware indicator activates whenever the OV2640 camera or PDM mic is actively streaming.\n• **Encrypted Transport:** All communication between Peerbot and Fastpeer uses TLS/WSS WebSocket encryption with per-device cryptographic token validation.`
  },
  {
    keywords: ['fastpeer', 'connector', 'universal', 'websocket', 'api', 'protocol', 'mcp'],
    answer: `**Universal Hardware Connector Protocol:**\n\nPeerbot connects to Fastpeer via standard JSON over bidirectional WebSockets (\`wss://api.fastpeer.ai/v1/hardware\`).\n\n• **On Connection:** Device dispatches a handshake packet declaring capabilities (\`['audio_stream', 'camera_frame', 'oled_face', 'tts_playback']\`).\n• **Inbound to Device:** Typed JSON packets like \`{"event": "tts_response", "text": "...", "mood": "happy"}\`.\n• **Outbound from Device:** Streaming audio chunks and telemetry packets.\n• **MCP Integration:** Fastpeer automatically bridges hardware events to Model Context Protocol servers for CRM, MLS, and email.`
  },
  {
    keywords: ['camera', 'vision', 'ov2640', 'resolution', 'document'],
    answer: `**Vision Node Specifications:**\n\n• **Sensor:** Omnivision OV2640 2-Megapixel CMOS sensor.\n• **Streaming Mode:** 640x480 MJPEG at 15 frames per second.\n• **Lens:** 65° field-of-view fixed focus with infrared cut filter.\n• **Use Cases:** Client ID verification, contract and lease document OCR, and buyer presence detection in open house reception areas.`
  },
  {
    keywords: ['audio', 'sound', 'speaker', 'mic', 'microphone', 'i2s', 'voice', 'tts'],
    answer: `**Audio Subsystem Details:**\n\n• **Microphone:** High-SNR digital PDM microphone mounted on the Seeed Sense daughterboard, with hardware noise-floor filtering.\n• **Digital-to-Analog / Amp:** MAX98357A I2S Class-D amplifier with 92% efficiency and direct digital audio streaming over BCLK, LRC, and DIN.\n• **Acoustic Transducer:** 1W 8-ohm neodymium speaker with a custom bass-reflex acoustic resonance chamber inside the 3D-printed enclosure.`
  },
  {
    keywords: ['devkit', 'reserve', 'buy', 'order', 'price', 'pricing', 'cost', 'when', 'ship', 'available'],
    answer: `**Developer Kit & Availability:**\n\n• **DevKit Package:** Includes fully assembled Seeed XIAO ESP32-S3 Sense board, OV2640 camera, SH1106 OLED, MAX98357A amp, speaker, 3D printable STL enclosure files, open-source firmware, and 1-year Fastpeer Pro API access.\n• **Pricing:** The complete developer bundle is targeted at **$89 USD** (or $29 for bare PCB component kits).\n• **Timeline:** Batch 1 developer units ship in **Q1 2026**.\n• Click the **Reserve DevKit** button at the top of the page to lock in priority allocation.`
  },
  {
    keywords: ['display', 'oled', 'eyes', 'face', 'sh1106', 'expressions', 'mood'],
    answer: `**Interactive OLED Display:**\n\n• **Screen:** 1.3-inch SH1106 Monochrome OLED display (128x64 resolution) communicating over I2C at 400kHz.\n• **Eye Animations:** Renders procedural dot-matrix expressive eyes with natural blinking, pupil dilation, eye-tracking saccades, and multiple mood states (*Idle*, *Listening*, *Speaking*, *Happy*, *Wink*).\n• The eyes communicate status to clients without requiring a distracting full tablet screen.`
  },
  {
    keywords: ['diy', 'build', '3d print', 'stl', 'cad', 'custom', 'arm', 'actuator'],
    answer: `**DIY Builds & Custom Limbs:**\n\nYes! Peerbot is designed to be maker-friendly:\n• 3D CAD step/STL files will be open-sourced for desktop 3D printing (FDM or SLA).\n• The Universal Hardware Connector protocol is completely open. You can build other limbs—such as motorized pan-tilt heads, robotic arm contract stampers, or ambient status lamps—using the exact same JSON WebSocket bus.`
  },
  {
    keywords: ['battery', 'power', 'portable', 'plug', 'usb', 'charging'],
    answer: `**Power Architecture:**\n\n• **Continuous Operation:** Powered via standard 5V USB-C.\n• **Portable Mode:** Supports a 3.7V 650mAh LiPo cell with onboard battery management on the Seeed Studio carrier board, providing 3.5 to 4 hours of active portable demonstration at open houses.`
  },
  {
    keywords: ['why', 'ipad', 'phone', 'app', 'comparison', 'different'],
    answer: `**Why Peerbot instead of a Phone or iPad?**\n\n1. **Ambient Presence:** A dedicated physical companion sits naturally on a desk or reception counter, inviting natural interaction rather than burying people in notifications.\n2. **Eye Contact & Professionalism:** In high-stakes real estate transactions, looking down at a screen breaks rapport. Voice-first interaction keeps the broker and client engaged.\n3. **Dedicated Sensory Limb:** Integrated camera and directional audio tailored for room acoustics, not personal handheld phone calls.`
  }
];

export class PeerbotChatbot {
  constructor(options = {}) {
    this.isOpen = false;
    this.currentTourStep = 0;
    this.inTour = false;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    // 1. Floating Launcher Button
    const launcher = document.createElement('div');
    launcher.className = 'peerbot-chat-launcher';
    launcher.id = 'peerbot-chat-launcher';
    launcher.setAttribute('aria-label', 'Open Peerbot Assistant');
    launcher.innerHTML = `
      <div class="launcher-avatar">
        <span class="launcher-eye"></span>
        <span class="launcher-eye"></span>
      </div>
      <div class="launcher-content">
        <span class="launcher-title">Ask Peerbot</span>
        <span class="launcher-sub">Client Tour · FAQ</span>
      </div>
      <span class="launcher-status-dot"></span>
    `;
    document.body.appendChild(launcher);

    // 2. Chat Drawer / Modal Container
    const drawer = document.createElement('div');
    drawer.className = 'peerbot-chat-drawer';
    drawer.id = 'peerbot-chat-drawer';
    drawer.setAttribute('role', 'region');
    drawer.setAttribute('aria-label', 'Peerbot Client Assistant and Tour');
    drawer.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">
            <span class="chat-eye"></span>
            <span class="chat-eye"></span>
          </div>
          <div>
            <div class="chat-title-row">
              <h4 class="chat-title">Peerbot Concierge</h4>
              <span class="chat-badge">Fastpeer AI</span>
            </div>
            <p class="chat-subtitle">Hardware Guide & Client Tour Assistant</p>
          </div>
        </div>
        <div class="chat-header-actions">
          <button class="chat-header-btn" id="btn-chat-close" title="Close assistant" aria-label="Close assistant">
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Tour Banner -->
      <div class="chat-tour-banner" id="chat-tour-banner">
        <div class="banner-text">
          <strong>Interactive Client Walkthrough</strong>
          <span>4-step tour of hardware, brain & real-estate workflows</span>
        </div>
        <button class="btn btn-primary btn-xs" id="btn-start-tour">
          Start Tour →
        </button>
      </div>

      <!-- Messages Stream -->
      <div class="chat-messages" id="chat-messages">
        <!-- Initial Welcome Message -->
        <div class="chat-msg bot">
          <div class="msg-avatar">
            <span>●</span>
          </div>
          <div class="msg-bubble">
            <p><strong>Hello! I am Peerbot's Client Concierge.</strong></p>
            <p>I can take you or your client on a guided tour through our hardware and workflows, or answer any technical questions about the Seeed ESP32-S3 Sense and Fastpeer ecosystem.</p>
            <div class="msg-actions">
              <button class="chat-action-btn" data-action="start-tour">🚀 Start 4-Step Client Tour</button>
              <button class="chat-action-btn" data-query="What hardware is inside Peerbot?">🔩 Hardware Specs</button>
              <button class="chat-action-btn" data-query="Explain the Brain vs Limbs architecture">🧠 Brain vs Limbs</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div class="chat-typing-indicator" id="chat-typing" style="display: none;">
        <span></span><span></span><span></span>
        <em>Peerbot is thinking...</em>
      </div>

      <!-- Quick Prompt Suggestions Chips -->
      <div class="chat-suggestions" id="chat-suggestions">
        <button class="suggestion-chip" data-query="How does Peerbot help real estate brokers?">🏡 Real Estate Use Cases</button>
        <button class="suggestion-chip" data-query="How is microphone and camera privacy handled?">🔒 Privacy & Security</button>
        <button class="suggestion-chip" data-query="How does Universal Hardware Connector work?">🔌 WebSocket Connector</button>
        <button class="suggestion-chip" data-query="How do I reserve a Developer Kit?">📦 DevKit Reservation</button>
      </div>

      <!-- Chat Input Area -->
      <form class="chat-input-bar" id="chat-form">
        <input 
          type="text" 
          id="chat-input" 
          placeholder="Ask a question or request a tour..." 
          autocomplete="off"
          aria-label="Ask Peerbot a question"
        />
        <button type="submit" class="chat-send-btn" id="chat-send-btn" aria-label="Send message">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 004.835 9.25h8.415a.75.75 0 010 1.5H4.835a1.5 1.5 0 00-1.142 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
          </svg>
        </button>
      </form>
    `;
    document.body.appendChild(drawer);

    this.launcherElem = launcher;
    this.drawerElem = drawer;
    this.messagesElem = document.getElementById('chat-messages');
    this.inputElem = document.getElementById('chat-input');
    this.typingElem = document.getElementById('chat-typing');
  }

  bindEvents() {
    // Toggle Drawer Open/Close
    this.launcherElem.addEventListener('click', () => this.toggleDrawer());
    
    document.getElementById('btn-chat-close').addEventListener('click', () => this.closeDrawer());

    // Start Tour from Banner
    document.getElementById('btn-start-tour').addEventListener('click', () => {
      this.startTour();
    });

    // Handle Form Submit
    document.getElementById('chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.inputElem.value.trim();
      if (!text) return;
      this.handleUserMessage(text);
      this.inputElem.value = '';
    });

    // Quick suggestions chips
    document.getElementById('chat-suggestions').addEventListener('click', (e) => {
      const chip = e.target.closest('.suggestion-chip');
      if (!chip) return;
      const query = chip.getAttribute('data-query');
      if (query) {
        this.handleUserMessage(query);
      }
    });

    // Delegated actions inside message bubbles (e.g. tour buttons, next step buttons)
    this.messagesElem.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.chat-action-btn');
      if (!actionBtn) return;

      const action = actionBtn.getAttribute('data-action');
      const query = actionBtn.getAttribute('data-query');
      const nextStep = actionBtn.getAttribute('data-next-step');

      if (action === 'start-tour') {
        this.startTour();
      } else if (action === 'open-modal') {
        const modal = document.getElementById('demo-modal');
        if (modal) modal.classList.add('open');
      } else if (nextStep !== null && nextStep !== undefined) {
        this.advanceTour(parseInt(nextStep, 10));
      } else if (query) {
        this.handleUserMessage(query);
      }
    });

    // Add keyboard ESC handler to close drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDrawer();
      }
    });
  }

  toggleDrawer() {
    SoundFX.playTap();
    if (this.isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.isOpen = true;
    this.drawerElem.classList.add('open');
    this.launcherElem.classList.add('active');
    setTimeout(() => {
      this.inputElem.focus();
    }, 200);
  }

  closeDrawer() {
    this.isOpen = false;
    this.drawerElem.classList.remove('open');
    this.launcherElem.classList.remove('active');
  }

  handleUserMessage(text) {
    SoundFX.playTap();

    // 1. Append User Message
    this.appendMessage('user', text);

    // 2. Show Typing Indicator
    this.typingElem.style.display = 'flex';
    this.scrollToBottom();

    // 3. Process Intent
    const lower = text.toLowerCase();

    // Check if user is asking for a tour
    if (lower.includes('tour') || lower.includes('walkthrough') || lower.includes('demo') || lower.includes('workflow tour') || lower.includes('show client')) {
      setTimeout(() => {
        this.typingElem.style.display = 'none';
        this.startTour();
      }, 500);
      return;
    }

    // Match Knowledge Base
    let bestMatch = null;
    let highestScore = 0;

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (lower.includes(kw)) {
          score += kw.length;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    setTimeout(() => {
      this.typingElem.style.display = 'none';

      let reply = '';
      let actions = [];

      if (bestMatch && highestScore > 0) {
        reply = bestMatch.answer;
        // Contextual buttons
        if (lower.includes('hardware') || lower.includes('bom')) {
          actions.push({ label: '🔍 Jump to 3D Teardown', query: null, action: 'scroll-hardware' });
        }
        if (lower.includes('devkit') || lower.includes('buy') || lower.includes('reserve')) {
          actions.push({ label: '📝 Reserve DevKit Spot', query: null, action: 'open-modal' });
        }
      } else {
        reply = `**Understood:** *"${text}"*\n\nPeerbot connects physical environments directly to the Fastpeer Master Agent. Every interaction is routed through the Universal Hardware Connector over WebSockets.\n\nWould you like me to guide you through the **4-Stop Client Tour** or inspect specific hardware specs?`;
        actions.push({ label: '🚀 Start Client Tour', action: 'start-tour' });
        actions.push({ label: '🔩 Hardware Specs', query: 'What hardware is inside Peerbot?' });
      }

      this.appendMessage('bot', reply, actions);
    }, 600);
  }

  /**
   * Starts the 4-step client tour
   */
  startTour() {
    this.inTour = true;
    this.currentTourStep = 0;
    this.appendMessage(
      'bot',
      `**Welcome to the Official Peerbot Client Tour!** 🎬\n\nI will walk you through the system in 4 concise stops, highlighting our **modular hardware limb**, **decoupled Fastpeer brain**, **real-estate client workflows**, and **live WebSocket bus**.\n\nLet's head to our first stop!`
    );

    setTimeout(() => {
      this.advanceTour(0);
    }, 700);
  }

  /**
   * Advances the tour to a specific stop index
   */
  advanceTour(index) {
    if (index >= TOUR_STOPS.length) {
      this.inTour = false;
      return;
    }

    const stop = TOUR_STOPS[index];
    this.currentTourStep = index;

    // Smoothly scroll page to target section
    const targetElem = document.getElementById(stop.targetId);
    if (targetElem) {
      targetElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary highlight pulse on target section
      targetElem.classList.add('tour-section-highlight');
      setTimeout(() => {
        targetElem.classList.remove('tour-section-highlight');
      }, 3000);
    }

    // Trigger visual interaction if applicable
    if (stop.targetId === 'workflows') {
      const runWfBtn = document.getElementById('btn-run-workflow');
      if (runWfBtn) {
        setTimeout(() => runWfBtn.click(), 1000);
      }
    }

    // Compose actions
    const actions = [];
    if (stop.nextIndex !== null) {
      actions.push({
        label: stop.promptActionText,
        nextStep: stop.nextIndex
      });
    } else {
      // Completed
      actions.push({
        label: '📝 Reserve Developer Kit',
        action: 'open-modal'
      });
      actions.push({
        label: '🔄 Restart Tour',
        action: 'start-tour'
      });
    }

    setTimeout(() => {
      this.appendMessage('bot', stop.narrative, actions);
    }, 600);
  }

  appendMessage(sender, text, actions = []) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;

    // Simple markdown renderer for bold, lists, and line breaks
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>')
      .replace(/•\s+(.*)/g, '<li class="chat-li">$1</li>')
      .replace(/\n\n/g, '<p></p>')
      .replace(/\n/g, '<br/>');

    let actionsHtml = '';
    if (actions && actions.length > 0) {
      actionsHtml = `
        <div class="msg-actions">
          ${actions.map(act => {
            if (act.action === 'scroll-hardware') {
              return `<button class="chat-action-btn" onclick="document.getElementById('hardware-3d').scrollIntoView({behavior:'smooth'})">${act.label}</button>`;
            }
            if (act.nextStep !== undefined) {
              return `<button class="chat-action-btn primary" data-next-step="${act.nextStep}">${act.label}</button>`;
            }
            if (act.action) {
              return `<button class="chat-action-btn primary" data-action="${act.action}">${act.label}</button>`;
            }
            if (act.query) {
              return `<button class="chat-action-btn" data-query="${act.query}">${act.label}</button>`;
            }
            return `<button class="chat-action-btn">${act.label}</button>`;
          }).join('')}
        </div>
      `;
    }

    msg.innerHTML = `
      <div class="msg-avatar">
        <span>${sender === 'user' ? '👤' : '●'}</span>
      </div>
      <div class="msg-bubble">
        <div class="msg-content">${formattedText}</div>
        ${actionsHtml}
      </div>
    `;

    this.messagesElem.appendChild(msg);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesElem.scrollTop = this.messagesElem.scrollHeight;
  }

  addSystemToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'chat-mini-toast';
    toast.textContent = msg;
    this.drawerElem.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
}
