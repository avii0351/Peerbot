import { Peerbot3DViewer } from './peerbot3d.js';
import { SoundFX } from './sound.js';
import { PeerbotChatbot } from './chatbot.js';
import { SpatialUI } from './spatial.js';

// Workflows data from Architecture Guide PDF
// Workflows data: Authentic real-estate top producer scenarios
const WORKFLOWS = {
  1: {
    title: 'Scenario 1: Post-Showing Voice Note & CRM Sync',
    targetIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    targetName: "Johnson Family CRM File",
    targetSub: 'Follow Up Boss / Hubspot Sync',
    steps: [
      { speaker: 'Agent dictates at desk or in car', text: '"Take a note for Johnson family: budget $1.4M, needs home office in Maplewood."' },
      { speaker: 'Peerbot captures speech', text: 'Directional far-field microphone streams audio chunk over encrypted WebSocket.' },
      { speaker: 'Fastpeer parses client intent', text: 'Fastpeer intelligence extracts contact name, $1.4M budget, and target neighborhood.' },
      { speaker: 'Auto-syncs to CRM', text: 'Client record updated instantly in brokerage CRM without typing a single key.' },
      { speaker: 'Returns audio confirmation', text: 'TTS payload returned to device: "Johnson file updated with $1.4M budget."' },
      { speaker: 'Peerbot confirms aloud', text: '"Johnson file updated with $1.4M budget in Maplewood." (Eyes blink warmly)' }
    ],
    json: {
      event: 'audio_stream_chunk',
      device_id: 'peerbot_desk_01',
      timestamp: 1729784200,
      payload: {
        intent: 'crm.take_note',
        transcript: 'Take a note for Johnson family: budget $1.4M, needs home office in Maplewood',
        status: 'synced_to_crm',
        client_file: 'johnson_buyer_profile.json',
        crm_target: 'FollowUpBoss'
      }
    },
    finalSpoken: 'Johnson file updated with $1.4M budget in Maplewood.'
  },
  2: {
    title: 'Scenario 2: Desk Contract Vision & Escrow Verification',
    targetIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
    targetName: 'Escrow Transaction Folder',
    targetSub: 'DocuSign & Drive Sync',
    steps: [
      { speaker: 'Agent places addendum on desk', text: '"Peerbot, verify this escrow addendum for required initials."' },
      { speaker: 'Desk vision scans document', text: 'High-contrast edge scan extracts all 14 signing blocks.' },
      { speaker: 'Fastpeer legal OCR analysis', text: 'Audits signatures, purchase price clauses, and closing date provisions.' },
      { speaker: 'Verifies complete execution', text: 'Confirms all 14 initials present and archives verified copy to transaction folder.' },
      { speaker: 'Sends audio summary payload', text: 'Synthesizes concise audio audit summary for agent.' },
      { speaker: 'Peerbot speaks audit findings', text: '"Escrow addendum verified. All 14 initials accounted for and filed." (Eyes happy)' }
    ],
    json: {
      event: 'contract_audit',
      device_id: 'peerbot_desk_01',
      document: 'escrow_addendum_final.pdf',
      audit: {
        total_initials_required: 14,
        initials_verified: 14,
        status: 'fully_executed'
      },
      archived_to: 'google_drive/transactions/742_maplewood'
    },
    finalSpoken: 'Escrow addendum verified. All 14 initials accounted for and filed.'
  },
  3: {
    title: 'Scenario 3: Showing Dispatch & Contractor Scheduling',
    targetIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    targetName: 'Broker Operations Hub',
    targetSub: 'Staging, Photos & Lockbox Delivery',
    steps: [
      { speaker: 'Agent confirms new listing', text: '"Peerbot, launch 742 Maplewood: book HDR photos and lockbox courier."' },
      { speaker: 'Peerbot dispatches command', text: 'Packages listing address, preferred shoot window, and access instructions.' },
      { speaker: 'Fastpeer orchestrates vendors', text: 'Queries preferred photographer calendar and dispatches staging checklist.' },
      { speaker: 'Dispatches confirmed bookings', text: 'Sends calendar invites to seller, photographer, and courier with lockbox instructions.' },
      { speaker: 'Sends completion telemetry', text: 'Dispatches task completion announcement packet.' },
      { speaker: 'Peerbot announces aloud', text: '"Photos booked for Thursday 10 AM. Lockbox courier dispatched." (Eyes celebratory)' }
    ],
    json: {
      event: 'vendor_dispatch',
      listing: '742 Maplewood Crest, Austin TX',
      photographer: { confirmed: true, date: 'Thursday 10:00 AM' },
      lockbox_courier: { dispatched: true, code: '4821' },
      calendar_invite_sent: true
    },
    finalSpoken: 'Photos booked for Thursday 10 AM. Lockbox courier dispatched.'
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
    if (targetIcon) targetIcon.innerHTML = data.targetIcon;
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
      runBtn.innerHTML = '<span class="spin-dot"></span> Executing...';

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
            runBtn.innerHTML = 'Run Sequence';
            showToast('Workflow sequence completed successfully.');
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
      showToast(`Thank you ${name}! Your Peerbot DevKit spot is reserved.`);
      form.reset();
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-ic"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></span> <span>${message}</span>`;
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
    showToast(`Thank you, ${name}! Your consultation and DevKit reservation has been received.`);
    quoteForm.reset();
  });
}

