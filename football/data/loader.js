// ============================================================
// ЗАГРУЗЧИК ПРОГНОЗОВ
// ============================================================

let currentUser = null;
let appData = null;
let showingAllTables = false;
let showingBalance = false;
let showingFinance = false;

// ============================================================
// АВТОРИЗАЦИЯ
// ============================================================

async function loadPasswords() {
  try {
    const response = await fetch("./data/passwords.json?" + Date.now());
    if (!response.ok) {
      return {
        "Сугревин": "1234",
        "Романчугов": "5678",
        "Ишутов": "9012",
        "Мамедов": "3456",
        "Васин": "7890",
        "Романчугова": "2345",
        "Чвокин": "6789",
        "Колмыков": "0123"
      };
    }
    return await response.json();
  } catch (e) {
    return {
      "Сугревин": "1234",
      "Романчугов": "5678",
      "Ишутов": "9012",
      "Мамедов": "3456",
      "Васин": "7890",
      "Романчугова": "2345",
      "Чвокин": "6789",
      "Колмыков": "0123"
    };
  }
}

// Открыть модальное окно
function showLoginModal() {
  document.getElementById("login-modal").style.display = "flex";
  document.getElementById("login-password").value = "";
  document.getElementById("login-error").style.display = "none";
}

// Закрыть модальное окно
function closeLoginModal() {
  document.getElementById("login-modal").style.display = "none";
}

// Показать итоговый баланс
function showFinalBalance() {
  showingBalance = true;
  showingFinance = false;
  showingAllTables = false;
  
  document.getElementById("user-predictions-wrapper").style.display = "none";
  document.getElementById("all-tables").style.display = "none";
  document.getElementById("finance-wrapper").style.display = "none";
  document.getElementById("final-balance-wrapper").style.display = "block";
  
  if (appData) {
    const money = calculateMoneyTable(appData.matches, appData.predictions, appData.realScores, appData.users);
    renderFinalResults(money, appData.users);
  }
}

// Закрыть итоговый баланс
function closeFinalBalance() {
  showingBalance = false;
  document.getElementById("final-balance-wrapper").style.display = "none";
  document.getElementById("user-predictions-wrapper").style.display = "block";
}

// Показать финансы
function showFinance() {
  showingFinance = true;
  showingBalance = false;
  showingAllTables = false;
  
  document.getElementById("user-predictions-wrapper").style.display = "none";
  document.getElementById("all-tables").style.display = "none";
  document.getElementById("final-balance-wrapper").style.display = "none";
  document.getElementById("finance-wrapper").style.display = "block";
  
  if (appData) {
    const money = calculateMoneyTable(appData.matches, appData.predictions, appData.realScores, appData.users);
    renderMoneyTable(money, appData.users);
  }
}

// Закрыть финансы
function closeFinance() {
  showingFinance = false;
  document.getElementById("finance-wrapper").style.display = "none";
  document.getElementById("user-predictions-wrapper").style.display = "block";
}

// Показать все таблицы (без личных прогнозов, без баланса, без финансов)
function showAllTables() {
  showingAllTables = true;
  showingBalance = false;
  showingFinance = false;
  
  document.getElementById("user-predictions-wrapper").style.display = "none";
  document.getElementById("final-balance-wrapper").style.display = "none";
  document.getElementById("finance-wrapper").style.display = "none";
  document.getElementById("all-tables").style.display = "block";
  document.getElementById("back-to-my-btn").style.display = "block";
  
  if (appData) {
    buildAllTables(appData);
  }
}

// Показать мои прогнозы
function showMyPredictions() {
  showingAllTables = false;
  showingBalance = false;
  showingFinance = false;
  
  document.getElementById("user-predictions-wrapper").style.display = "block";
  document.getElementById("all-tables").style.display = "none";
  document.getElementById("final-balance-wrapper").style.display = "none";
  document.getElementById("finance-wrapper").style.display = "none";
  document.getElementById("back-to-my-btn").style.display = "none";
}

// Построить все общие таблицы (без баланса и финансов)
function buildAllTables(data) {
  if (typeof buildTable === "function") {
    buildTable(data);
  }
  if (typeof renderScoresTable === "function") {
    const stats = calculateScoresWithUsers(data.matches, data.predictions, data.realScores, data.users);
    renderScoresTable(stats, data.users);
  }
  if (typeof updateStageSummaryRows === "function") {
    updateStageSummaryRows(data.matches, data.predictions, data.realScores, data.users);
  }
}

