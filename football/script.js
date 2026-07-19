// Глобальное хранилище данных после загрузки
let appData = null;

/**
 * Загрузка JSON-файлов параллельно.
 */
async function loadData() {
  const basePath = "./data/";
  try {
    const [matchesRes, predictionsRes, usersRes, realScoresRes] =
      await Promise.all([
        fetch(basePath + "matches.json"),
        fetch(basePath + "predictions.json"),
        fetch(basePath + "users.json"),
        fetch(basePath + "real-scores.json"),
      ]);

    if (
      !matchesRes.ok ||
      !predictionsRes.ok ||
      !usersRes.ok ||
      !realScoresRes.ok
    ) {
      throw new Error("Ошибка HTTP при загрузке одного из JSON файлов");
    }

    return Promise.all([
      matchesRes.json(),
      predictionsRes.json(),
      usersRes.json(),
      realScoresRes.json(),
    ]).then(([matches, predictions, users, realScores]) => ({
      matches,
      predictions,
      users,
      realScores,
    }));
  } catch (error) {
    console.error("loadData error:", error);
    throw error;
  }
}

function isStageHeader(text) {
  if (!text) return false;
  const t = String(text).trim().toLowerCase();
  const triggers = [
    "финал", "1/", "четвертьфинал", "полуфинал", 
    "чемпион", "место", "отборочный", "групповой", "стадия", "раунд", "этап"
  ];
  return triggers.some(trigger => t.includes(trigger));
}

function isChampionStage(stageName) {
  if (!stageName) return false;
  const t = String(stageName).trim().toLowerCase();
  return t.includes("чемпион");
}

function parseScore(scoreStr) {
  if (!scoreStr) return null;
  const s = scoreStr.trim();
  if (s === "") return null;
  const parts = s.split(/[-:]/).map(x => x.trim());
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const a = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  return [h, a];
}

function getPredictionType(prediction, realScore, matchName) {
  if (!prediction || !realScore) return "lose";
  const cleanName = String(matchName || "").toLowerCase();
  const isTextMatch = cleanName.includes("чемпион") || cleanName.includes("кто победит") || cleanName.includes("победитель");

  if (isTextMatch) {
    const pNorm = (prediction || "").trim().toLowerCase();
    const rNorm = realScore.trim().toLowerCase();
    return pNorm && pNorm === rNorm ? "exact" : "lose";
  }

  const pParts = parseScore(prediction);
  const rParts = parseScore(realScore);
  if (!pParts || !rParts) return "lose";

  const pH = parseInt(pParts[0], 10);
  const pA = parseInt(pParts[1], 10);
  const rH = parseInt(rParts[0], 10);
  const rA = parseInt(rParts[1], 10);

  if (Number.isNaN(pH) || Number.isNaN(pA) || Number.isNaN(rH) || Number.isNaN(rA)) {
    return "lose";
  }

  if (pH === rH && pA === rA) return "exact";

  const pWin = pH === pA ? 0 : pH > pA ? 1 : 2;
  const rWin = rH === rA ? 0 : rH > rA ? 1 : 2;

  return pWin === rWin ? "win" : "lose";
}

function getResultClass(prediction, realScore, matchName) {
  if (!realScore || realScore.trim() === "") {
    return "result-cell-neutral";
  }
  const type = getPredictionType(prediction, realScore, matchName);
  if (type === "exact") return "exact-win";
  if (type === "win") return "team-win";
  return "loss";
}

