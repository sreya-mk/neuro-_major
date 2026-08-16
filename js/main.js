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
});
