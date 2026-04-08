const CONFESSION_STEPS = [
  {
    label: "Step 1 of 4",
    text: "Wala gyud nako tuyoa nga ma-fall ko nimo.",
    mode: "fade",
  },
  {
    label: "Step 2 of 4",
    text: "Sa tinuod lang, wala gyud ko nag-expect nga maabot ko ani nga punto. Gilikayan na nako halos tanang babae, labi na kanang kabalo ko nga possible ko ma-inlove.\n\nPero unsaon man nako\u2026 ikaw man gud.",
    mode: "type",
  },
  {
    label: "Step 3 of 4",
    text: "Sa una, friend ra gyud akong tan-aw nimo. Wala koy lain nga intensyon. Pero kadugayan, sa matag istorya nato, sa matag katawa, na inlab nako nimo.\n\nWala ko kabantay nga nalahi na diay akong pagbati nimo.\n\nKung dili ta magkaistorya, murag naay kulang sa akong adlaw. Kung makita tika, kalit ra ko malipay.\n\nUg karon\u2026 dili na nako kaya i-deny.\n\nNa inlab nako nimo.\n\nDili tuyo, dili plano\u2026 pero tinuod.",
    mode: "fade",
  },
  {
    label: "Final Step",
    text: "NA INLAB NAKO NIMO <span class=\"heart\">&#10084;&#65039;</span>",
    mode: "final",
  },
];

const SECRET_CODE = "gugma";

const confessionButton = document.getElementById("confessionButton");
const storyPanel = document.getElementById("storyPanel");
const storyStep = document.getElementById("storyStep");
const storyText = document.getElementById("storyText");
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

backgroundMusic.volume = 0.55;

confessionButton.addEventListener("click", handleConfessionClick);
musicToggle.addEventListener("click", toggleMusic);
backgroundMusic.addEventListener("play", syncMusicButtonState);
backgroundMusic.addEventListener("pause", syncMusicButtonState);

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
    ? "Ikaw gyud akong gusto."
    : "Dili sakto ang code. Sulayi pag-usab.";
  secretFeedback.classList.toggle("is-success", isCorrect);
  secretFeedback.classList.toggle("is-error", !isCorrect);

  if (isCorrect) {
    secretInput.value = "";
    launchHeartBurst();
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

  storyPanel.hidden = false;
  storyPanel.classList.remove("slide-up");
  void storyPanel.offsetWidth;
  storyPanel.classList.add("slide-up");

  clearTypewriter();
  storyStep.textContent = step.label;
  storyText.className = "story-panel__text";

  updateProgress(stepIndex);
  updateButtonLabel(stepIndex);

  if (step.mode === "type") {
    startTypewriter(step.text);
    return;
  }

  if (step.mode === "final") {
    storyText.classList.add("is-final", "slide-up");
    storyText.innerHTML = step.text;
    launchHeartBurst();
    return;
  }

  storyText.classList.add("slide-up");
  storyText.textContent = step.text;
}

function startTypewriter(text) {
  typedText = text;
  isTyping = true;
  storyText.classList.add("is-typing");
  storyText.textContent = "";

  let charIndex = 0;

  const typeNext = () => {
    storyText.textContent = text.slice(0, charIndex);
    charIndex += 1;

    if (charIndex <= text.length) {
      typingTimeout = window.setTimeout(typeNext, 24);
      return;
    }

    isTyping = false;
    storyText.classList.remove("is-typing");
  };

  typeNext();
}

function finishTyping() {
  clearTypewriter();
  storyText.textContent = typedText;
  storyText.classList.remove("is-typing");
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
  if (stepIndex < CONFESSION_STEPS.length - 1) {
    confessionButton.textContent = stepIndex === -1 ? "Click me" : "Next";
    return;
  }

  confessionButton.textContent = "Sugdi pag-usab";
}

function resetConfession() {
  currentStep = -1;
  clearTypewriter();
  typedText = "";
  storyPanel.hidden = true;
  storyText.className = "story-panel__text";
  storyText.textContent = "";
  storyStep.textContent = "Step 1 of 4";
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

function setMusicButtonState(isPlaying) {
  musicToggle.textContent = isPlaying ? "Pause Music" : "Play Music";
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

function launchHeartBurst() {
  const heartCount = 12;

  for (let index = 0; index < heartCount; index += 1) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.textContent = "\u2764";
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
