(function () {
    const MORSE = {
        A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
        K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
        U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
        0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
        ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
        "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.",
        "$": "...-..-", "@": ".--.-."
    };

    const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
    const PLAY_BUTTON_CLASS = "morse-play-button";
    const BUZZER_SRC = "assets/extremely-loud-incorrect-buzzer_0cDaG20.mp3";

    let currentPlayback = null;
    let audioContext = null;

    const buzzer = new Audio(BUZZER_SRC);
    buzzer.preload = "auto";
    let pendingConfirmTrigger = null;
    let swapIntervalId = null;
    let spawnIntervalId = null;
    let adIntervalId = null;

    const confirmModal = document.getElementById("confirm-modal");
    const confirmActions = document.getElementById("confirm-actions");

    function playBuzzer() {
        buzzer.currentTime = 0;
        buzzer.play();
    }

    function randomizeConfirmChoices() {
        if (!confirmActions) {
            return;
        }

        const choices = Array.from(confirmActions.querySelectorAll("[data-confirm-option]"));
        if (choices.length !== 2) {
            return;
        }

        if (Math.random() < 0.5) {
            confirmActions.appendChild(choices[0]);
            confirmActions.appendChild(choices[1]);
        } else {
            confirmActions.appendChild(choices[1]);
            confirmActions.appendChild(choices[0]);
        }
    }

    function randomizeChoiceContainer(container) {
        const choices = Array.from(container.querySelectorAll("[data-confirm-option]"));
        if (choices.length !== 2) {
            return;
        }

        if (Math.random() < 0.5) {
            container.appendChild(choices[0]);
            container.appendChild(choices[1]);
        } else {
            container.appendChild(choices[1]);
            container.appendChild(choices[0]);
        }
    }

    function clearPromptChaos() {
        if (swapIntervalId) {
            window.clearInterval(swapIntervalId);
            swapIntervalId = null;
        }

        if (spawnIntervalId) {
            window.clearInterval(spawnIntervalId);
            spawnIntervalId = null;
        }

        for (const decoy of document.querySelectorAll(".confirm-panel-decoy")) {
            decoy.remove();
        }
    }

    function randomPromptPosition(panel) {
        const vw = Math.max(window.innerWidth, 360);
        const vh = Math.max(window.innerHeight, 360);
        const maxX = Math.max(20, vw - 300);
        const maxY = Math.max(20, vh - 180);

        panel.style.left = Math.floor(Math.random() * maxX) + "px";
        panel.style.top = Math.floor(Math.random() * maxY) + "px";
        panel.style.transform = "rotate(" + (Math.random() * 18 - 9).toFixed(1) + "deg)";
    }

    function spawnDecoyPrompt() {
        if (!confirmModal) {
            return;
        }

        const decoy = document.createElement("div");
        decoy.className = "confirm-panel confirm-panel-decoy";
        decoy.dataset.confirmControl = "true";
        decoy.innerHTML =
            '<p class="confirm-title" data-confirm-control="true">Are you sure?</p>' +
            '<div class="confirm-actions" data-confirm-control="true">' +
            '<button type="button" class="confirm-choice" data-confirm-option="yes" data-confirm-control="true">Yes</button>' +
            '<button type="button" class="confirm-choice" data-confirm-option="no" data-confirm-control="true">No</button>' +
            "</div>";

        randomPromptPosition(decoy);
        confirmModal.appendChild(decoy);
        randomizeChoiceContainer(decoy.querySelector(".confirm-actions"));

        const allDecoys = Array.from(document.querySelectorAll(".confirm-panel-decoy"));
        if (allDecoys.length > 14) {
            allDecoys[0].remove();
        }
    }

    function startPromptChaos() {
        clearPromptChaos();

        swapIntervalId = window.setInterval(function () {
            randomizeConfirmChoices();

            for (const actionRow of document.querySelectorAll(".confirm-panel-decoy .confirm-actions")) {
                randomizeChoiceContainer(actionRow);
            }
        }, 320);

        spawnIntervalId = window.setInterval(function () {
            spawnDecoyPrompt();

            for (const decoy of document.querySelectorAll(".confirm-panel-decoy")) {
                if (Math.random() < 0.35) {
                    randomPromptPosition(decoy);
                }
            }
        }, 520);
    }

    function openConfirmModal(triggerEl) {
        if (!confirmModal) {
            return false;
        }

        pendingConfirmTrigger = triggerEl || null;
        randomizeConfirmChoices();
        confirmModal.classList.remove("is-hidden");
        startPromptChaos();
        return true;
    }

    function closeConfirmModal() {
        if (!confirmModal) {
            return;
        }

        clearPromptChaos();
        pendingConfirmTrigger = null;
        confirmModal.classList.add("is-hidden");
    }

    // Ad pop-up functions
    const adMessages = [
        "🎉 CONGRATULATIONS! You won $1,000,000! Click here to claim!",
        "🚨 VIRUS DETECTED! Your computer is infected! Download our antivirus NOW!",
        "📱 FREE IPHONE! Sign up for our newsletter and get a free iPhone 15!",
        "💰 MAKE MONEY FAST! Work from home and earn $5000/day!",
        "🔥 HOT DEAL! 90% off all products! Limited time only!",
        "⚠️ BROWSER UPDATE REQUIRED! Your browser is outdated. Update now!",
        "🎮 FREE GAMES! Download our gaming app and play unlimited games!",
        "💳 CREDIT CARD OFFER! Get approved instantly with bad credit!",
        "🏠 BUY A HOUSE! No down payment required! Apply today!",
        "💊 LOSE WEIGHT FAST! Miracle diet pills - lose 50lbs in 1 week!",
        "🚨 SYSTEM WARNING! Your session will expire in 5 minutes!",
        "💻 FREE TECH SUPPORT! Call now for instant help!",
        "🎯 YOU'VE BEEN SELECTED! Special VIP membership offer!",
        "📢 BREAKING NEWS! Major announcement - don't miss out!",
        "🔒 SECURITY ALERT! Your account needs verification!"
    ];

    function createAdPopup(message) {
        const isUrgent = Math.random() < 0.3; // 30% chance of urgent styling
        const adModal = document.createElement("div");
        adModal.className = "ad-modal" + (isUrgent ? " ad-urgent" : "");
        adModal.innerHTML = `
            <div class="ad-panel">
                <button class="ad-close" type="button">✕</button>
                <p class="ad-title">${isUrgent ? "⚠️ URGENT ALERT ⚠️" : "IMPORTANT MESSAGE"}</p>
                <p class="ad-message">${message}</p>
                <button class="ad-claim" type="button">${isUrgent ? "ACT NOW!" : "CLAIM NOW!"}</button>
            </div>
        `;

        // Random position
        const vw = Math.max(window.innerWidth, 360);
        const vh = Math.max(window.innerHeight, 360);
        const maxX = Math.max(20, vw - 350);
        const maxY = Math.max(20, vh - 250);
        adModal.style.left = Math.floor(Math.random() * maxX) + "px";
        adModal.style.top = Math.floor(Math.random() * maxY) + "px";
        adModal.style.transform = "rotate(" + (Math.random() * 10 - 5).toFixed(1) + "deg)";

        document.body.appendChild(adModal);

        // Add event listeners
        const closeBtn = adModal.querySelector(".ad-close");
        const claimBtn = adModal.querySelector(".ad-claim");

        closeBtn.addEventListener("click", () => {
            adModal.remove();
            playBuzzer();
        });

        claimBtn.addEventListener("click", () => {
            playBuzzer();
            // Create another ad popup as "punishment"
            setTimeout(() => createAdPopup("🎉 THANK YOU! Here's another amazing offer just for you!"), 500);
            adModal.remove();
        });

        // Auto remove after 10 seconds (15 for urgent)
        setTimeout(() => {
            if (adModal.parentNode) {
                adModal.remove();
            }
        }, isUrgent ? 15000 : 10000);

        return adModal;
    }

    function startAdSpam() {
        adIntervalId = window.setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every 3 seconds
                const randomMessage = adMessages[Math.floor(Math.random() * adMessages.length)];
                createAdPopup(randomMessage);
            }
        }, 3000);
    }

    function stopAdSpam() {
        if (adIntervalId) {
            window.clearInterval(adIntervalId);
            adIntervalId = null;
        }
    }

    function isPasswordMismatch(form) {
        const passwordInput = form.querySelector("#password");
        const confirmPasswordInput = form.querySelector("#confirm-password");

        if (!passwordInput || !confirmPasswordInput) {
            return false;
        }

        return passwordInput.value !== confirmPasswordInput.value;
    }

    function hasEmptyRequiredField(form) {
        const requiredFields = form.querySelectorAll("input[required], select[required], textarea[required]");
        for (const field of requiredFields) {
            if ((field.value || "").trim() === "") {
                return true;
            }
        }

        return false;
    }

    function getFormValidationIssue(form) {
        if (hasEmptyRequiredField(form)) {
            return "empty";
        }

        if (isPasswordMismatch(form)) {
            return "mismatch";
        }

        return null;
    }

    function applyLoginErrorStateFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        if (!error) {
            return;
        }

        const loginError = document.querySelector("[data-login-error]");
        if (!loginError) {
            return;
        }

        if (error === "empty") {
            loginError.textContent = "You made a mistake. Fill in all fields.";
        } else if (error === "mismatch" || error === "mistake") {
            loginError.textContent = "You made a mistake. Passwords did not match.";
        } else {
            loginError.textContent = "You made a mistake.";
        }
        loginError.classList.remove("is-hidden");
    }

    function toMorse(text) {
        const out = [];
        let lastWasSpace = false;

        for (const ch of text) {
            if (/\s/.test(ch)) {
                if (!lastWasSpace) {
                    out.push("/");
                }
                lastWasSpace = true;
                continue;
            }

            lastWasSpace = false;
            const upper = ch.toUpperCase();
            out.push(MORSE[upper] || ch);
        }

        return out.join(" ");
    }

    function shouldConvertNode(node) {
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName)) {
            return false;
        }

        if (parent.classList.contains(PLAY_BUTTON_CLASS)) {
            return false;
        }

        if (!node.nodeValue || !node.nodeValue.trim()) {
            return false;
        }

        return /[A-Za-z0-9]/.test(node.nodeValue);
    }

    function convertTextNodes(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let current = walker.nextNode();

        while (current) {
            textNodes.push(current);
            current = walker.nextNode();
        }

        for (const node of textNodes) {
            if (!shouldConvertNode(node)) {
                continue;
            }

            node.nodeValue = toMorse(node.nodeValue);
            if (node.parentElement) {
                node.parentElement.classList.add("morse-render");
            }
        }
    }

    function ensureElementId(el) {
        if (el.id) {
            return el.id;
        }

        el.id = "morse-target-" + Math.random().toString(36).slice(2, 10);
        return el.id;
    }

    function addPlayButtons(root) {
        const targetRoot = root || document;
        const candidates = [];

        if (targetRoot.nodeType === Node.ELEMENT_NODE && targetRoot.classList.contains("morse-render")) {
            candidates.push(targetRoot);
        }

        for (const el of targetRoot.querySelectorAll(".morse-render")) {
            candidates.push(el);
        }

        for (const el of candidates) {
            if (el.classList.contains(PLAY_BUTTON_CLASS)) {
                continue;
            }

            if (el.dataset.morsePlayable === "true") {
                continue;
            }

            const text = (el.textContent || "").trim();
            if (!text || !/[.-]/.test(text)) {
                continue;
            }

            const targetId = ensureElementId(el);
            const button = document.createElement("button");
            button.type = "button";
            button.className = PLAY_BUTTON_CLASS;
            button.dataset.targetId = targetId;
            button.setAttribute("aria-label", "Play Morse code for this text");
            button.textContent = "▶";

            el.insertAdjacentElement("afterend", button);
            el.dataset.morsePlayable = "true";
        }
    }

    function getAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        return audioContext;
    }

    function getMorseTokens(text) {
        const cleaned = text.replace(/[^.\-\/\s]/g, " ").replace(/\s+/g, " ").trim();
        return cleaned ? cleaned.split(" ") : [];
    }

    function playMorseText(text) {
        const tokens = getMorseTokens(text);
        if (!tokens.length) {
            return;
        }

        const ctx = getAudioContext();
        if (ctx.state === "suspended") {
            ctx.resume();
        }

        if (currentPlayback) {
            currentPlayback.stop();
            currentPlayback = null;
        }

        const unit = 0.1;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 620;
        gain.gain.value = 0;

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        let t = ctx.currentTime + 0.03;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (!token || token === "/") {
                continue;
            }

            for (let j = 0; j < token.length; j++) {
                const symbol = token[j];
                if (symbol !== "." && symbol !== "-") {
                    continue;
                }

                const duration = symbol === "-" ? 3 * unit : unit;
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.setValueAtTime(0, t + duration);
                t += duration;

                if (j < token.length - 1) {
                    t += unit;
                }
            }

            if (i < tokens.length - 1) {
                const next = tokens[i + 1];
                t += next === "/" ? 7 * unit : 3 * unit;
            }
        }

        oscillator.start(ctx.currentTime);
        oscillator.stop(t + 0.05);
        currentPlayback = oscillator;
        oscillator.onended = function () {
            if (currentPlayback === oscillator) {
                currentPlayback = null;
            }
        };
    }

    function findYesNoControl(target) {
        const control = target.closest("button, a, input[type='button'], input[type='submit']");
        if (!control) {
            return null;
        }

        const label = (control.textContent || control.value || "").trim().toLowerCase();
        if (label === "yes" || label === "no") {
            return control;
        }

        return null;
    }

    document.addEventListener("click", function (event) {
        const yesNoControl = findYesNoControl(event.target);
        if (yesNoControl) {
            playBuzzer();
            // Extra ad popup for clicking yes/no
            setTimeout(() => createAdPopup("🎯 GREAT CHOICE! But wait, there's more!"), 200);
        }

        const confirmChoice = event.target.closest("[data-confirm-option]");
        if (confirmChoice) {
            const option = (confirmChoice.getAttribute("data-confirm-option") || "").toLowerCase();
            if (option === "yes") {
                event.preventDefault();
                const targetForm = pendingConfirmTrigger ? pendingConfirmTrigger.closest("form") : null;
                if (targetForm) {
                    const issue = getFormValidationIssue(targetForm);
                    if (issue) {
                        closeConfirmModal();
                        window.location.assign(new URL("login.html?error=" + encodeURIComponent(issue), window.location.href).toString());
                        return;
                    }

                    closeConfirmModal();
                    window.location.assign(new URL("login.html", window.location.href).toString());
                    return;
                }

                const yesUrl = confirmChoice.getAttribute("href") || confirmChoice.dataset.confirmYesUrl;
                if (yesUrl) {
                    window.location.assign(new URL(yesUrl, window.location.href).toString());
                }
                return;
            }

            event.preventDefault();
            closeConfirmModal();
            return;
        }

        const morsePlayButton = event.target.closest("." + PLAY_BUTTON_CLASS);
        if (morsePlayButton) {
            event.preventDefault();

            const targetId = morsePlayButton.dataset.targetId;
            if (targetId) {
                const target = document.getElementById(targetId);
                if (target) {
                    playMorseText(target.textContent || "");
                }
            }
            return;
        }

        // Add pop-ups for input clicks
        if (event.target.matches("input, textarea, select")) {
            if (Math.random() < 0.4) { // 40% chance
                setTimeout(() => createAdPopup("📝 DID YOU KNOW? You can earn money by filling forms online!"), 300);
            }
        }

        // Add pop-ups for button clicks
        if (event.target.matches("button") && !event.target.classList.contains("ad-close") && !event.target.classList.contains("ad-claim")) {
            if (Math.random() < 0.3) { // 30% chance
                setTimeout(() => createAdPopup("🚀 BOOST YOUR PRODUCTIVITY! Try our premium button clicking service!"), 400);
            }
        }

        if (!confirmModal) {
            playBuzzer();
            return;
        }

        const confirmTrigger = event.target.closest("[data-confirm-trigger='true']");
        if (confirmTrigger && confirmTrigger.dataset.confirmControl !== "true") {
            playBuzzer();
            event.preventDefault();
            event.stopImmediatePropagation();
            openConfirmModal(confirmTrigger);
            return;
        }

        playBuzzer();
    });

    function processSubtree(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (parent) {
                convertTextNodes(parent);
                addPlayButtons(parent);
            }
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        convertTextNodes(node);
        addPlayButtons(node.parentElement || document);
    }

    convertTextNodes(document.body);
    addPlayButtons(document);
    applyLoginErrorStateFromQuery();
    startAdSpam();

    // Welcome ad popup after 2 seconds
    setTimeout(() => {
        createAdPopup("🎊 WELCOME TO OUR AWESOME SITE! Don't forget to subscribe for daily deals!");
    }, 2000);

    const observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                    processSubtree(node);
                }
            }

            if (mutation.type === "characterData" && mutation.target) {
                processSubtree(mutation.target);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Add exit intent popup
    let exitIntentShown = false;
    document.addEventListener("mouseleave", (e) => {
        if (e.clientY < 0 && !exitIntentShown) {
            exitIntentShown = true;
            createAdPopup("😢 DON'T LEAVE YET! Here's a special offer just for you!");
        }
    });

    // Add scroll-triggered popups
    let scrollPopupCount = 0;
    window.addEventListener("scroll", () => {
        if (scrollPopupCount < 3 && Math.random() < 0.1) { // 10% chance, max 3 times
            scrollPopupCount++;
            setTimeout(() => createAdPopup("📜 SCROLLING TIP: Did you know scrolling can burn calories? Keep going!"), 500);
        }
    });

    // Add focus-triggered popups for inputs
    document.addEventListener("focusin", (e) => {
        if (e.target.matches("input, textarea")) {
            if (Math.random() < 0.2) { // 20% chance
                setTimeout(() => createAdPopup("✍️ TYPING TIP: Did you know fast typists earn more money? Practice now!"), 300);
            }
        }
    });
})();
