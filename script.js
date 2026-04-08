const CONFESSION_STEPS = [
  {
    label: "Step 1 of 3",
    text: "I've been wanting to say this for a long time...",
    mode: "fade",
  },
  {
    label: "Step 2 of 3",
    text: "Every time I see you, something feels different.",
    mode: "type",
  },
  {
    label: "Final Reveal",
    text: "I LIKE YOU <span class=\"heart\">❤</span>",
    mode: "final",
  },
];

// Edit this value to personalize the hidden code.
const SECRET_CODE = "moonlight";

const confessionButton = document.getElementById("confessionButton");
const messagePanel = document.getElementById("messagePanel");
const messageLabel = document.getElementById("messageLabel");
const messageText = document.getElementById("messageText");
const progressDots = document.querySelectorAll(".progress__dot");
const musicToggle = document.getElementById("musicToggle");
const backgroundMusic = document.getElementById("backgroundMusic");
const heartBurst = document.getElementById("heartBurst");

const secretTrigger = document.getElementById("secretTrigger");
const secretModal = document.getElementById("secretModal");
const modalClose = document.getElementById("modalClose");
const secretForm = document.getElementById("secretForm");
const secretInput = document.getElementById("secretInput");
const secretFeedback = document.getElementById("secretFeedback");

let currentStep = -1;
let typingTimeout = null;
let isTyping = false;
let typedText = "";
let lastFocusedElement = null;

confessionButton.addEventListener("click", handleConfessionClick);
musicToggle.addEventListener("click", toggleMusic);
backgroundMusic.volume = 0.55;
backgroundMusic.addEventListener("pause", syncMusicButtonState);
backgroundMusic.addEventListener("play", syncMusicButtonState);

secretTrigger.addEventListener("click", openSecretModal);
modalClose.addEventListener("click", closeSecretModal);
secretModal.addEventListener("click", (event) => {
  if (event.target.dataset.closeModal === "true") {
    closeSecretModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !secretModal.hidden) {
    closeSecretModal();
  }
});

secretForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const attempt = secretInput.value.trim().toLowerCase();
  const isCorrect = attempt === SECRET_CODE.toLowerCase();

  secretFeedback.textContent = isCorrect
    ? "You found it... I really like you."
    : "That's not the right code. Try again.";
  secretFeedback.classList.toggle("is-success", isCorrect);
  secretFeedback.classList.toggle("is-error", !isCorrect);

  if (isCorrect) {
    secretInput.value = "";
  }
});

function handleConfessionClick() {
  if (isTyping) {
    finishTyping();
    return;
  }

  if (currentStep >= CONFESSION_STEPS.length - 1) {
    resetConfession();
    return;
  }

  currentStep += 1;
  renderStep(currentStep);
}

function renderStep(stepIndex) {
  const step = CONFESSION_STEPS[stepIndex];

  if (!step) {
    return;
  }

  messagePanel.hidden = false;
  messagePanel.classList.remove("slide-up");
  void messagePanel.offsetWidth;
  messagePanel.classList.add("slide-up");

  clearTypewriter();
  messageLabel.textContent = step.label;
  messageText.className = "message-panel__text";

  updateProgress(stepIndex);
  updateButtonLabel(stepIndex);

  if (step.mode === "type") {
    startTypewriter(step.text);
    return;
  }

  if (step.mode === "final") {
    messageText.classList.add("is-final", "slide-up");
    messageText.innerHTML = step.text;
    launchHeartBurst();
    return;
  }

  messageText.classList.add("slide-up");
  messageText.textContent = step.text;
}

function startTypewriter(text) {
  typedText = text;
  isTyping = true;
  messageText.classList.add("is-typing");
  messageText.textContent = "";

  let charIndex = 0;

  const typeNext = () => {
    messageText.textContent = text.slice(0, charIndex);
    charIndex += 1;

    if (charIndex <= text.length) {
      typingTimeout = window.setTimeout(typeNext, 38);
      return;
    }

    isTyping = false;
    messageText.classList.remove("is-typing");
  };

  typeNext();
}

function finishTyping() {
  clearTypewriter();
  messageText.textContent = typedText;
  messageText.classList.remove("is-typing");
}

function clearTypewriter() {
  if (typingTimeout) {
    window.clearTimeout(typingTimeout);
    typingTimeout = null;
  }

  isTyping = false;
}

function updateProgress(activeIndex) {
  progressDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index <= activeIndex);
  });
}

function updateButtonLabel(stepIndex) {
  const labels = ["Tell me more", "One more thing", "Read it again"];
  confessionButton.textContent = labels[stepIndex] || "Click me";
}

function resetConfession() {
  currentStep = -1;
  clearTypewriter();
  typedText = "";
  messagePanel.hidden = true;
  messageText.className = "message-panel__text";
  messageText.textContent = "";
  messageLabel.textContent = "Step 1 of 3";
  confessionButton.textContent = "Click me";
  updateProgress(-1);
}

function openSecretModal() {
  lastFocusedElement = document.activeElement;
  secretModal.hidden = false;
  document.body.classList.add("modal-open");
  secretFeedback.textContent = "";
  secretFeedback.className = "modal__feedback";
  secretInput.value = "";
  window.setTimeout(() => secretInput.focus(), 30);
}

function closeSecretModal() {
  secretModal.hidden = true;
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

async function toggleMusic() {
  const shouldPlay = !musicToggle.classList.contains("is-playing");

  if (shouldPlay) {
    await playBackgroundMusic();
    return;
  }

  pauseBackgroundMusic();
}

function setMusicButtonState(isPlaying) {
  musicToggle.textContent = isPlaying ? "Pause Music" : "Play Music";
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

async function playBackgroundMusic() {
  try {
    await backgroundMusic.play();
  } catch (error) {
    setMusicButtonState(false);
    musicToggle.textContent = "Tap Again";
  }
}

function pauseBackgroundMusic() {
  backgroundMusic.pause();
}

function syncMusicButtonState() {
  setMusicButtonState(!backgroundMusic.paused);
}

function launchHeartBurst() {
  const heartCount = 12;

  for (let index = 0; index < heartCount; index += 1) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.textContent = "❤";
    heart.style.setProperty("--left", `${18 + Math.random() * 64}%`);
    heart.style.setProperty("--x", `${-4 + Math.random() * 8}rem`);
    heart.style.setProperty("--rotate", `${-35 + Math.random() * 70}deg`);
    heart.style.animationDelay = `${index * 0.05}s`;

    heartBurst.appendChild(heart);

    window.setTimeout(() => {
      heart.remove();
    }, 1900);
  }
}