// Вход
async function login() {
  const name = document.getElementById("login-name").value;
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");

  if (!name) {
    errorEl.textContent = "❌ Выберите имя";
    errorEl.style.display = "block";
    return;
  }

  const passwords = await loadPasswords();

  if (passwords[name] && passwords[name] === password) {
    currentUser = name;
    errorEl.style.display = "none";
    closeLoginModal();
    
    document.getElementById("user-name-display").textContent = name;
    document.getElementById("user-info").style.display = "flex";
    document.getElementById("login-btn").style.display = "none";
    
    document.getElementById("user-predictions-wrapper").style.display = "block";
    document.getElementById("show-all-btn").style.display = "inline-block";
    document.getElementById("show-balance-btn").style.display = "inline-block";
    document.getElementById("show-finance-btn").style.display = "inline-block";
    
    document.getElementById("all-tables").style.display = "none";
    document.getElementById("final-balance-wrapper").style.display = "none";
    document.getElementById("finance-wrapper").style.display = "none";
    document.getElementById("back-to-my-btn").style.display = "none";
    
    showingAllTables = false;
    showingBalance = false;
    showingFinance = false;
    
    await loadAppData();
    console.log(`✅ ${name} вошёл в систему`);
  } else {
    errorEl.textContent = "❌ Неверный пароль";
    errorEl.style.display = "block";
  }
}

// Выход
function logout() {
  currentUser = null;
  showingAllTables = false;
  showingBalance = false;
  showingFinance = false;
  
  document.getElementById("user-info").style.display = "none";
  document.getElementById("login-btn").style.display = "block";
  document.getElementById("user-predictions-wrapper").style.display = "none";
  document.getElementById("all-tables").style.display = "block";
  document.getElementById("final-balance-wrapper").style.display = "none";
  document.getElementById("finance-wrapper").style.display = "none";
  document.getElementById("back-to-my-btn").style.display = "none";
  document.getElementById("show-all-btn").style.display = "none";
  document.getElementById("show-balance-btn").style.display = "none";
  document.getElementById("show-finance-btn").style.display = "none";
  
  document.getElementById("user-predictions").innerHTML = '<p style="color: #999; text-align: center;">👤 Войдите, чтобы увидеть свои прогнозы</p>';
  console.log("👋 Выход из системы");
}

document.addEventListener("click", function(e) {
  const modal = document.getElementById("login-modal");
  if (e.target === modal) {
    closeLoginModal();
  }
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeLoginModal();
  }
});

async function initLoginForm() {
  const select = document.getElementById("login-name");
  if (!select) return;

  try {
    const response = await fetch("./data/users.json?" + Date.now());
    const users = response.ok ? await response.json() : ["Сугревин", "Романчугов", "Ишутов", "Мамедов", "Васин", "Романчугова", "Чвокин", "Колмыков"];
    
    select.innerHTML = '<option value="">Выберите имя</option>';
    users.forEach(function(user) {
      const option = document.createElement("option");
      option.value = user;
      option.textContent = user;
      select.appendChild(option);
    });
  } catch (e) {
    console.error("❌ Ошибка загрузки пользователей:", e);
  }
}

// ============================================================
// ЗАГРУЗКА ДАННЫХ
// ============================================================

async function loadAppData() {
  try {
    const basePath = "./data/";
    const [matchesRes, predictionsRes, usersRes, realScoresRes] = await Promise.all([
      fetch(basePath + "matches.json?" + Date.now()),
      fetch(basePath + "predictions.json?" + Date.now()),
      fetch(basePath + "users.json?" + Date.now()),
      fetch(basePath + "real-scores.json?" + Date.now())
    ]);

    const [matches, predictions, users, realScores] = await Promise.all([
      matchesRes.json(),
      predictionsRes.json(),
      usersRes.json(),
      realScoresRes.json()
    ]);

    appData = { matches, predictions, users, realScores };
    displayUserPredictions();
    
  } catch (error) {
    console.error("❌ Ошибка загрузки данных:", error);
  }
}