function calculateScoresWithUsers(matches, predictions, realScores, users) {
  const userStats = {};
  users.forEach(user => {
    userStats[user] = { points: 0, exact: 0, wins: 0, losses: 0, draws: 0 };
  });

  matches.forEach((matchName, index) => {
    if (isStageHeader(matchName)) return;
    const realScore = realScores[index];
    if (!realScore) return;

    const cleanName = String(matchName).toLowerCase();
    const isTextMatch = cleanName.includes("чемпион") || cleanName.includes("кто победит") || cleanName.includes("победитель");

    if (isTextMatch) {
      const actualWinner = realScore.trim().toLowerCase();
      if (!actualWinner) return;
      const userPredictions = predictions[index] || [];
      users.forEach((user, userIdx) => {
        const prediction = (userPredictions[userIdx] || "").trim().toLowerCase();
        if (prediction && prediction === actualWinner) {
          userStats[user].points += 3;
          userStats[user].exact++;
        } else {
          userStats[user].losses++;
        }
      });
      return;
    }

    const rParts = parseScore(realScore);
    if (!rParts) return;
    const [rH, rA] = rParts;
    const rWin = rH === rA ? 0 : rH > rA ? 1 : 2;
    const userPredictions = predictions[index] || [];

    users.forEach((user, userIdx) => {
      const prediction = userPredictions[userIdx];
      if (!prediction) {
        userStats[user].losses++;
        return;
      }
      const pParts = parseScore(prediction);
      if (!pParts) {
        userStats[user].losses++;
        return;
      }
      const pH = parseInt(pParts[0], 10);
      const pA = parseInt(pParts[1], 10);
      if (Number.isNaN(pH) || Number.isNaN(pA)) {
        userStats[user].losses++;
        return;
      }
      const pWin = pH === pA ? 0 : pH > pA ? 1 : 2;

      if (pH === rH && pA === rA) {
        userStats[user].points += 3;
        userStats[user].exact++;
      } else if (pWin === rWin) {
        userStats[user].points += 1;
        if (rWin === 0) userStats[user].draws++;
        else userStats[user].wins++;
      } else {
        userStats[user].losses++;
      }
    });
  });
  return userStats;
}

function calcMatchChange(type, exactCount, winCount, loserCount, isChampionStage) {
  let change = 0;
  if (isChampionStage) {
    if (type === "exact") {
      change = loserCount * 100;
    } else {
      change = -(exactCount * 100);
    }
    return change;
  }

  if (exactCount > 0) {
    if (type === "exact") {
      change += winCount * 10;
      change += loserCount * 20;
    } else if (type === "win") {
      change -= exactCount * 10;
      change += loserCount * 10;
    } else {
      change -= exactCount * 20 + winCount * 10;
    }
  } else if (winCount > 0) {
    if (type === "win") {
      change += loserCount * 10;
    } else {
      change -= winCount * 10;
    }
  }
  return change;
}

function calculateMoneyTable(matches, predictions, realScores, users) {
  const result = {};
  users.forEach(u => {
    result[u] = { total: 0, stages: {} };
  });
  let currentStage = "Общий";

  matches.forEach((matchName, idx) => {
    if (isStageHeader(matchName)) {
      currentStage = matchName.trim();
      return;
    }
    const realScore = realScores[idx];
    if (!realScore) return;
    const isChampStage = isChampionStage(currentStage);

    let rWin = null;
    if (!isChampStage) {
      const rParts = parseScore(realScore);
      if (!rParts) return;
      const [rH, rA] = rParts;
      rWin = rH === rA ? 0 : rH > rA ? 1 : 2;
    }

    const userPredictions = predictions[idx] || [];
    const guesses = users.map((u, i) => {
      const pred = userPredictions[i];
      const type = getPredictionType(pred, realScore, matchName);
      return { user: u, type };
    });

    const exactGuessers = guesses.filter(g => g.type === "exact");
    const winGuessers = guesses.filter(g => g.type === "win");
    const losers = guesses.filter(g => g.type === "lose");

    const countExact = exactGuessers.length;
    const countWin = winGuessers.length;
    const countLosers = losers.length;

    guesses.forEach(g => {
      const change = calcMatchChange(g.type, countExact, countWin, countLosers, isChampStage);
      result[g.user].total += change;
      if (!result[g.user].stages[currentStage]) {
        result[g.user].stages[currentStage] = 0;
      }
      result[g.user].stages[currentStage] += change;
    });
  });
  return result;
}

/**
 * Готовит данные о деньгах по этапам для отображения в строках-суммаризаторах.
 */
function getStageMoneyForDisplay(matches, predictions, realScores, users) {
  const moneyData = calculateMoneyTable(matches, predictions, realScores, users);
  const stageMoney = {};

  users.forEach((user) => {
    Object.entries(moneyData[user].stages).forEach(([stage, value]) => {
      if (!stageMoney[stage]) {
        stageMoney[stage] = {};
      }
      stageMoney[stage][user] = value;
    });
  });

  return stageMoney;
}

