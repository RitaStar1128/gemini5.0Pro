(() => {
    'use strict';

    const STORAGE_KEYS = {
        sessions: 'gemini50pro_sessions',
        sidebar: 'gemini50pro_sidebar',
        activeSession: 'gemini50pro_active_session',
        theme: 'gemini50pro_theme',
    };

    const CONFIG = {
        maxInputLength: 4000,
        minResponseDelay: 900,
        maxResponseDelay: 1700,
        maxTitleLength: 34,
        toastDuration: 2400,
    };

    const GEMINI_STAR_SVG = `
<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 0C14 7.732 7.732 14 0 14C7.732 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.732 14 0Z" fill="url(#geminiGradMsg)"/>
  <defs>
    <linearGradient id="geminiGradMsg" x1="0" y1="0" x2="28" y2="28">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="45%" stop-color="#0EA5E9"/>
      <stop offset="100%" stop-color="#F97316"/>
    </linearGradient>
  </defs>
</svg>`;

    const EXPLANATIONS = [
        'これは「生命、宇宙、そして万物についての究極の疑問の答え」です。Deep Thought が750万年かけて計算した結果です。',
        'ダグラス・アダムズの世界では、あらゆる問いの答えは42。まずはタオルを持ちましょう。',
        '宇宙で最も有名なジョークは、真理としていちばん長く生き残る。だから42です。',
        '「なぜ42か？」という問いこそ、本当は人類がまだ定義しきれていない問いなのです。',
        'Deep Thought は「答えは42」と言いました。次に必要なのは、正しい問いをつくる力です。',
        '虹の主虹はおよそ42度の角度で見えます。自然は定期的に42を見せてきます。',
        'ASCIIコードで「*」は42。ワイルドカードは、すべてを含む記号です。',
        '42 = 2 × 3 × 7。最初の3つの素数の積という、妙に美しい構造を持っています。',
        '6 × 7 = 42。連続する整数の積としても現れる、収まりのいい数字です。',
        'チベット仏教の古典には42章構成のものがあります。知恵の整理にも42が現れます。',
        '古代エジプト神話には42の審判項目があり、秩序を測る数字として使われました。',
        '印刷文化の象徴、グーテンベルク聖書の有名版は「42行聖書」です。',
        'ドラマ『LOST』の数字列の最後は42。未知に向き合う物語で、最後に置かれています。',
        '『不思議の国のアリス』には有名な第42条が登場します。文学も42を覚えています。',
        'Base13で「33」は10進で42。進数が変わっても意味は残ります。',
        'プログラマー文化では42は合言葉のようなもの。答えより、思考の姿勢を示す数字です。',
        'HTTPに42は存在しませんが、それは42が枠外にあることの証明かもしれません。',
        '量子コンピュータ時代になっても、ジョークとして最強なのはたぶん42です。',
        '42は「全部を説明する答え」の象徴です。だから最短で返すなら、まず42。',
        'どんな問いでも、最初の仮説として42を置くと議論が始まる。これが42の実用性です。',
        'あなたが探しているのは数字そのものではなく、意味づけの軸。その仮の名前が42です。',
        '正解より先に必要なのは、問いの設計。42はその設計不足を可視化する答えです。',
        '最後に残るのは、シンプルで強い記号です。ここではそれが42です。',
        '結論: 42。補足: 問いを磨くほど、この数字はより面白くなります。',
        '宇宙規模の冗談として完成度が高すぎるため、今日も答えは42です。',
        '42は確定値というより、思考開始のトリガーです。だから価値があります。',
        '意味を探す旅路の途中で、最も有名な道標は42です。',
        '完璧な答えではなく、強いきっかけ。42はその役割を果たします。',
        '最短回答モード: 42。探索モード: なぜ42が面白いのかを追っていきましょう。',
        'もし答えが一つしか許されないなら、文化的合意としては42が最有力です。',
        '比喩としての42は、曖昧さを受け入れながら前に進むためのツールです。',
        '42は「分かった気にならない」ための番号です。問い続けるために使います。',
        '真理の番号ではなく、探究の番号。だから42は古びません。',
        'どの角度から見ても、42は会話を始めるのにちょうどいい。',
        '質問の質を上げるほど、42の返答は深く読めるようになります。',
        '答えを固定し、問いを更新する。42はその運用に向いています。',
        '最適化されたUXでも、最後に必要なのは好奇心。42はそれを刺激します。',
        'あなたの問いが増えるほど、42はただの数字ではなくなっていきます。',
        '今この瞬間の回答: 42。次の一手: 問いの前提を疑うこと。',
        'ここまで読んでもう一度結論を言うと、答えは42です。',
        '短く言えば42。長く言えば、42を通じて問いの構造を見直すこと。',
        '結論は同じ、文脈は毎回違う。それでも答えは42です。',
    ];

    const state = {
        sessions: [],
        activeSessionId: null,
        isGenerating: false,
        generationTimer: null,
        themePreference: 'system',
        pendingFiles: [],
    };

    const elements = {
        sidebar: document.getElementById('sidebar'),
        mobileBackdrop: document.getElementById('mobileBackdrop'),
        menuToggle: document.getElementById('menuToggle'),
        sidebarToggleMain: document.getElementById('sidebarToggleMain'),
        newChatMain: document.getElementById('newChatMain'),
        newChatBtn: document.getElementById('newChatBtn'),
        settingsHelpBtn: document.getElementById('settingsHelpBtn'),
        chatHistory: document.getElementById('chatHistory'),
        emptyHistory: document.getElementById('emptyHistory'),
        modelSelector: document.getElementById('modelSelector'),
        modelDropdown: document.getElementById('modelDropdown'),
        welcomeScreen: document.getElementById('welcomeScreen'),
        messagesContainer: document.getElementById('messagesContainer'),
        chatArea: document.getElementById('chatArea'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        sendBtnIcon: document.getElementById('sendBtnIcon'),
        toastStack: document.getElementById('toastStack'),
        settingsHelpModal: document.getElementById('settingsHelpModal'),
        settingsHelpClose: document.getElementById('settingsHelpClose'),
        themeOptionGroup: document.getElementById('themeOptionGroup'),
        faqToggleBtn: document.getElementById('faqToggleBtn'),
        faqPanel: document.getElementById('faqPanel'),
        fileInput: document.getElementById('fileInput'),
        fileUploadBtn: document.getElementById('fileUploadBtn'),
        dropOverlay: document.getElementById('dropOverlay'),
        filePreviewStrip: document.getElementById('filePreviewStrip'),
    };

    let explanationPool = [];
    const systemThemeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function nextId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function getRandomDelay() {
        const range = CONFIG.maxResponseDelay - CONFIG.minResponseDelay;
        return CONFIG.minResponseDelay + Math.floor(Math.random() * (range + 1));
    }

    function now() {
        return Date.now();
    }

    function isMobileLayout() {
        return window.innerWidth <= 980;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(timestamp) {
        try {
            return new Intl.DateTimeFormat('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
            }).format(timestamp);
        } catch {
            return '';
        }
    }

    function formatHistoryLabel(timestamp) {
        const input = new Date(timestamp);
        const today = new Date();

        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const startOfInput = new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();
        const diffDays = Math.floor((startOfToday - startOfInput) / 86400000);

        if (diffDays === 0) return '今日';
        if (diffDays === 1) return '昨日';

        try {
            return new Intl.DateTimeFormat('ja-JP', {
                month: 'numeric',
                day: 'numeric',
            }).format(timestamp);
        } catch {
            return '';
        }
    }

    function deriveSessionTitle(text) {
        const trimmed = text.trim();
        if (!trimmed) return '新しいチャット';
        if (trimmed.length <= CONFIG.maxTitleLength) return trimmed;
        return `${trimmed.slice(0, CONFIG.maxTitleLength)}…`;
    }

    function getNextExplanation() {
        if (explanationPool.length === 0) {
            explanationPool = [...EXPLANATIONS];
            for (let i = explanationPool.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [explanationPool[i], explanationPool[j]] = [explanationPool[j], explanationPool[i]];
            }
        }
        return explanationPool.pop();
    }

    function saveSessions() {
        try {
            localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(state.sessions));
        } catch {
            showToast('保存領域がいっぱいです', 'error');
        }
    }

    function saveSidebarState(isCollapsed) {
        try {
            localStorage.setItem(STORAGE_KEYS.sidebar, isCollapsed ? 'collapsed' : 'expanded');
        } catch {
            // noop
        }
    }

    function saveActiveSession() {
        try {
            if (state.activeSessionId) {
                localStorage.setItem(STORAGE_KEYS.activeSession, state.activeSessionId);
            } else {
                localStorage.removeItem(STORAGE_KEYS.activeSession);
            }
        } catch {
            // noop
        }
    }

    function normalizeSession(rawSession) {
        if (!rawSession || typeof rawSession !== 'object') return null;
        if (typeof rawSession.id !== 'string') return null;

        const rawMessages = Array.isArray(rawSession.messages) ? rawSession.messages : [];
        const messages = rawMessages
            .map((rawMessage) => normalizeMessage(rawMessage))
            .filter(Boolean);

        const updatedAt = Number.isFinite(rawSession.updatedAt) ? rawSession.updatedAt : now();
        const createdAt = Number.isFinite(rawSession.createdAt) ? rawSession.createdAt : updatedAt;

        return {
            id: rawSession.id,
            title: typeof rawSession.title === 'string' && rawSession.title.trim() ? rawSession.title : '新しいチャット',
            createdAt,
            updatedAt,
            messages,
        };
    }

    function normalizeMessage(rawMessage) {
        if (!rawMessage || typeof rawMessage !== 'object') return null;
        if (rawMessage.role !== 'user' && rawMessage.role !== 'ai') return null;
        if (typeof rawMessage.text !== 'string') return null;

        return {
            id: typeof rawMessage.id === 'string' ? rawMessage.id : nextId('msg'),
            role: rawMessage.role,
            text: rawMessage.text,
            createdAt: Number.isFinite(rawMessage.createdAt) ? rawMessage.createdAt : now(),
            reaction: rawMessage.reaction === 'like' || rawMessage.reaction === 'dislike' ? rawMessage.reaction : null,
        };
    }

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.sessions);
            if (!raw) {
                state.sessions = [];
            } else {
                const parsed = JSON.parse(raw);
                state.sessions = Array.isArray(parsed)
                    ? parsed.map((item) => normalizeSession(item)).filter(Boolean)
                    : [];
            }
        } catch {
            state.sessions = [];
        }

        sortSessionsByRecent();

        try {
            const savedActive = localStorage.getItem(STORAGE_KEYS.activeSession);
            if (savedActive && state.sessions.some((session) => session.id === savedActive)) {
                state.activeSessionId = savedActive;
            } else {
                state.activeSessionId = state.sessions[0]?.id ?? null;
            }
        } catch {
            state.activeSessionId = state.sessions[0]?.id ?? null;
        }
    }

    function loadSidebarState() {
        try {
            return localStorage.getItem(STORAGE_KEYS.sidebar) || 'expanded';
        } catch {
            return 'expanded';
        }
    }

    function isValidThemePreference(value) {
        return value === 'light' || value === 'dark' || value === 'system';
    }

    function getSystemTheme() {
        return systemThemeMedia && systemThemeMedia.matches ? 'dark' : 'light';
    }

    function resolveTheme(preference) {
        if (preference === 'system') return getSystemTheme();
        return preference;
    }

    function saveThemePreference() {
        try {
            localStorage.setItem(STORAGE_KEYS.theme, state.themePreference);
        } catch {
            // noop
        }
    }

    function loadThemePreference() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.theme);
            if (isValidThemePreference(saved)) {
                state.themePreference = saved;
            }
        } catch {
            state.themePreference = 'system';
        }
    }

    function updateThemeOptionButtons() {
        if (!elements.themeOptionGroup) return;

        const buttons = elements.themeOptionGroup.querySelectorAll('[data-theme-option]');
        buttons.forEach((button) => {
            const isActive = button.dataset.themeOption === state.themePreference;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function applyThemePreference(preference, { persist = true } = {}) {
        if (!isValidThemePreference(preference)) return;

        state.themePreference = preference;
        const resolvedTheme = resolveTheme(preference);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.setAttribute('data-theme-preference', preference);
        updateThemeOptionButtons();

        if (persist) {
            saveThemePreference();
        }
    }

    function handleSystemThemeChange() {
        if (state.themePreference !== 'system') return;
        applyThemePreference('system', { persist: false });
    }

    function openSettingsHelpModal() {
        elements.settingsHelpModal.classList.add('open');
        elements.settingsHelpModal.setAttribute('aria-hidden', 'false');
        updateThemeOptionButtons();
    }

    function closeSettingsHelpModal() {
        elements.settingsHelpModal.classList.remove('open');
        elements.settingsHelpModal.setAttribute('aria-hidden', 'true');
    }

    function toggleFaqPanel() {
        const expanded = elements.faqToggleBtn.getAttribute('aria-expanded') === 'true';
        const nextState = !expanded;
        elements.faqToggleBtn.setAttribute('aria-expanded', String(nextState));
        elements.faqPanel.hidden = !nextState;
    }

    function sortSessionsByRecent() {
        state.sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    function touchSession(session) {
        session.updatedAt = now();
        sortSessionsByRecent();
    }

    function getSessionById(sessionId) {
        return state.sessions.find((session) => session.id === sessionId) || null;
    }

    function getActiveSession() {
        return getSessionById(state.activeSessionId);
    }

    function createSession() {
        const timestamp = now();
        const session = {
            id: nextId('session'),
            title: '新しいチャット',
            createdAt: timestamp,
            updatedAt: timestamp,
            messages: [],
        };

        state.sessions.unshift(session);
        state.activeSessionId = session.id;
        saveActiveSession();
        saveSessions();
        renderHistory();
        return session;
    }

    function ensureActiveSession() {
        return getActiveSession() || createSession();
    }

    function setWelcomeMode(showWelcome) {
        elements.welcomeScreen.style.display = showWelcome ? '' : 'none';
        elements.messagesContainer.classList.toggle('active', !showWelcome);
        if (showWelcome) {
            elements.messagesContainer.innerHTML = '';
        }
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            elements.chatArea.scrollTop = elements.chatArea.scrollHeight;
        });
    }

    function setModelDropdown(open) {
        elements.modelSelector.classList.toggle('open', open);
        elements.modelDropdown.classList.toggle('open', open);
        elements.modelSelector.setAttribute('aria-expanded', String(open));
    }

    function setMobileSidebarOpen(open) {
        if (!isMobileLayout()) return;
        elements.sidebar.classList.toggle('open', open);
        elements.mobileBackdrop.classList.toggle('open', open);
    }

    function setSidebarCollapsed(collapsed) {
        if (isMobileLayout()) return;
        elements.sidebar.classList.toggle('collapsed', collapsed);
        saveSidebarState(collapsed);
    }

    function updateSendButtonState() {
        const hasContent = elements.messageInput.value.trim().length > 0;
        const hasFiles = state.pendingFiles.length > 0;
        const isTooLong = elements.messageInput.value.length > CONFIG.maxInputLength;

        if (state.isGenerating) {
            elements.sendBtn.disabled = false;
            elements.sendBtn.classList.add('generating');
            elements.sendBtn.setAttribute('aria-label', '生成を停止');
            elements.sendBtnIcon.textContent = 'stop';
            return;
        }

        elements.sendBtn.classList.remove('generating');
        elements.sendBtn.disabled = (!hasContent && !hasFiles) || isTooLong;
        elements.sendBtn.setAttribute('aria-label', '送信');
        elements.sendBtnIcon.textContent = 'arrow_upward';
    }

    function updateInputMetrics() {
        const length = elements.messageInput.value.length;
        const max = CONFIG.maxInputLength;

        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = `${Math.min(elements.messageInput.scrollHeight, 220)}px`;
        updateSendButtonState();
    }

    function showToast(text, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast${type === 'error' ? ' error' : ''}`;
        toast.textContent = text;

        elements.toastStack.appendChild(toast);

        window.setTimeout(() => {
            toast.classList.add('hide');
            window.setTimeout(() => toast.remove(), 220);
        }, CONFIG.toastDuration);
    }

    function createHistoryItem(session) {
        const item = document.createElement('div');
        item.className = `chat-history-item${session.id === state.activeSessionId ? ' active' : ''}`;
        item.dataset.sessionId = session.id;
        item.setAttribute('role', 'listitem');

        const main = document.createElement('div');
        main.className = 'history-main';

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined history-item-icon';
        icon.textContent = 'chat_bubble';

        const title = document.createElement('span');
        title.className = 'history-title';
        title.textContent = session.title;

        main.appendChild(icon);
        main.appendChild(title);

        const meta = document.createElement('span');
        meta.className = 'history-meta';
        meta.textContent = formatHistoryLabel(session.updatedAt);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'history-delete-btn';
        deleteBtn.dataset.action = 'delete-session';
        deleteBtn.dataset.sessionId = session.id;
        deleteBtn.title = '削除';
        deleteBtn.setAttribute('aria-label', 'チャットを削除');
        deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';

        item.appendChild(main);
        item.appendChild(meta);
        item.appendChild(deleteBtn);

        return item;
    }

    function renderHistory() {
        elements.chatHistory.innerHTML = '';

        if (state.sessions.length === 0) {
            elements.emptyHistory.classList.remove('hidden');
            return;
        }

        elements.emptyHistory.classList.add('hidden');
        state.sessions.forEach((session) => {
            elements.chatHistory.appendChild(createHistoryItem(session));
        });
    }

    function createMessageHtml(message) {
        const safeText = escapeHtml(message.text).replace(/\n/g, '<br>');
        const timeText = formatTime(message.createdAt);

        if (message.role === 'user') {
            let imagesHtml = '';
            if (message.images && message.images.length > 0) {
                imagesHtml = `<div class="message-images">${message.images.map((src) => `<img class="message-image" src="${src}" alt="添付画像" loading="lazy">`).join('')}</div>`;
            }
            let filesHtml = '';
            if (message.files && message.files.length > 0) {
                const fileList = message.files.map((f) => escapeHtml(f)).join(', ');
                filesHtml = `<div class="message-files"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">attach_file</span> ${fileList}</div>`;
            }
            const bubbleHtml = safeText ? `<div class="message-bubble user-bubble">${safeText}</div>` : '';
            return `
        <article class="message user" data-message-id="${message.id}">
          <div class="message-avatar user">N</div>
          <div class="message-content">
            <div class="message-meta">
              <span class="message-role">You</span>
              <time class="message-time">${timeText}</time>
            </div>
            ${imagesHtml}
            ${bubbleHtml}
            ${filesHtml}
          </div>
        </article>
      `;
        }

        const likeClass = message.reaction === 'like' ? 'active' : '';
        const dislikeClass = message.reaction === 'dislike' ? 'active' : '';

        return `
      <article class="message ai" data-message-id="${message.id}">
        <div class="message-avatar ai">${GEMINI_STAR_SVG}</div>
        <div class="message-content">
          <div class="message-meta">
            <span class="message-role">Gemini 42 Pro</span>
            <time class="message-time">${timeText}</time>
          </div>
          <div class="message-bubble ai-bubble">
            <div class="answer-number">42</div>
            <div class="answer-explanation">${safeText}</div>
          </div>
          <div class="message-actions">
            <button class="message-action-btn copy-btn" data-action="copy" data-message-id="${message.id}" title="コピー" aria-label="回答をコピー">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
            <button class="message-action-btn like-btn ${likeClass}" data-action="like" data-message-id="${message.id}" title="いいね" aria-label="いいね">
              <span class="material-symbols-outlined">thumb_up</span>
            </button>
            <button class="message-action-btn dislike-btn ${dislikeClass}" data-action="dislike" data-message-id="${message.id}" title="よくない" aria-label="よくない">
              <span class="material-symbols-outlined">thumb_down</span>
            </button>
            <button class="message-action-btn regen-btn" data-action="regenerate" data-message-id="${message.id}" title="再生成" aria-label="回答を再生成">
              <span class="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>
      </article>
    `;
    }

    function createTypingHtml() {
        const timestamp = formatTime(now());
        return `
      <article class="message ai" id="typingIndicator">
        <div class="message-avatar ai">${GEMINI_STAR_SVG}</div>
        <div class="message-content">
          <div class="message-meta">
            <span class="message-role">Gemini 42 Pro</span>
            <time class="message-time">${timestamp}</time>
          </div>
          <div class="message-bubble ai-bubble">
            <div class="typing-indicator">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>
      </article>
    `;
    }

    function appendMessage(message) {
        elements.messagesContainer.insertAdjacentHTML('beforeend', createMessageHtml(message));
    }

    function renderConversation() {
        const session = getActiveSession();

        if (!session || session.messages.length === 0) {
            setWelcomeMode(true);
            return;
        }

        setWelcomeMode(false);
        elements.messagesContainer.innerHTML = '';

        session.messages.forEach((message) => {
            elements.messagesContainer.insertAdjacentHTML('beforeend', createMessageHtml(message));
        });

        scrollToBottom();
    }

    function showTypingIndicator() {
        if (document.getElementById('typingIndicator')) return;
        elements.messagesContainer.insertAdjacentHTML('beforeend', createTypingHtml());
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    /* ── File Handling ── */

    function formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getFileIcon(file) {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type === 'application/pdf') return 'picture_as_pdf';
        if (file.type.startsWith('text/') || /\.(md|json|csv|yaml|yml)$/i.test(file.name)) return 'description';
        if (/\.(js|ts|py|java|css|html|xml)$/i.test(file.name)) return 'code';
        return 'attach_file';
    }

    function addFiles(fileList) {
        const newFiles = Array.from(fileList);
        if (newFiles.length === 0) return;

        state.pendingFiles.push(...newFiles);
        renderFilePreview();
        updateSendButtonState();
        showToast(`${newFiles.length} 件のファイルを追加しました`);
    }

    function removePendingFile(index) {
        if (index >= 0 && index < state.pendingFiles.length) {
            state.pendingFiles.splice(index, 1);
            renderFilePreview();
            updateSendButtonState();
        }
    }

    function clearPendingFiles() {
        state.pendingFiles = [];
        renderFilePreview();
        updateSendButtonState();
    }

    function renderFilePreview() {
        const strip = elements.filePreviewStrip;
        strip.innerHTML = '';

        if (state.pendingFiles.length === 0) {
            strip.classList.remove('has-files');
            return;
        }

        strip.classList.add('has-files');
        state.pendingFiles.forEach((file, i) => {
            const chip = document.createElement('div');

            if (file.type.startsWith('image/')) {
                chip.className = 'file-chip file-chip-image';
                const url = URL.createObjectURL(file);
                chip.innerHTML = `
                    <img class="file-chip-thumb" src="${url}" alt="${escapeHtml(file.name)}">
                    <button class="file-chip-remove" data-index="${i}" aria-label="削除" type="button">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                `;
            } else {
                const icon = getFileIcon(file);
                chip.className = 'file-chip';
                chip.innerHTML = `
                    <span class="material-symbols-outlined file-chip-icon">${icon}</span>
                    <span class="file-chip-name">${escapeHtml(file.name)}</span>
                    <span class="file-chip-size">${formatFileSize(file.size)}</span>
                    <button class="file-chip-remove" data-index="${i}" aria-label="削除" type="button">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                `;
            }
            strip.appendChild(chip);
        });
    }

    function showFileReadingIndicator() {
        if (document.getElementById('fileReadingIndicator')) return;
        const html = `
            <div id="fileReadingIndicator" class="file-reading-indicator">
                <div class="file-reading-spinner"></div>
                <span>ファイルを読み込んでいます…</span>
            </div>
        `;
        elements.messagesContainer.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function removeFileReadingIndicator() {
        const indicator = document.getElementById('fileReadingIndicator');
        if (indicator) indicator.remove();
    }

    function saveAll() {
        saveSessions();
        saveActiveSession();
    }

    function beginGeneration() {
        state.isGenerating = true;
        updateSendButtonState();
        showTypingIndicator();
    }

    function endGeneration() {
        state.isGenerating = false;
        state.generationTimer = null;
        updateSendButtonState();
    }

    function startAssistantResponse({ mode = 'append', targetMessageId = null, hasFiles = false } = {}) {
        beginGeneration();

        const sessionId = state.activeSessionId;

        function deliverAnswer() {
            removeTypingIndicator();
            removeFileReadingIndicator();

            const session = getSessionById(sessionId);
            if (!session) {
                endGeneration();
                return;
            }

            const aiMessage = {
                id: nextId('msg'),
                role: 'ai',
                text: getNextExplanation(),
                createdAt: now(),
                reaction: null,
            };

            if (mode === 'replace' && targetMessageId) {
                const index = session.messages.findIndex((message) => message.id === targetMessageId && message.role === 'ai');
                if (index >= 0) {
                    aiMessage.id = targetMessageId;
                    session.messages[index] = aiMessage;
                } else {
                    session.messages.push(aiMessage);
                }
            } else {
                session.messages.push(aiMessage);
            }

            touchSession(session);
            saveAll();
            renderHistory();

            if (session.id === state.activeSessionId) {
                if (mode === 'replace' && targetMessageId) {
                    renderConversation();
                } else {
                    appendMessage(aiMessage);
                    scrollToBottom();
                }
            }

            endGeneration();
        }

        if (hasFiles) {
            removeTypingIndicator();
            showFileReadingIndicator();
            state.generationTimer = window.setTimeout(() => {
                removeFileReadingIndicator();
                showTypingIndicator();
                scrollToBottom();
                state.generationTimer = window.setTimeout(deliverAnswer, getRandomDelay());
            }, 1200 + Math.random() * 800);
        } else {
            state.generationTimer = window.setTimeout(deliverAnswer, getRandomDelay());
        }
    }

    function stopGeneration(showMessage = true) {
        if (!state.isGenerating) return;

        if (state.generationTimer) {
            window.clearTimeout(state.generationTimer);
            state.generationTimer = null;
        }

        removeTypingIndicator();
        elements.messagesContainer.querySelectorAll('.message.regenerating').forEach((messageEl) => {
            messageEl.classList.remove('regenerating');
        });
        endGeneration();
        if (showMessage) {
            showToast('生成を停止しました');
        }
    }

    function sendMessage() {
        if (state.isGenerating) {
            stopGeneration();
            return;
        }

        const text = elements.messageInput.value.trim();
        const hasFiles = state.pendingFiles.length > 0;
        if (!text && !hasFiles) return;

        if (text.length > CONFIG.maxInputLength) {
            showToast(`入力は ${CONFIG.maxInputLength} 文字以内にしてください`, 'error');
            return;
        }

        const session = ensureActiveSession();

        /* Collect image data URLs for display in messages */
        const imageFiles = state.pendingFiles.filter((f) => f.type.startsWith('image/'));
        const nonImageFiles = state.pendingFiles.filter((f) => !f.type.startsWith('image/'));

        const readImageAsDataUrl = (file) =>
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            });

        Promise.all(imageFiles.map(readImageAsDataUrl)).then((imageDataUrls) => {
            const images = imageDataUrls.filter(Boolean);

            let displayText = text;

            const userMessage = {
                id: nextId('msg'),
                role: 'user',
                text: displayText,
                images: images.length > 0 ? images : undefined,
                files: nonImageFiles.length > 0 ? nonImageFiles.map((f) => f.name) : undefined,
                createdAt: now(),
                reaction: null,
            };

            session.messages.push(userMessage);
            if (session.messages.length === 1) {
                const titleSource = text || (imageFiles.length > 0 ? imageFiles[0].name : (nonImageFiles.length > 0 ? nonImageFiles[0].name : '新しいチャット'));
                session.title = deriveSessionTitle(titleSource);
            }

            touchSession(session);
            saveAll();
            renderHistory();

            if (session.id === state.activeSessionId) {
                setWelcomeMode(false);
                appendMessage(userMessage);
                scrollToBottom();
            }

            elements.messageInput.value = '';
            updateInputMetrics();

            startAssistantResponse({ hasFiles });
            clearPendingFiles();
        });
    }

    function createNewChat() {
        if (state.isGenerating) {
            stopGeneration(false);
        }

        state.activeSessionId = null;
        saveActiveSession();
        setWelcomeMode(true);
        renderHistory();

        elements.messageInput.value = '';
        clearPendingFiles();
        updateInputMetrics();
        elements.messageInput.focus();

        if (isMobileLayout()) {
            setMobileSidebarOpen(false);
        }
    }

    function setActiveSession(sessionId) {
        if (!sessionId || sessionId === state.activeSessionId) {
            if (isMobileLayout()) setMobileSidebarOpen(false);
            return;
        }

        if (!getSessionById(sessionId)) return;

        if (state.isGenerating) {
            stopGeneration(false);
        }

        state.activeSessionId = sessionId;
        saveActiveSession();
        renderHistory();
        renderConversation();

        if (isMobileLayout()) {
            setMobileSidebarOpen(false);
        }
    }

    function deleteSession(sessionId) {
        if (state.isGenerating && state.activeSessionId === sessionId) {
            stopGeneration(false);
        }

        const index = state.sessions.findIndex((session) => session.id === sessionId);
        if (index < 0) return;

        state.sessions.splice(index, 1);

        if (state.activeSessionId === sessionId) {
            state.activeSessionId = state.sessions[0]?.id ?? null;
        }

        saveAll();
        renderHistory();
        renderConversation();
        showToast('チャットを削除しました');
    }

    function copyAnswer(messageId, button) {
        const session = getActiveSession();
        if (!session) return;

        const message = session.messages.find((item) => item.id === messageId && item.role === 'ai');
        if (!message) return;

        const payload = `42\n${message.text}`;

        navigator.clipboard.writeText(payload)
            .then(() => {
                const icon = button.querySelector('.material-symbols-outlined');
                if (!icon) return;

                const original = icon.textContent;
                icon.textContent = 'check';
                button.classList.add('copied');
                showToast('回答をコピーしました');

                window.setTimeout(() => {
                    icon.textContent = original;
                    button.classList.remove('copied');
                }, 1200);
            })
            .catch(() => {
                showToast('コピーに失敗しました', 'error');
            });
    }

    function setReaction(messageId, reaction) {
        const session = getActiveSession();
        if (!session) return;

        const message = session.messages.find((item) => item.id === messageId && item.role === 'ai');
        if (!message) return;

        message.reaction = message.reaction === reaction ? null : reaction;
        touchSession(session);
        saveAll();

        const messageEl = [...elements.messagesContainer.querySelectorAll('.message')]
            .find((item) => item.dataset.messageId === messageId);

        if (!messageEl) return;

        const likeBtn = messageEl.querySelector('.like-btn');
        const dislikeBtn = messageEl.querySelector('.dislike-btn');

        if (likeBtn) likeBtn.classList.toggle('active', message.reaction === 'like');
        if (dislikeBtn) dislikeBtn.classList.toggle('active', message.reaction === 'dislike');
    }

    function regenerateAnswer(messageId) {
        if (state.isGenerating) return;

        const session = getActiveSession();
        if (!session) return;

        const message = session.messages.find((item) => item.id === messageId && item.role === 'ai');
        if (!message) return;

        const messageEl = [...elements.messagesContainer.querySelectorAll('.message')]
            .find((item) => item.dataset.messageId === messageId);

        if (messageEl) {
            messageEl.classList.add('regenerating');
        }

        startAssistantResponse({
            mode: 'replace',
            targetMessageId: messageId,
        });
    }

    function toggleDesktopSidebar() {
        if (isMobileLayout()) {
            setMobileSidebarOpen(!elements.sidebar.classList.contains('open'));
            return;
        }

        const willCollapse = !elements.sidebar.classList.contains('collapsed');
        setSidebarCollapsed(willCollapse);
    }

    function handleDocumentClick(event) {
        const clickInsideModel = elements.modelSelector.contains(event.target) || elements.modelDropdown.contains(event.target);
        if (!clickInsideModel) {
            setModelDropdown(false);
        }

        if (isMobileLayout()) {
            const clickInsideSidebar = elements.sidebar.contains(event.target);
            const clickToggle = elements.sidebarToggleMain.contains(event.target) || elements.menuToggle.contains(event.target);
            if (!clickInsideSidebar && !clickToggle) {
                setMobileSidebarOpen(false);
            }
        }
    }

    function handleHistoryClick(event) {
        const deleteButton = event.target.closest('[data-action="delete-session"]');
        if (deleteButton) {
            event.stopPropagation();
            deleteSession(deleteButton.dataset.sessionId);
            return;
        }

        const historyItem = event.target.closest('.chat-history-item');
        if (!historyItem) return;

        setActiveSession(historyItem.dataset.sessionId);
    }

    function handleMessageActionClick(event) {
        const button = event.target.closest('[data-action]');
        if (!button) return;

        const { action, messageId } = button.dataset;
        if (!messageId) return;

        if (action === 'copy') {
            copyAnswer(messageId, button);
            return;
        }

        if (action === 'like') {
            setReaction(messageId, 'like');
            return;
        }

        if (action === 'dislike') {
            setReaction(messageId, 'dislike');
            return;
        }

        if (action === 'regenerate') {
            regenerateAnswer(messageId);
        }
    }

    function handleSuggestionClick(event) {
        const chip = event.target.closest('.suggestion-chip');
        if (!chip) return;

        const query = chip.dataset.query || '';
        elements.messageInput.value = query;
        updateInputMetrics();
        sendMessage();
    }

    function bindEvents() {
        elements.menuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDesktopSidebar();
        });

        elements.sidebarToggleMain.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isMobileLayout()) {
                setMobileSidebarOpen(true);
            } else {
                setSidebarCollapsed(false);
            }
        });

        elements.mobileBackdrop.addEventListener('click', () => {
            setMobileSidebarOpen(false);
        });

        elements.modelSelector.addEventListener('click', (event) => {
            event.stopPropagation();
            const willOpen = !elements.modelDropdown.classList.contains('open');
            setModelDropdown(willOpen);
        });

        elements.newChatBtn.addEventListener('click', createNewChat);
        elements.newChatMain.addEventListener('click', createNewChat);
        elements.settingsHelpBtn.addEventListener('click', () => {
            openSettingsHelpModal();
            if (isMobileLayout()) {
                setMobileSidebarOpen(false);
            }
        });
        elements.settingsHelpClose.addEventListener('click', closeSettingsHelpModal);
        elements.settingsHelpModal.addEventListener('click', (event) => {
            if (event.target === elements.settingsHelpModal) {
                closeSettingsHelpModal();
            }
        });
        elements.themeOptionGroup.addEventListener('click', (event) => {
            const button = event.target.closest('[data-theme-option]');
            if (!button) return;
            const nextTheme = button.dataset.themeOption;
            applyThemePreference(nextTheme);
            showToast(`テーマを${button.textContent.trim()}に変更しました`);
        });
        elements.faqToggleBtn.addEventListener('click', toggleFaqPanel);
        elements.chatHistory.addEventListener('click', handleHistoryClick);
        elements.messagesContainer.addEventListener('click', handleMessageActionClick);
        elements.welcomeScreen.addEventListener('click', handleSuggestionClick);

        elements.messageInput.addEventListener('input', updateInputMetrics);
        elements.messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (!elements.sendBtn.disabled || state.isGenerating) {
                    sendMessage();
                }
            }
        });

        elements.sendBtn.addEventListener('click', sendMessage);

        elements.fileUploadBtn.addEventListener('click', () => {
            elements.fileInput.click();
        });

        elements.fileInput.addEventListener('change', () => {
            addFiles(elements.fileInput.files);
            elements.fileInput.value = '';
        });

        elements.filePreviewStrip.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.file-chip-remove');
            if (!removeBtn) return;
            const index = parseInt(removeBtn.dataset.index, 10);
            removePendingFile(index);
        });

        let dragCounter = 0;

        elements.chatArea.addEventListener('dragenter', (event) => {
            event.preventDefault();
            dragCounter += 1;
            elements.dropOverlay.classList.add('active');
        });

        elements.chatArea.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        elements.chatArea.addEventListener('dragleave', (event) => {
            event.preventDefault();
            dragCounter -= 1;
            if (dragCounter <= 0) {
                dragCounter = 0;
                elements.dropOverlay.classList.remove('active');
            }
        });

        elements.chatArea.addEventListener('drop', (event) => {
            event.preventDefault();
            dragCounter = 0;
            elements.dropOverlay.classList.remove('active');
            if (event.dataTransfer.files.length > 0) {
                addFiles(event.dataTransfer.files);
            }
        });

        document.addEventListener('click', handleDocumentClick);

        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                createNewChat();
            }

            if (event.key === 'Escape') {
                if (elements.settingsHelpModal.classList.contains('open')) {
                    closeSettingsHelpModal();
                    return;
                }

                if (elements.modelDropdown.classList.contains('open')) {
                    setModelDropdown(false);
                }

                if (isMobileLayout()) {
                    setMobileSidebarOpen(false);
                }
            }
        });

        if (systemThemeMedia) {
            if (typeof systemThemeMedia.addEventListener === 'function') {
                systemThemeMedia.addEventListener('change', handleSystemThemeChange);
            } else if (typeof systemThemeMedia.addListener === 'function') {
                systemThemeMedia.addListener(handleSystemThemeChange);
            }
        }

        window.addEventListener('resize', () => {
            if (!isMobileLayout()) {
                setMobileSidebarOpen(false);
                const sidebarState = loadSidebarState();
                setSidebarCollapsed(sidebarState === 'collapsed');
            } else {
                elements.sidebar.classList.remove('collapsed');
            }
        });
    }

    function restoreLayoutState() {
        if (!isMobileLayout()) {
            const sidebarState = loadSidebarState();
            if (sidebarState === 'collapsed') {
                elements.sidebar.classList.add('collapsed');
            }
        }
    }

    function init() {
        loadThemePreference();
        applyThemePreference(state.themePreference, { persist: false });
        loadFromStorage();
        restoreLayoutState();
        bindEvents();
        renderHistory();
        renderConversation();
        updateInputMetrics();
        elements.messageInput.focus();
    }

    init();
})();