// ============================================================
// ОТОБРАЖЕНИЕ ПРОГНОЗОВ ПОЛЬЗОВАТЕЛЯ
// ============================================================

function displayUserPredictions() {
  const container = document.getElementById("user-predictions");
  
  if (!appData || !currentUser) {
    container.innerHTML = '<p style="color: #999; text-align: center;">👤 Войдите, чтобы увидеть свои прогнозы</p>';
    return;
  }

  const { matches, predictions, users } = appData;
  const userIndex = users.indexOf(currentUser);
  
  if (userIndex === -1) {
    container.innerHTML = '<p style="color: #999; text-align: center;">⚠️ Пользователь не найден</p>';
    return;
  }

  let totalExact = 0;
  let totalWin = 0;
  let totalLoss = 0;
  let totalMatches = 0;

  let html = '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">';
  html += `<thead><tr>
    <th style="background: #1a2a6c; color: #ffd900; padding: 10px; text-align: left; border-radius: 8px 0 0 0;">Матч</th>
    <th style="background: #1a2a6c; color: #ffd900; padding: 10px; text-align: center;">Ваш прогноз</th>
    <th style="background: #1a2a6c; color: #ffd900; padding: 10px; text-align: center;">Реальный счёт</th>
    <th style="background: #1a2a6c; color: #ffd900; padding: 10px; text-align: center; border-radius: 0 8px 0 0;">Результат</th>
  </tr></thead><tbody>`;

  matches.forEach(function(matchName, index) {
    if (typeof UTILS !== "undefined" && UTILS.isStageHeader(matchName)) {
      html += `<tr><td colspan="4" style="background: #eef2f7; padding: 8px 12px; font-weight: 700; color: #1a2a6c; border-bottom: 2px solid #1a2a6c;">${matchName}</td></tr>`;
      return;
    }

    totalMatches++;
    const prediction = predictions[index]?.[userIndex] || "";
    const realScore = appData.realScores[index] || "";

    let resultText = "—";
    let resultColor = "#999";
    let resultIcon = "⏳";

    if (realScore && typeof getPredictionType === "function") {
      const type = getPredictionType(prediction, realScore, matchName);
      if (type === "exact") {
        resultText = "ТОЧНО!";
        resultColor = "#4caf50";
        resultIcon = "✅";
        totalExact++;
      } else if (type === "win") {
        resultText = "Победа";
        resultColor = "#ff9800";
        resultIcon = "✅";
        totalWin++;
      } else {
        resultText = "Не угадал";
        resultColor = "#f44336";
        resultIcon = "❌";
        totalLoss++;
      }
    } else if (!realScore) {
      resultText = "Ожидание";
      resultColor = "#999";
      resultIcon = "⏳";
    }

    html += `<tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e0e0e0;">${matchName}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e0e0e0; text-align: center; font-weight: 700;">${prediction || "—"}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${realScore || "—"}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e0e0e0; text-align: center; color: ${resultColor}; font-weight: 700;">${resultIcon} ${resultText}</td>
    </tr>`;
  });

  const percent = totalMatches > 0 ? Math.round((totalExact + totalWin) / totalMatches * 100) : 0;
  
  html += `<tr style="background: #e8f5e9; font-weight: 700;">
    <td colspan="3" style="padding: 10px 12px; text-align: right; border-radius: 0 0 0 8px;">
      📊 Итого: ${totalMatches} матчей
    </td>
    <td style="padding: 10px 12px; text-align: center; border-radius: 0 0 8px 0;">
      ✅ ${totalExact} точных | ✅ ${totalWin} побед | ❌ ${totalLoss} поражений
      <br><span style="font-size: 12px; color: #666;">Успешность: ${percent}%</span>
    </td>
  </tr>`;

  html += "</tbody></table>";
  container.innerHTML = html;
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
  initLoginForm();
  
  document.getElementById("user-predictions-wrapper").style.display = "none";
  document.getElementById("all-tables").style.display = "block";
  document.getElementById("final-balance-wrapper").style.display = "none";
  document.getElementById("finance-wrapper").style.display = "none";
  document.getElementById("back-to-my-btn").style.display = "none";
  document.getElementById("show-all-btn").style.display = "none";
  document.getElementById("show-balance-btn").style.display = "none";
  document.getElementById("show-finance-btn").style.display = "none";
});