function renderMoneyTable(data, users) {
  const container = document.getElementById("money-container");
  if (!container) return;
  const allStages = new Set();
  users.forEach(u => Object.keys(data[u].stages).forEach(st => allStages.add(st)));
  const stagesList = Array.from(allStages);

  const table = document.createElement("table");
  table.className = "money-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headers = ["Место", "Участник"];
  stagesList.forEach(st => headers.push(st));
  headers.push("Итого (₽)");
  headers.forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const sortedUsers = [...users].sort((a, b) => data[b].total - data[a].total);
  sortedUsers.forEach((user, index) => {
    const rowData = data[user];
    const tr = document.createElement("tr");
    const tdPlace = document.createElement("td");
    tdPlace.textContent = index + 1;
    tr.appendChild(tdPlace);
    const tdUser = document.createElement("td");
    tdUser.textContent = user;
    tr.appendChild(tdUser);
    stagesList.forEach(stage => {
      const val = rowData.stages[stage] || 0;
      const td = document.createElement("td");
      td.textContent = val;
      if (val > 0) td.classList.add("money-cell-positive");
      else if (val < 0) td.classList.add("money-cell-negative");
      else td.classList.add("money-cell-zero");
      tr.appendChild(td);
    });
    const totalTd = document.createElement("td");
    totalTd.textContent = rowData.total;
    if (rowData.total > 0) totalTd.classList.add("money-cell-positive");
    else if (rowData.total < 0) totalTd.classList.add("money-cell-negative");
    else totalTd.classList.add("money-cell-zero");
    tr.appendChild(totalTd);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = "";
  container.appendChild(table);
}

function formatMoneyValue(value) {
  if (value > 0) return `+${value} ₽`;
  if (value < 0) return `${value} ₽`;
  return `0 ₽`;
}

function updateStageSummaryRows(matches, predictions, realScores, users) {
  const stageMoney = getStageMoneyForDisplay(matches, predictions, realScores, users);
  const rows = document.querySelectorAll(".stage-summary-row");
  rows.forEach(row => {
    const stageName = row.dataset.stage;
    users.forEach(user => {
      const td = row.querySelector(`.stage-money-cell[data-user="${user}"]`);
      if (!td) return;
      const val = stageMoney[stageName]?.[user] || 0;
      td.textContent = formatMoneyValue(val);
      td.classList.remove("money-cell-positive", "money-cell-negative", "money-cell-zero");
      if (val > 0) td.classList.add("money-cell-positive");
      else if (val < 0) td.classList.add("money-cell-negative");
      else td.classList.add("money-cell-zero");
    });
  });
}

function renderScoresTable(userStats, users) {
  const container = document.getElementById("scores-container");
  if (!container) return;
  const sortedUsers = [...users].sort((a, b) => {
    if (userStats[b].points !== userStats[a].points) {
      return userStats[b].points - userStats[a].points;
    }
    return userStats[b].exact - userStats[a].exact;
  });
  const table = document.createElement("table");
  table.className = "standings-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Место", "Участник", "Очки", "Точные", "Победы", "Ничьи", "Поражения"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  sortedUsers.forEach((user, index) => {
    const stats = userStats[user];
    const tr = document.createElement("tr");
    [index + 1, user, stats.points, stats.exact, stats.wins, stats.draws, stats.losses].forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    if (index === 0) {
      tr.style.fontWeight = "bold";
      tr.style.backgroundColor = "#e8f5e9";
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = "";
  container.appendChild(table);
}

function getCurrentStageForMatch(index, matches) {
  let stage = "Общий";
  for (let i = 0; i <= index; i++) {
    if (isStageHeader(matches[i])) {
      stage = matches[i].trim();
    }
  }
  return stage;
}
function buildTable(data) {
  const { matches, predictions, users, realScores } = data;
  const table = document.getElementById("predictions-table");
  if (!table) return;

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Заголовки
  const thMatch = document.createElement("th");
  thMatch.textContent = "Матч / Этап";
  headerRow.appendChild(thMatch);

  const thScore = document.createElement("th");
  thScore.textContent = "Реальный счёт";
  headerRow.appendChild(thScore);

  users.forEach(user => {
    const th = document.createElement("th");
    th.textContent = user;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.innerHTML = "";
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  matches.forEach((matchName, index) => {
    const tr = document.createElement("tr");

    // Строка заголовка этапа с суммами денег
    if (isStageHeader(matchName)) {
      tr.className = "stage-summary-row";
      tr.dataset.stage = matchName.trim();

      const stageMoney = getStageMoneyForDisplay(matches, predictions, realScores, users);
      const stageName = matchName.trim();

      const tdStage = document.createElement("td");
      tdStage.className = "stage-header stage-title-cell";
      tdStage.textContent = stageName;
      tr.appendChild(tdStage);

      const tdScore = document.createElement("td");
      tdScore.className = "stage-header stage-score-empty";
      tdScore.textContent = "";
      tr.appendChild(tdScore);

      users.forEach(user => {
        const val = stageMoney[stageName]?.[user] || 0;
        const td = document.createElement("td");
        td.className = "stage-header stage-money-cell";
        td.dataset.user = user;
        td.textContent = formatMoneyValue(val);
        if (val > 0) td.classList.add("money-cell-positive");
        else if (val < 0) td.classList.add("money-cell-negative");
        else td.classList.add("money-cell-zero");
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
      return;
    }

    // Ячейка названия матча
    const tdMatch = document.createElement("td");
    tdMatch.textContent = matchName;
    tr.appendChild(tdMatch);

    // Инпут реального счёта
    const tdScore = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "real-score-input";
    input.value = realScores[index] || "";
    
    input.onchange = (e) => {
      realScores[index] = e.target.value.trim();
      updateRowColors(tr, index, matches, predictions, realScores, users);
      
      const stats = calculateScoresWithUsers(matches, predictions, realScores, users);
      renderScoresTable(stats, users);

      const money = calculateMoneyTable(matches, predictions, realScores, users);
      renderMoneyTable(money, users);

      updateStageSummaryRows(matches, predictions, realScores, users);
    };

    // Защита инпута от закрытия глобальным кликом по body
    input.addEventListener('mousedown', function(e) {
      e.stopPropagation();
    });
    input.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
    });

    tdScore.appendChild(input);
    tr.appendChild(tdScore);

     // Ячейки прогнозов пользователей
    const userPredictions = predictions[index] || [];
    users.forEach((userName, userIndex) => {
      const td = document.createElement("td");
      const card = document.createElement("div");

      const realScore = realScores[index];
      const hasResult = realScore && realScore.trim() !== "";
      const userPrediction = userPredictions[userIndex];
      const hasPrediction = userPrediction && userPrediction.trim() !== "";

      /* --- ИСПРАВЛЕНИЕ: Добавляем класс .has-tooltip для работы делегата --- */
      card.className = `result-cell ${getResultClass(userPrediction, realScore, matchName)} has-tooltip`;
      
      if (!hasResult) {
        card.textContent = hasPrediction ? userPrediction : "—";
      } else {
        card.textContent = hasPrediction ? userPrediction : "—";
      }

      // --- ЕДИНЫЙ КЛИК ПО ЯЧЕЙКЕ ДЛЯ ВСПЛЫВАШКИ ---
      card.addEventListener("click", (event) => {
        window.lastClickedCell = event.target; 
  
        event.stopPropagation(); // ВАЖНО: останавливаем всплытие до документа

        const inputEl = tr.querySelector(".real-score-input");
        const scoreVal = inputEl ? inputEl.value.trim() : "";

        if (!scoreVal) {
          showTooltip(card, "Счёт ещё не задан");
          return;
        }

        const currentStage = getCurrentStageForMatch(index, matches);
        const isChampStage = isChampionStage(currentStage);

        let exactGuessers = [], winGuessers = [], losers = [];
        
        if (isChampStage) {
          const actualWinner = scoreVal.toLowerCase();
          users.forEach((u, i) => {
            const p = (predictions[index] || [])[i] || "";
            const pNorm = p.trim().toLowerCase();
            const t = pNorm && pNorm === actualWinner ? "exact" : "lose";
            if (t === "exact") exactGuessers.push({ user: u, type: t });
            else losers.push({ user: u, type: t });
          });
        } else {
          const matchResult = parseScore(scoreVal);
          if (!matchResult) {
            showTooltip(card, "Неверный формат счёта (нужно: 2-1 или 2:1)");
            return;
          }
          const [rH, rA] = matchResult;
          const rWin = rH === rA ? 0 : rH > rA ? 1 : 2;
          users.forEach((u, i) => {
            const p = (predictions[index] || [])[i];
            const t = getPredictionType(p, scoreVal, matchName);
            if (t === "exact") exactGuessers.push({ user: u, type: t });
            else if (t === "win") winGuessers.push({ user: u, type: t });
            else losers.push({ user: u, type: t });
          });
        }

        const countExact = exactGuessers.length;
        const countWin = winGuessers.length;
        const countLosers = losers.length;

        let netResult = 0;
        const myPred = userPredictions[userIndex];
        const myType = isChampStage 
          ? ((myPred?.trim().toLowerCase() === scoreVal.toLowerCase()) ? "exact" : "lose")
          : getPredictionType(myPred, scoreVal, matchName);

        if (isChampStage) {
          if (myType === "exact") netResult = countLosers * 100;
          else netResult = -(countExact * 100);
        } else {
          if (countExact > 0) {
            if (myType === "exact") {
              netResult += countWin * 10 + countLosers * 20;
            } else if (myType === "win") {
              netResult -= countExact * 10;
              netResult += countLosers * 10;
            } else {
              netResult -= countExact * 20 + countWin * 10;
            }
          } else if (countWin > 0) {
            if (myType === "win") {
              netResult += countLosers * 10;
            } else {
              netResult -= countWin * 10;
            }
          }
        }

        const sign = netResult >= 0 ? "+" : "";
        showTooltip(card, `За этот матч: ${sign}${netResult} ₽`);
      });

      td.appendChild(card);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

/**
 * Перемещает тултип к новой цели.
 * Используется при прокрутке страницы.
 */
function updateTooltipPosition(targetEl) {
  if (!tooltip || !targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const scrollY = window.pageYOffset;
  const scrollX = window.pageXOffset;

  // Те же самые константы смещения из showTooltip()
  const xOffset = -118;
  let yOffset = -415;

  let left = rect.left + scrollX + rect.width / 2 + xOffset;
  let top = rect.top + scrollY + yOffset;

  // Корректировка по ширине экрана
  const tipWidth = tooltip.offsetWidth;
  if (left < 0) left = tipWidth / 2;
  else if (left > window.innerWidth - tipWidth / 2)
    left = window.innerWidth - tipHeight / 2;

  // Корректировка по высоте
  const tipHeight = tooltip.offsetHeight;
  if (top + tipHeight > window.innerHeight + scrollY) {
    top -= tipHeight * 2;
    tooltip.classList.add('tooltip-top');
  } else {
    tooltip.classList.remove('tooltip-top');
  }

  Object.assign(tooltip.style, {
    left: `${left}px`,
    top: `${top}px`
  });
}

/* Обновление цветов ячеек при изменении счета */
function updateRowColors(row, index, matches, predictions, realScores, users) {
  const cells = row.querySelectorAll(".result-cell");
  const matchName = matches[index];
  const userPredictions = predictions[index] || [];
  const realScore = realScores[index];

  cells.forEach((cell, i) => {
    const prediction = userPredictions[i];
    const newClass = getResultClass(prediction, realScore, matchName);
    cell.className = `result-cell ${newClass}`;
    
    if (!realScore || realScore.trim() === "") {
      cell.textContent = prediction && prediction.trim() !== "" ? prediction : "—";
    } else {
      cell.textContent = prediction && prediction.trim() !== "" ? prediction : "—";
    }
  });
}

/* --- УНИВЕРСАЛЬНЫЙ МОДУЛЬ ВСПЛЫВАЮЩИХ ОКОН --- */
// 🔹 ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ПОДСКАЗКИ
const tooltip = document.getElementById('cellTooltip');
let activeTooltipTimer = null;
let activeTooltipCell = null;
let isManuallyHidden = true; // Флаг: закрыли ли мы тултип вручную или он просто скроллится

function showTooltip(targetEl, textContent) {
  if (!tooltip || !targetEl) return;
  
  clearTimeout(window._ttTimer); // Очищаем таймер от hover-эффекта
  activeTooltipCell = targetEl;

  /* --- ФЛАГ: подсказка открыта через клик ---
     Если она открылась при клике, она должна закрываться только 
     если пользователь нажал вне ячейки.
   */
  isManuallyHidden = false; // <--- КЛЮЧЕВОЙ МОМЕНТ!

  tooltip.textContent = textContent;

  // ✅ НАХОДИМ КОНТЕЙНЕР С ПРОГНОЗОМ (если это не заголовок)
  let textContainer = targetEl.closest('.result-cell'); // <-- НОВАЯ СТРОКА
  if (!textContainer) {                               // <-- НОВЫЙ БЛОК
    // Если это не ячейка прогноза (например, заголовок), берём сам элемент
    textContainer = targetEl;
  }

  // ⚙️ ПОЛУЧАЕМ ТОЧНЫЕ КООРДИНАТЫ ТЕКСТА, А НЕ ВСЕЙ ЯЧЕЙКИ
  const rect = textContainer.getClientRects()[0]; // <-- ЗАМЕНА

  const scrollY = window.pageYOffset;
  const scrollX = window.pageXOffset;

  // Компенсация отступов таблицы (подобрано под ваш дизайн)
  const xOffset = 0; // Горизонтальный центр
  let yOffset = -600; // Смещение вверх

  let left = rect.left + scrollX + rect.width / 2 + xOffset;
  let top = rect.top + scrollY + yOffset;

  // Не даем улететь вправо за экран
  const tipWidth = tooltip.offsetWidth;
  if (left < 0) left = tipWidth / 2;
  else if (left > window.innerWidth - tipWidth / 2)
    left = window.innerWidth - tipHeight / 2;

  // Проверяем вылезание снизу страницы
  const tipHeight = tooltip.offsetHeight;
  if (top + tipHeight > window.innerHeight + scrollY) {
    // Переворачиваем тултип НАД элементом
    top -= tipHeight * 2; // Учитываем высоту самой ячейки
    tooltip.classList.add('tooltip-top');
  } else {
    tooltip.classList.remove('tooltip-top');
  }

  Object.assign(tooltip.style, {
    position: 'fixed',
    display: 'block', // Обязательно показываем
    opacity: '1',
    pointerEvents: 'auto',
    
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '999999', /* Максимальный приоритет поверх всего */
    
    background: '#2c3e50',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    
    transform: 'translate(-50%, 0)' /* Центрируем строго над центром элемента */,
  });
}


/**
 * Скрывает всплывающее окно ИЛИ передвигает его при прокрутке.
 * @param {boolean} force - принудительно скрыть без проверки флага
 */
function hideTooltip(force = false) {
  if (!tooltip) return;

  // Если тултип закрыт вручную (кликом вне ячейки),
  // или если передан параметр force,
  // то удаляем все стили и прячем его навсегда.
  if (force || isManuallyHidden) {
    clearTimeout(window._ttTimer);
    tooltip.classList.remove('is-visible', 'tooltip-top');
    Object.assign(tooltip.style, {
      display: 'none',
      opacity: '0',
      pointerEvents: 'none'
    });
    activeTooltipCell = null;
    return;
  }

  // Если тултип открыт и НЕ скрыт вручную,
  // значит, страница просто прокручивается.
  // Пересчитываем его положение.
  if (activeTooltipCell && tooltip.classList.contains('is-visible')) {
    updateTooltipPosition(activeTooltipCell);
  }
}

// Глобальные слушатели событий (очищены от дублей)
document.removeEventListener("click", globalClickHandler);
window.removeEventListener("scroll", hideTooltip);
window.removeEventListener("resize", hideTooltip);

function globalClickHandler(event) {
  const cell = event.target.closest('.result-cell');
  if (!cell) {
    hideTooltip();
    return;
  }
  event.stopPropagation();
  const content = `Подсказка для ячейки. Вы можете вставить сюда расчет.`; 
  // Логика расчета уже внутри buildTable, здесь заглушка на случай вызова извне
  showTooltip(cell, content);
}

document.addEventListener("click", globalClickHandler);
window.addEventListener("scroll", hideTooltip, { passive: true });
window.addEventListener("resize", hideTooltip);

// // Наведение мышкой (только если устройство поддерживает hover)
// document.addEventListener('mouseover', function (event) {
//   if (window.matchMedia('(hover: none)').matches) return;
//   const cell = event.target.closest('.result-cell');
//   if (!cell) return;
//   window._ttTimer = setTimeout(() => {
//     showTooltip(cell, `Нажми чтобы узнать сумму`);
//   }, 300);
// });

document.addEventListener('mouseout', function (event) {
  if (window.matchMedia('(hover: none)').matches) return;
  const cell = event.target.closest('.result-cell');
  if (!cell) return;
  clearTimeout(window._ttTimer);
  if (!cell.contains(event.relatedTarget)) {
    hideTooltip();
  }
});

/* --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ --- */
async function initApp() {
  try {
    appData = await loadData();
    buildTable(appData);

    const stats = calculateScoresWithUsers(
      appData.matches,
      appData.predictions,
      appData.realScores,
      appData.users,
    );
    renderScoresTable(stats, appData.users);

    const money = calculateMoneyTable(
      appData.matches,
      appData.predictions,
      appData.realScores,
      appData.users,
    );
    renderMoneyTable(money, appData.users);
  } catch (err) {
    console.error("Ошибка инициализации:", err);
    alert("Не удалось загрузить данные. Проверьте консоль.");
  }
}
/* ⚙️ СЛУШАТЕЛИ НА ПРОКРУТКУ/РЕСАЙЗ: передвигаем тултип или скрываем его */
window.addEventListener('scroll', () => hideTooltip());
window.addEventListener('resize', () => hideTooltip());
document.addEventListener("DOMContentLoaded", initApp);