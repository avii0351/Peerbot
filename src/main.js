import { Peerbot3DViewer } from './peerbot3d.js';
import { SoundFX } from './sound.js';
import { PeerbotChatbot } from './chatbot.js';
import { SpatialUI } from './spatial.js';

// Workflows data from Architecture Guide PDF
const WORKFLOWS = {
  1: {
    title: 'Scenario 1: Taking a Voice Note',
    targetIcon: '📁',
    targetName: "Client's File CRM",
    targetSub: 'MCP Persistent Storage',
    steps: [
      { speaker: 'Client speaks', text: '"Take a note about the new property lease terms."' },
      { speaker: 'Peerbot streams audio', text: 'OV2640 mic streams raw PCM over WebSocket event bus.' },
      { speaker: 'Fastpeer transcribes + intent', text: 'LLM orchestrator extracts lease terms, date, and tenant ID.' },
      { speaker: 'Saves note to CRM', text: 'Record written into Fastpeer CRM via Google Drive & database MCP.' },
      { speaker: 'Fastpeer dispatches TTS payload', text: 'JSON text-to-speech packet dispatched to Peerbot device ID.' },
      { speaker: 'Peerbot announces out loud', text: '"Note saved to your Fastpeer account." (Eyes smile)' }
    ],
    json: {
      event: 'audio_stream_chunk',
      device_id: 'peerbot_desk_01',
      timestamp: 1729784200,
      payload: {
        intent: 'crm.take_note',
        transcript: 'Take a note about the new property lease',
        status: 'transcribed',
        client_file: 'johnson_lease_v2.pdf'
      }
    },
    finalSpoken: 'Note saved to your Fastpeer account.'
  },
  2: {
    title: 'Scenario 2: Asking for New Nearby Properties',
    targetIcon: '🏡',
    targetName: 'Master Agent MLS',
    targetSub: 'Live Market & CMA Engine',
    steps: [
      { speaker: 'Client asks', text: '"Anything new near this area with 4 bedrooms?"' },
      { speaker: 'Peerbot streams audio', text: 'Audio streamed with geolocation metadata to Fastpeer.' },
      { speaker: 'Fastpeer calls Master Agent', text: 'Master Agent queries live MLS feeds and CMA comparative reports.' },
      { speaker: 'Sends back matches', text: '2 new luxury listings matched within a 3-mile radius.' },
      { speaker: 'Sends TTS payload', text: 'Structured highlights payload packaged for speaker.' },
      { speaker: 'Peerbot reads highlights', text: '"Two new listings just hit Maplewood: one at $1.4M with modern pool." (Eyes look up)' }
    ],
    json: {
      event: 'query_listings',
      device_id: 'peerbot_desk_01',
      params: {
        bedrooms: 4,
        radius_miles: 3,
        cma_report_required: true
      },
      response: {
        matches_found: 2,
        top_listing: '742 Maplewood Crest, Austin TX'
      }
    },
    finalSpoken: 'Two new listings found near this area. The top match is on Maplewood Crest.'
  },
  3: {
    title: 'Scenario 3: Autonomous MCP Email & Robotic Arm Loop',
    targetIcon: '🦾',
    targetName: 'Physical Robotic Arm',
    targetSub: 'Vendor Actuator Node',
    steps: [
      { speaker: 'Gmail MCP receives email', text: 'Signed purchase offer received from buyer attorney.' },
      { speaker: 'Fastpeer updates global metadata', text: 'Master agent detects contract signature requirement.' },
      { speaker: 'Sends JSON action to Robotic Arm', text: '{"command": "move_xyz", "parameters": {"x": 125.0, "tool": "stamp"}}' },
      { speaker: 'Arm reports completion', text: 'Robotic arm physically stamps and moves the contract folder.' },
      { speaker: 'Fastpeer sends TTS alert to Peerbot', text: 'Dispatches task completion announcement packet.' },
      { speaker: 'Peerbot announces out loud', text: '"Signed offer received from Johnson family. Contract stamped and filed." (Eyes celebratory)' }
    ],
    json: {
      source: 'mcp:gmail',
      trigger: 'new_offer_received',
      action_dispatched: {
        target: 'robotic_arm_01',
        command: 'move_xyz',
        parameters: { x: 125.0, y: 45.2, z: 10.0, action: 'stamp_received' }
      },
      notification: {
        target: 'peerbot_desk_01',
        say: 'Signed offer received from Johnson family. Contract stamped and filed.'
      }
    },
    finalSpoken: 'Signed offer received from Johnson family. Contract stamped and filed.'
  }
};

