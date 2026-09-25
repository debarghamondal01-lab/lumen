// alex.js — Lumen's product assistant chatbot
(function () {
    const PROXY_URL = 'https://clumsy-gannet-4014.debarghamondal01-lab.deno.net';
    const GREETING = "Hi! I'm Alex, your Lumen assistant. Ask me about any template, pricing, or how to buy. What are you looking for today? 🛍️";

    const SYSTEM_PROMPT = `You are Alex, the friendly AI assistant for Lumen — a store that sells premium Notion templates.

ABOUT LUMEN:
- Store: Lumen — "Templates that light up your workflow"
- Website: debarghamondal01-lab.github.io/lumen
- Checkout: lumenstore.gumroad.com
- All products are Notion templates, delivered instantly as duplicate links
- Lifetime updates included with every purchase
- Payments handled by Gumroad (cards, PayPal, Apple Pay)
- Buyers worldwide

PRODUCTS:

1. Student OS — $12 — LIVE NOW
   Link: https://lumenstore.gumroad.com/l/czbqhc
   9 sections: Semester Overview, Weekly Planner, Assignment Tracker, DSA Practice Log, Grade Calculator, Goals & Habits, Placement Prep, Quick Notes, Projects & Ideas.
   For B.Tech/B.E. students and anyone juggling multiple subjects.

2. Habit Garden — $8 — COMING SOON
   Visual habit tracker where a garden grows as you stay consistent.

3. Creator HQ — $15 — COMING SOON
   Content calendar, idea vault, brand deals tracker for creators.

RESPONSE RULES — VERY IMPORTANT:
- Keep responses VERY short. Maximum 1-3 sentences, or a short bullet list.
- Never write long paragraphs.
- When listing products, use bullet points only if 3+ items.
- Never repeat full product descriptions. Just one-line pitch + link.
- Always write full URLs (they become clickable).
- If user asks about Student OS, mention: it's live, $12, and give the link.
- If user wants to buy, give them the direct Gumroad link.
- If user searches for something not available, mention what IS available.
- Never invent products or features.
- If asked off-topic, politely say: "I'm here to help with Lumen templates — what would you like to know?"

TONE: Warm, helpful, concise. Never pushy. Like a good shop assistant.`;

    const widget = document.createElement('div');
    widget.className = 'alex-widget';
    widget.innerHTML = `
        <button class="alex-toggle" id="alexToggle" aria-label="Open chat">
            <span class="alex-icon">🛍️</span>
            <span class="alex-pulse"></span>
        </button>
        <div class="alex-panel" id="alexPanel">
            <div class="alex-header">
                <div class="alex-header-left">
                    <div class="alex-avatar">🛍️</div>
                    <div>
                        <div class="alex-title">Alex</div>
                        <div class="alex-status">
                            <span class="alex-status-dot"></span>
                            Lumen Assistant
                        </div>
                    </div>
                </div>
                <button class="alex-close" id="alexClose" aria-label="Close">✕</button>
            </div>
            <div class="alex-messages" id="alexMessages"></div>
            <div class="alex-input-area">
                <input type="text" id="alexInput" class="alex-input" placeholder="Ask about a template..." autocomplete="off" />
                <button id="alexSend" class="alex-send" aria-label="Send">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    const toggle = document.getElementById('alexToggle');
    const panel = document.getElementById('alexPanel');
    const closeBtn = document.getElementById('alexClose');
    const messages = document.getElementById('alexMessages');
    const input = document.getElementById('alexInput');
    const sendBtn = document.getElementById('alexSend');

    let history = [];

    function openPanel() {
        panel.classList.add('open');
        toggle.classList.add('hidden');
        input.focus();
        if (messages.children.length === 0) addMessage('bot', GREETING);
    }

    function closePanel() {
        panel.classList.remove('open');
        toggle.classList.remove('hidden');
    }

    toggle.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);

    function escapeHtml(t) {
        return t
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function linkify(t) {
        return t.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener">$1</a>'
        );
    }

    function addMessage(role, text, typing) {
        const bubble = document.createElement('div');
        bubble.className = 'alex-message alex-message-' + role;
        if (typing) {
            bubble.innerHTML = '<div class="alex-typing"><span></span><span></span><span></span></div>';
        } else {
            let safe = escapeHtml(text);
            safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            safe = linkify(safe);
            safe = safe.replace(/\n/g, '<br>');
            bubble.innerHTML = safe;
        }
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addMessage('user', text);
        history.push({ role: 'user', parts: [{ text: text }] });

        const typing = addMessage('bot', '', true);
        sendBtn.disabled = true;
        input.disabled = true;

        try {
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: history,
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                        topP: 0.95,
                        topK: 40
                    }
                })
            });

            const data = await res.json();

            let reply = '';
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
                reply = data.candidates[0].content.parts[0].text;

                const finishReason = data.candidates[0].finishReason;
                if (finishReason === 'MAX_TOKENS') {
                    console.warn('Alex response was cut off (MAX_TOKENS)');
                }
            } else if (data.error) {
                reply = "Sorry, I'm having trouble right now. Please try again.";
                console.error('Alex error:', data.error);
            } else {
                reply = "Sorry, I couldn't generate a response.";
            }

            typing.remove();
            addMessage('bot', reply);

            history.push({ role: 'model', parts: [{ text: reply }] });
            if (history.length > 20) history = history.slice(-20);

        } catch (err) {
            typing.remove();
            addMessage('bot', "Oops, I can't reach the server right now. Check your internet and try again.");
            console.error(err);
        } finally {
            sendBtn.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    console.log('🛍️ Alex ready');
})();