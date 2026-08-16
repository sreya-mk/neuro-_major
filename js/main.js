document.addEventListener('DOMContentLoaded', () => {
    // Accessibility Widget Injection
    const widgetHTML = `
        <button class="access-widget-btn" aria-label="Accessibility Options" title="Accessibility Options">
            <i class="fas fa-universal-access"></i>
        </button>
        <div class="access-panel">
            <h3>Accessibility Settings</h3>
            
            <div class="access-option">
                <label>Text Size</label>
                <div class="access-controls">
                    <button class="access-btn active" data-action="text-size" data-value="normal">A</button>
                    <button class="access-btn" data-action="text-size" data-value="large">A+</button>
                    <button class="access-btn" data-action="text-size" data-value="xlarge">A++</button>
                </div>
            </div>

            <div class="access-option">
                <label>Theme (Color Contrast)</label>
                <div class="access-controls">
                    <button class="access-btn active" data-action="theme" data-value="light">Light</button>
                    <button class="access-btn" data-action="theme" data-value="dark">Dark</button>
                    <button class="access-btn" data-action="theme" data-value="high-contrast">High</button>
                </div>
            </div>

            <div class="access-option">
                <label>Dyslexia Friendly Font</label>
                <div class="access-controls">
                    <button class="access-btn active" data-action="font" data-value="standard">Standard</button>
                    <button class="access-btn" data-action="font" data-value="dyslexia">Dyslexia</button>
                </div>
            </div>
            
            <div class="access-option">
                <label>Text-to-Speech (Hover)</label>
                <div class="access-controls">
                    <button class="access-btn active" data-action="tts" data-value="off">Off</button>
                    <button class="access-btn" data-action="tts" data-value="on">On</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    const widgetBtn = document.querySelector('.access-widget-btn');
    const panel = document.querySelector('.access-panel');

    widgetBtn.addEventListener('click', () => {
        panel.classList.toggle('show');
    });

    // Handle Accessibility Settings
    const accessBtns = document.querySelectorAll('.access-btn');
    
    // Load saved settings
    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('neuroAdaptSettings')) || {
            textSize: 'normal',
            theme: 'light',
            font: 'standard',
            tts: 'off'
        };

        applySettings(settings);
    };

    const applySettings = (settings) => {
        // Apply text size
        document.body.classList.remove('text-large', 'text-xlarge');
        if (settings.textSize !== 'normal') {
            document.body.classList.add(`text-${settings.textSize}`);
        }

        // Apply theme
        document.documentElement.setAttribute('data-theme', settings.theme);

        // Apply font
        if (settings.font === 'dyslexia') {
            document.body.classList.add('dyslexia-font');
        } else {
            document.body.classList.remove('dyslexia-font');
        }

        // Update active states on buttons
        accessBtns.forEach(btn => {
            const action = btn.dataset.action;
            const value = btn.dataset.value;
            
            if (action === 'text-size' && value === settings.textSize) btn.classList.add('active');
            else if (action === 'text-size') btn.classList.remove('active');

            if (action === 'theme' && value === settings.theme) btn.classList.add('active');
            else if (action === 'theme') btn.classList.remove('active');

            if (action === 'font' && value === settings.font) btn.classList.add('active');
            else if (action === 'font') btn.classList.remove('active');
            
            if (action === 'tts' && value === settings.tts) btn.classList.add('active');
            else if (action === 'tts') btn.classList.remove('active');
        });

        // TTS setup
        if (settings.tts === 'on') {
            enableTTS();
        } else {
            disableTTS();
        }
    };

    accessBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const value = e.target.dataset.value;
            
            const settings = JSON.parse(localStorage.getItem('neuroAdaptSettings')) || {
                textSize: 'normal',
                theme: 'light',
                font: 'standard',
                tts: 'off'
            };

            if (action === 'text-size') settings.textSize = value;
            if (action === 'theme') settings.theme = value;
            if (action === 'font') settings.font = value;
            if (action === 'tts') settings.tts = value;

            localStorage.setItem('neuroAdaptSettings', JSON.stringify(settings));
            applySettings(settings);
        });
    });

    // Simple Text-to-Speech implementation
    let ttsEnabled = false;
    const synth = window.speechSynthesis;

    const speakText = (e) => {
        if (!ttsEnabled) return;
        
        // Stop current speech
        synth.cancel();

        const text = e.target.innerText || e.target.textContent;
        if (text && text.trim().length > 0 && ['H1', 'H2', 'H3', 'P', 'A', 'BUTTON', 'SPAN', 'LABEL', 'TH', 'TD'].includes(e.target.tagName)) {
            const utterThis = new SpeechSynthesisUtterance(text);
            synth.speak(utterThis);
        }
    };

    const enableTTS = () => {
        ttsEnabled = true;
        document.body.addEventListener('mouseover', speakText);
    };

    const disableTTS = () => {
        ttsEnabled = false;
        synth.cancel();
        document.body.removeEventListener('mouseover', speakText);
    };

    loadSettings();

    // --- Frontend ↔ Backend wiring ---
    async function fetchProfile() {
        try {
            const res = await fetch('/api/profile');
            if (!res.ok) return;
            const data = await res.json();
            const container = document.querySelector('.profiling-container');
            if (container) {
                const el = document.createElement('div');
                el.className = 'profile-summary';
                el.innerHTML = `
                    <div style="text-align:left; margin-bottom:18px; padding:16px; border-radius:12px; border:1px solid var(--border-color); background:var(--card-bg);">
                        <h3 style="margin:0 0 6px 0;">${data.name}</h3>
                        <div style="color:var(--text-muted); margin-bottom:8px;">${data.title}</div>
                        <p style="margin:0 0 8px 0;">${data.bio}</p>
                        <div style="font-size:0.9rem; color:var(--text-main);"><strong>Skills:</strong> ${data.skills ? data.skills.join(', ') : ''}</div>
                    </div>
                `;
                const first = container.querySelector('.progress-bar-container');
                if (first) container.insertBefore(el, first.nextSibling);
                else container.insertBefore(el, container.firstChild);
            }
        } catch (err) {
            console.error('fetchProfile error', err);
        }
    }

    async function fetchLearning() {
        try {
            const res = await fetch('/api/learning');
            if (!res.ok) return;
            const data = await res.json();
            const list = document.querySelector('.module-list');
            if (list && data.resources && data.resources.length) {
                // Append any additional resources returned by the API
                data.resources.forEach(r => {
                    const item = document.createElement('div');
                    item.className = 'module-item';
                    item.innerHTML = `
                        <div class="module-info">
                            <div class="module-icon"><i class="fas fa-book"></i></div>
                            <div class="module-details">
                                <h3>${r.title}</h3>
                                <p>${r.description || ''}</p>
                            </div>
                        </div>
                        <a class="action-btn btn-start" href="${r.url || '#'}">Open</a>
                    `;
                    list.appendChild(item);
                });
            }
        } catch (err) {
            console.error('fetchLearning error', err);
        }
    }

    async function fetchInterviewQuestions() {
        try {
            const res = await fetch('/api/interview');
            if (!res.ok) return;
            const data = await res.json();
            const chat = document.getElementById('chatMessages');
            if (chat && data.questions && data.questions.length) {
                data.questions.forEach(q => {
                    const el = document.createElement('div');
                    el.className = 'msg ai';
                    el.textContent = q.question || q.text || 'Question';
                    chat.appendChild(el);
                });
                // scroll to bottom
                chat.scrollTop = chat.scrollHeight;
            }
        } catch (err) {
            console.error('fetchInterviewQuestions error', err);
        }
    }

    // Collect profiling answers
    const profilingAnswers = {};

    window.recordAnswer = function (questionNumber, choice) {
        profilingAnswers[`q${questionNumber}`] = choice;
        // persist locally in case of navigation
        localStorage.setItem('neuroProfileAnswers', JSON.stringify(profilingAnswers));
    };

    async function submitProfileData(payload) {
        try {
            await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error('submitProfileData error', err);
        }
    }

    // Watch for profile completion and submit answers payload
    const completionNode = document.getElementById('completion');
    if (completionNode) {
        const mo = new MutationObserver(() => {
            if (completionNode.classList.contains('active')) {
                // load any saved answers
                const saved = JSON.parse(localStorage.getItem('neuroProfileAnswers') || '{}');
                const payload = { event: 'profile_complete', timestamp: Date.now(), answers: Object.keys(saved).length ? saved : profilingAnswers };
                submitProfileData(payload);
                mo.disconnect();
            }
        });
        mo.observe(completionNode, { attributes: true });
    }

    // Run appropriate fetches depending on page
    fetchProfile();
    fetchLearning();
    fetchInterviewQuestions();
});