// Main App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initFaqAccordion();
  initContactQuoteForm();
  init3DViewer();
  initWorkflowSimulator();
  initLiveConsole();
  initModalAndToasts();
  initChatbotAndTour();
  window.spatialUI = new SpatialUI();
});

function initChatbotAndTour() {
  const chatbot = new PeerbotChatbot();
  window.PeerbotBot = chatbot;

  const heroTourBtn = document.getElementById('btn-hero-client-tour');
  if (heroTourBtn) {
    heroTourBtn.addEventListener('click', () => {
      SoundFX.playTap();
      chatbot.openDrawer();
      chatbot.startTour();
    });
  }
}

// 1. Initialize Three.js 3D Naked Model Viewer (360 Turntable)
function init3DViewer() {
  const container = document.getElementById('peerbot-3d-container');
  if (!container) return;

  const rotateBtn = document.getElementById('btn-toggle-rotate');
  const rotateLabel = document.getElementById('rotate-label');
  const resetBtn = document.getElementById('btn-reset-view');
  const wireframeBtn = document.getElementById('btn-toggle-wireframe');
  const faceBtn = document.getElementById('btn-cycle-face');
  const currentFaceLabel = document.getElementById('current-face-label');

  const faces = ['idle', 'happy', 'listening', 'speaking', 'wink'];
  let currentFaceIndex = 0;

  const viewer = new Peerbot3DViewer('peerbot-3d-container', {
    autoRotate: true,
    rotationSpeed: 0.003
  });

  // Toggle 360 auto-rotation
  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      SoundFX.playTap();
      const isSpinning = viewer.toggleAutoRotate();
      if (rotateLabel) {
        rotateLabel.textContent = isSpinning ? 'Pause 360°' : 'Resume 360°';
      }
      rotateBtn.classList.toggle('active', isSpinning);
      showToast(isSpinning ? 'Auto-rotation resumed' : 'Auto-rotation paused');
    });
  }

  // Reset front angle
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      SoundFX.playTap();
      viewer.resetRotation();
      showToast('Front view restored');
    });
  }

  // Toggle wireframe / X-ray
  if (wireframeBtn) {
    wireframeBtn.addEventListener('click', () => {
      SoundFX.playTap();
      const isWire = viewer.toggleWireframe();
      wireframeBtn.classList.toggle('active', isWire);
      wireframeBtn.querySelector('span').textContent = isWire ? 'Shaded' : 'X-Ray';
      showToast(isWire ? 'X-Ray Wireframe on' : 'Shaded mode on');
    });
  }

  // Expression switcher function
  if (faceBtn) {
    faceBtn.addEventListener('click', () => {
      SoundFX.playTap();
      currentFaceIndex = (currentFaceIndex + 1) % faces.length;
      const mood = faces[currentFaceIndex];
      viewer.setExpression(mood);
      if (currentFaceLabel) {
        currentFaceLabel.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
      }
      showToast(`Face Mood: ${mood.toUpperCase()}`);
    });
  }
}

