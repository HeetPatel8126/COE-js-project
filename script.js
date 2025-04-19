let timeLeft = 60;
let timer;
let isRunning = false;
let difficulty = "easy";
let totalTyped = 0;
let correctTyped = 0;
let errors = 0;
let startTime;
let currentSentence = "";
let sentences = {};

const sentenceEl = document.getElementById("sentence");
const inputEl = document.getElementById("input");
const progressBar = document.getElementById("progressBar");
const resultEl = document.getElementById("result");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const errorsEl = document.getElementById("errors");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.querySelector(".theme-toggle i");

async function loadSentences() {
  try {
    const res = await fetch("sentences.json");
    sentences = await res.json();
  } catch (err) {
    console.error("Failed to load sentences.json:", err);
  }
}

function initGame() {
  totalTyped = 0;
  correctTyped = 0;
  errors = 0;
  isRunning = false;
  inputEl.value = '';
  inputEl.disabled = true;
  inputEl.classList.remove('correct', 'incorrect');
  progressBar.style.width = '0%';
  resultEl.textContent = '';
  resultEl.className = '';
  timeEl.textContent = timeLeft;
  wpmEl.textContent = '0';
  accuracyEl.textContent = '100%';
  errorsEl.textContent = '0';
  resetBtn.disabled = true;
}

function startGame() {
  if (isRunning || !sentences[difficulty]?.length) return;

  switch (difficulty) {
    case "easy":
      timeLeft = 30;
      break;
    case "medium":
      timeLeft = 45;
      break;
    case "hard":
      timeLeft = 60;
      break;
    default:
      timeLeft = 60;
  }

  initGame();
  timeEl.textContent = timeLeft;
  isRunning = true;
  resetBtn.disabled = false;
  inputEl.disabled = false;
  inputEl.focus();

  const sentenceList = sentences[difficulty];
  currentSentence =
    sentenceList[Math.floor(Math.random() * sentenceList.length)];
  sentenceEl.textContent = currentSentence;

  startTime = new Date().getTime();
  timer = setInterval(updateTimer, 1000);

  document.querySelector(".buttons button:first-child").innerHTML =
    '<i class="fas fa-running"></i> Racing...';
  document.querySelector(".buttons button:first-child").disabled = true;
}

function updateTimer() {
  timeLeft--;
  timeEl.textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}

function endGame() {
  clearInterval(timer);
  isRunning = false;
  inputEl.disabled = true;

  const timeInMinutes = (60 - timeLeft) / 60;
  const wpm = calculateWPM(totalTyped, timeInMinutes);
  const accuracy = calculateAccuracy(totalTyped, errors);

  wpmEl.textContent = Math.round(wpm);
  accuracyEl.textContent = `${accuracy}%`;
  resultEl.textContent = `You typed at ${Math.round(
    wpm
  )} WPM with ${accuracy}% accuracy!`;
  resultEl.className = "success";

  if (wpm > 40 && accuracy > 90) {
    createConfetti();
  }

  document.querySelector(".buttons button:first-child").innerHTML =
    '<i class="fas fa-play"></i> Start';
  document.querySelector(".buttons button:first-child").disabled = false;
}

function resetGame() {
  clearInterval(timer);
  initGame();
  sentenceEl.textContent = 'Click "Start Race" to begin';
}

function setDifficulty(level) {
  difficulty = level;
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

function calculateWPM(charsTyped, timeInMinutes) {
  return charsTyped / 5 / timeInMinutes;
}

function calculateAccuracy(totalChars, errors) {
  if (totalChars === 0) return 100;
  return Math.round(((totalChars - errors) / totalChars) * 100);
}

function createConfetti() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    themeToggle.classList.replace("fa-moon", "fa-sun");
  } else {
    themeToggle.classList.replace("fa-sun", "fa-moon");
  }
}

inputEl.addEventListener("input", (e) => {
  if (!isRunning) return;

  const inputText = e.target.value;
  const currentChar = inputText[inputText.length - 1];
  const expectedChar = currentSentence[inputText.length - 1];

  if (currentChar === expectedChar) {
    inputEl.classList.remove("incorrect");
    inputEl.classList.add("correct");
    correctTyped++;
  } else {
    inputEl.classList.remove("correct");
    inputEl.classList.add("incorrect");
    errors++;
    errorsEl.textContent = errors;
  }

  totalTyped++;
  const progress = (inputText.length / currentSentence.length) * 100;
  progressBar.style.width = `${Math.min(progress, 100)}%`;

  const timeElapsed = (new Date().getTime() - startTime) / 60000;
  const currentWPM = calculateWPM(correctTyped, timeElapsed);
  const currentAccuracy = calculateAccuracy(totalTyped, errors);
  wpmEl.textContent = Math.round(currentWPM);
  accuracyEl.textContent = `${currentAccuracy}%`;

  if (inputText.length === currentSentence.length) endGame();
});

// Load sentences on page load
window.addEventListener("DOMContentLoaded", async () => {
  await loadSentences();
  initGame();
});
