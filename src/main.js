const welcomeScreen = document.getElementById("welcome-screen");
const searchScreen = document.getElementById("search-screen");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const mainForm = document.getElementById("main-form");
const checkBtn = document.getElementById("check-btn");
const progressBlock = document.getElementById("progress-block");
const resultCard = document.getElementById("result-card");
const resultText = document.getElementById("result-text");
const resultMeta = document.getElementById("result-meta");

const departureInput = document.getElementById("station-departure");
const arrivalInput = document.getElementById("station-arrival");
const dateInput = document.getElementById("date");
const trainInput = document.getElementById("train-number");
const carriageInput = document.getElementById("carriage-number");
const typeInput = document.getElementById("carriage-type");
const placeInput = document.getElementById("place-number");

let progressTimeoutId = null;

function showScreen(screenId) {
  if (!welcomeScreen || !searchScreen) return;

  if (screenId === "welcome") {
    welcomeScreen.classList.add("screen-active");
    searchScreen.classList.remove("screen-active");
  } else {
    searchScreen.classList.add("screen-active");
    welcomeScreen.classList.remove("screen-active");
  }
}

function showProgress() {
  if (!progressBlock || !checkBtn) return;
  progressBlock.classList.add("progress-block-visible");
  resultCard && resultCard.classList.remove("result-card-visible");
  checkBtn.disabled = true;
}

function hideProgress() {
  if (!progressBlock || !checkBtn) return;
  progressBlock.classList.remove("progress-block-visible");
  checkBtn.disabled = false;
}

function showResult() {
  if (!resultCard) return;

  const from = departureInput?.value?.trim() || "станции отправления";
  const to = arrivalInput?.value?.trim() || "станции прибытия";

  const train = trainInput?.value?.trim() || "поезд";
  const carriage = carriageInput?.value?.trim() || "вагон";
  const place = placeInput?.value?.trim() || "место";
  const type = typeInput?.value?.trim();
  const date = dateInput?.value;

  const dateToShow = date
    ? new Date(date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  if (resultText) {
    resultText.textContent = `Место свободно от ${from} до ${to}.`;
  }

  if (resultMeta) {
    const parts = [];
    if (dateToShow) parts.push(dateToShow);
    if (type) parts.push(type);
    parts.push(`${train} · вагон ${carriage} · место ${place}`);
    resultMeta.textContent = parts.join(" · ");
  }

  resultCard.classList.add("result-card-visible");
}

function handleSearchSubmit(event) {
  event.preventDefault();

  if (progressTimeoutId) {
    clearTimeout(progressTimeoutId);
  }

  showProgress();

  // Имитируем поиск 1.4 секунды
  progressTimeoutId = setTimeout(() => {
    hideProgress();
    showResult();
  }, 1400);
}

if (startBtn) {
  startBtn.addEventListener("click", () => {
    showScreen("search");
    setTimeout(() => {
      departureInput?.focus();
    }, 220);
  });
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    showScreen("welcome");
  });
}

if (mainForm) {
  mainForm.addEventListener("submit", handleSearchSubmit);
}

// Инициализация Telegram WebApp темы, если доступна
// (на дизайн влияет через CSS-переменные, здесь просто безопасно обращаемся к API)
try {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
  }
} catch {
  // ignore
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}
const processChangeInput = debounce((input) => getStationName(input))

async function getStationName(input) {
    if (!input) return;
    if (input.length < 3) return;
    const url = "http://localhost:5196/search";
    try {
        const response = await fetch(url + "?name=" + encodeURIComponent(input));
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error(error.message);
        throw new Error(`Error: ${error.message}`);
    }
}


departureInput.addEventListener("input", (event) => {
    console.log(departureInput.value);
    processChangeInput(event.target.value);
});