// 2. Interactive Workflow Step-by-Step Simulator
function initWorkflowSimulator() {
  const tabs = document.querySelectorAll('.workflow-tab');
  const runBtn = document.getElementById('btn-run-workflow');
  const titleElem = document.getElementById('wf-scenario-title');
  const stepListElem = document.getElementById('wf-step-list');
  const jsonPreviewElem = document.getElementById('wf-json-preview');
  const targetIcon = document.getElementById('node-target-icon');
  const targetName = document.getElementById('node-target-name');
  const targetSub = document.getElementById('node-target-sub');

  let currentWfId = 1;
  let isRunning = false;

  function renderWorkflow(wfId) {
    const data = WORKFLOWS[wfId];
    if (!data) return;

    if (titleElem) titleElem.textContent = data.title;
    if (targetIcon) targetIcon.textContent = data.targetIcon;
    if (targetName) targetName.textContent = data.targetName;
    if (targetSub) targetSub.textContent = data.targetSub;

    // Render Steps
    if (stepListElem) {
      stepListElem.innerHTML = data.steps.map((step, idx) => `
        <li class="${idx === 0 ? 'active-step' : ''}" data-step="${idx}">
          <span class="step-badge">${idx + 1}</span>
          <div>
            <strong>${step.speaker}:</strong>
            <p>${step.text}</p>
          </div>
        </li>
      `).join('');
    }

    // Render JSON code
    if (jsonPreviewElem) {
      jsonPreviewElem.textContent = JSON.stringify(data.json, null, 2);
    }
  }

  // Tab click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (isRunning) return;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentWfId = parseInt(tab.getAttribute('data-wf'), 10);
      renderWorkflow(currentWfId);
      SoundFX.playTap();
    });
  });

  // Animated execution runner
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (isRunning) return;
      isRunning = true;
      runBtn.disabled = true;
      runBtn.textContent = '⏳ Executing Sequence...';

      const nodes = [
        document.getElementById('node-client'),
        document.getElementById('node-peerbot'),
        document.getElementById('node-fastpeer'),
        document.getElementById('node-target')
      ];

      const packets = [
        document.getElementById('packet-1'),
        document.getElementById('packet-2'),
        document.getElementById('packet-3')
      ];

      const stepItems = stepListElem.querySelectorAll('li');

      // Sequence timeline
      let stepIndex = 0;
      function advanceStep() {
        if (stepIndex < stepItems.length) {
          stepItems.forEach(item => item.classList.remove('active-step'));
          stepItems[stepIndex].classList.add('active-step');

          // Highlight corresponding node
          nodes.forEach(n => n.classList.remove('node-active'));
          if (stepIndex === 0) {
            nodes[0].classList.add('node-active');
          } else if (stepIndex === 1) {
            nodes[1].classList.add('node-active');
            if (packets[0]) packets[0].classList.add('active');
            SoundFX.playPacketPing();
          } else if (stepIndex === 2 || stepIndex === 3) {
            nodes[2].classList.add('node-active');
            if (packets[1]) packets[1].classList.add('active');
            SoundFX.playPacketPing();
          } else if (stepIndex === 4) {
            nodes[3].classList.add('node-active');
            if (packets[2]) packets[2].classList.add('active');
            SoundFX.playPacketPing();
          } else if (stepIndex === 5) {
            nodes[1].classList.add('node-active');
            SoundFX.playPeerbotVoice(WORKFLOWS[currentWfId].finalSpoken);
          }

          stepIndex++;
          setTimeout(advanceStep, 950);
        } else {
          // Finished
          setTimeout(() => {
            nodes.forEach(n => n.classList.remove('node-active'));
            packets.forEach(p => p.classList.remove('active'));
            isRunning = false;
            runBtn.disabled = false;
            runBtn.textContent = '▶ Run Animated Sequence';
            showToast('✅ Workflow sequence completed successfully!');
          }, 1200);
        }
      }

      advanceStep();
    });
  }

  // Initial render
  renderWorkflow(1);
}

// 3. Live Interactive Peerbot Desk Console
function initLiveConsole() {
  const touchBtn = document.getElementById('sim-touch-btn');
  const userTextElem = document.getElementById('sim-user-text');
  const peerbotTextElem = document.getElementById('sim-peerbot-text');
  const packetLogElem = document.getElementById('ws-packet-log');
  const promptPills = document.querySelectorAll('.prompt-pill');
  const oledLeft = document.getElementById('sim-eye-left');
  const oledRight = document.getElementById('sim-eye-right');
  const toggleCamBtn = document.getElementById('btn-toggle-cam');
  const camHudBoxes = document.querySelectorAll('.camera-hud-box');

  const responses = {
    'Take a note about the property lease': 'Note saved: Property lease review scheduled with tenant for Friday 10 AM. Filed under client account.',
    'Anything new near this area?': 'Found 2 new luxury listings within 3 miles: 742 Maplewood Crest at $1.4M, and 12 Oak Hill at $980K.',
    'What do I have on file for this property?': 'On file for 742 Maplewood: Title deed, floorplan blueprint, and recent appraisal report at $1.38M.',
    'Schedule an ecosystem demo today': 'Demo request dispatched to Fastpeer team. Calendar invite sent to your verified work email.'
  };

  function appendWsLog(direction, text) {
    if (!packetLogElem) return;
    const now = new Date().toTimeString().split(' ')[0];
    const line = document.createElement('div');
    line.className = `ws-line ${direction}`;
    line.textContent = `[${now}] ${direction === 'in' ? '<<' : '>>'} ${text}`;
    packetLogElem.appendChild(line);
    packetLogElem.scrollTop = packetLogElem.scrollHeight;
  }

  function handleInteraction(query) {
    SoundFX.playTap();

    // Set eye state to listening
    if (oledLeft && oledRight) {
      oledLeft.className = 'sim-eye blink';
      oledRight.className = 'sim-eye blink';
      setTimeout(() => {
        oledLeft.className = 'sim-eye happy';
        oledRight.className = 'sim-eye happy';
      }, 400);
    }

    if (userTextElem) userTextElem.textContent = `"${query}"`;
    appendWsLog('out', `{"event":"audio_stream","query":"${query}","mic_gain":1.2}`);

    // Simulate Fastpeer processing
    setTimeout(() => {
      const reply = responses[query] || `Understood. Fastpeer master agent processed: "${query}". Updates recorded.`;
      if (peerbotTextElem) peerbotTextElem.textContent = `"${reply}"`;

      appendWsLog('in', `{"event":"tts_response","text":"${reply.substring(0, 48)}...","status":"ok"}`);
      SoundFX.playPeerbotVoice(reply);

      // Return eyes to happy/idle
      setTimeout(() => {
        if (oledLeft && oledRight) {
          oledLeft.className = 'sim-eye left';
          oledRight.className = 'sim-eye right';
        }
      }, 2500);
    }, 600);
  }

  if (touchBtn) {
    touchBtn.addEventListener('click', () => {
      handleInteraction('What do I have on file for this property?');
    });
  }

  promptPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const query = pill.getAttribute('data-prompt');
      handleInteraction(query);
    });
  });

  // Toggle Camera HUD overlays
  if (toggleCamBtn) {
    let hudVisible = true;
    toggleCamBtn.addEventListener('click', () => {
      SoundFX.playTap();
      hudVisible = !hudVisible;
      camHudBoxes.forEach(box => {
        box.style.display = hudVisible ? 'block' : 'none';
      });
      toggleCamBtn.textContent = hudVisible ? 'Hide Vision HUD' : 'Show Vision HUD';
    });
  }
}

// 4. Modal Dialog and Toast Helpers
function initModalAndToasts() {
  const modal = document.getElementById('demo-modal');
  const openBtn = document.getElementById('btn-open-demo-modal');
  const closeBtn = document.getElementById('modal-close');
  const form = document.getElementById('reservation-form');
  const ctaReserveBtn = document.getElementById('btn-cta-reserve');
  const portabilityDemoBtn = document.getElementById('btn-portability-demo');

  function openModal() {
    if (modal) modal.classList.add('open');
    SoundFX.playTap();
  }

  function closeModal() {
    if (modal) modal.classList.remove('open');
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (ctaReserveBtn) ctaReserveBtn.addEventListener('click', openModal);
  if (portabilityDemoBtn) portabilityDemoBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-name').value;
      closeModal();
      SoundFX.playSnap();
      showToast(`🎉 Thank you ${name}! Your Peerbot DevKit spot is reserved.`);
      form.reset();
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(16px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 5. Top Scroll Progress Bar (Yatricare Style)
function initScrollProgress() {
  const progressBar = document.getElementById('progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }, { passive: true });
}

// 6. Yatricare Accordion FAQ
function initFaqAccordion() {
  const qas = document.querySelectorAll('.qa');
  qas.forEach(qa => {
    const btn = qa.querySelector('button');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = qa.classList.contains('open');

      // Close all other questions for clean accordion experience
      qas.forEach(item => {
        if (item !== qa) {
          item.classList.remove('open');
          const otherBtn = item.querySelector('button');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      qa.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      SoundFX.playTap();
    });
  });
}

// 7. Contact / Reservation Form (Yatricare Style)
function initContactQuoteForm() {
  const quoteForm = document.getElementById('contact-quote-form');
  if (!quoteForm) return;

  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('contact-name');
    const name = nameInput ? nameInput.value : 'Realtor';
    SoundFX.playSnap();
    showToast(`🎉 Thank you, ${name}! Your consultation and DevKit reservation has been received.`);
    quoteForm.reset();
  });
}

