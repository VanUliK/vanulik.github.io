// Глобальное хранилище данных после загрузки
let appData = null;

/**
 * Загрузка JSON-файлов параллельно.
 * Возвращает объект { matches, predictions, users, realScores }
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

/**
 * Проверка: является ли строка заголовком этапа.
 * Примеры: "Группа A", "1/8 финала", "Финал" и т.п.
 */
function isStageHeader(text) {
  if (!text) return false;
  const t = String(text).trim().toLowerCase();

  const triggers = [
    "финал",
    "1/",
    "четвертьфинал",
    "полуфинал",
    "место",
    "отборочный",
    "групповой",
    "стадия",
    "раунд",
  ];

  return triggers.some((trigger) => t.includes(trigger));
}

/**
 * Парсит строку счёта в массив [home, away].
 * Поддерживает форматы: "2-1", "2:1", с пробелами и без.
 * Если не удалось распарсить — возвращает null.
 */
function parseScore(scoreStr) {
  if (!scoreStr) return null;
  const s = scoreStr.trim();
  if (s === '') return null;

  const parts = s.split(/[-:]/).map(x => x.trim());
  if (parts.length !== 2) return null;

  const h = parseInt(parts[0], 10);
  const a = parseInt(parts[1], 10);

  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  return [h, a];
}

/**
 * Определяет тип прогноза: 'exact', 'win', 'lose'.
 * exact — точный счёт совпал
 * win — угадан исход (победа/ничья)
 * lose — не угадан
 */
function getPredictionType(prediction, realScore) {
  if (!prediction || !realScore) return 'lose';

  const pParts = parseScore(prediction);
  const rParts = parseScore(realScore);

  if (!pParts || !rParts) return 'lose';

  const pH = parseInt(pParts[0], 10);
  const pA = parseInt(pParts[1], 10);
  const rH = parseInt(rParts[0], 10);
  const rA = parseInt(rParts[1], 10);

  if (Number.isNaN(pH) || Number.isNaN(pA) || Number.isNaN(rH) || Number.isNaN(rA)) {
    return 'lose';
  }

  // Точный счёт
  if (pH === rH && pA === rA) return 'exact';

  // Исход
  const pWin = (pH === pA) ? 0 : (pH > pA ? 1 : 2);
  const rWin = (rH === rA) ? 0 : (rH > rA ? 1 : 2);

  return (pWin === rWin) ? 'win' : 'lose';
}

/**
 * Определение класса раскраски ячейки прогноза.
 * exact-win — зелёный (точный счёт)
 * team-win — светло-зелёный (угадан исход)
 * loss — красный (не угадан)
 */
function getResultClass(prediction, realScore) {
  const type = getPredictionType(prediction, realScore);
  if (type === 'exact') return 'exact-win';
  if (type === 'win') return 'team-win';
  return 'loss';
}

/**
 * Расчёт статистики (очки, точные, победы и т.д.) для таблицы очков.
 * Очки: 3 за точный счёт, 1 за угаданный исход.
 */
function calculateScoresWithUsers(matches, predictions, realScores, users) {
  const userStats = {};
  users.forEach((user) => {
    userStats[user] = { points: 0, exact: 0, wins: 0, losses: 0, draws: 0 };
  });

  matches.forEach((matchName, index) => {
    if (isStageHeader(matchName)) return;
    const realScore = realScores[index];
    if (!realScore) return;

    const rParts = parseScore(realScore);
    if (!rParts) return;

    const rH = parseInt(rParts[0], 10);
    const rA = parseInt(rParts[1], 10);
    if (Number.isNaN(rH) || Number.isNaN(rA)) return;

    let rWin = rH === rA ? 0 : rH > rA ? 1 : 2;
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

      let pWin = pH === pA ? 0 : pH > pA ? 1 : 2;

      // Очки
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

/**
 * Вспомогательная функция: считает изменение баланса для ОДНОГО пользователя в ОДНОМ матче.
 * Правила:
 * - Если есть хотя бы один exact: exact получает от win (10₽) и от lose (20₽)
 * - Иначе: win получает от lose (10₽)
 */
function calcMatchChange(type, exactCount, winCount, loserCount) {
  let change = 0;

  if (exactCount > 0) {
    if (type === 'exact') {
      change += winCount * 10;
      change += loserCount * 20;
    } else if (type === 'win') {
      change -= exactCount * 10;
      change += loserCount * 10;
    } else { // lose
      change -= (exactCount * 20) + (winCount * 10);
    }
  } else if (winCount > 0) {
    if (type === 'win') {
      change += loserCount * 10;
    } else {
      change -= winCount * 10;
    }
  }
  return change;
}

/**
 * РАСЧЁТ ДЕНЕГ (ИТОГОВЫЙ И ПО ЭТАПАМ)
 * Возвращает структуру:
 * {
 *   user: { total: number, stages: { "Этап": number, ... } }
 * }
 */
function calculateMoneyTable(matches, predictions, realScores, users) {
  const result = {};

  users.forEach((u) => {
    result[u] = { total: 0, stages: {} };
  });

  let currentStage = "Общий"; 

  matches.forEach((matchName, idx) => {
    // 1. Определяем этап
    if (isStageHeader(matchName)) {
      currentStage = matchName.trim();
      return;
    }

    const realScore = realScores[idx];
    if (!realScore) return; // Пропускаем матчи без счёта

    const rParts = parseScore(realScore);
    if (!rParts) return;

    const [rH, rA] = rParts;
    const rWin = (rH === rA) ? 0 : (rH > rA ? 1 : 2);
    
    const userPredictions = predictions[idx] || [];

    // 2. Сначала определяем типы прогнозов ВСЕХ игроков в этом матче
    const guesses = users.map((u, i) => {
      const pred = userPredictions[i];
      const type = getPredictionType(pred, realScore);
      return { user: u, type };
    });

    const exactGuessers = guesses.filter(g => g.type === 'exact');
    const winGuessers = guesses.filter(g => g.type === 'win');
    const losers = guesses.filter(g => g.type === 'lose');

    const countExact = exactGuessers.length;
    const countWin = winGuessers.length;
    const countLosers = losers.length;

    // 3. Применяем ЕДИНУЮ формулу начисления для каждого игрока
    guesses.forEach(g => {
      const change = calcMatchChange(g.type, countExact, countWin, countLosers);

      // Обновляем итог
      result[g.user].total += change;

      // Обновляем этап (инициализируем, если нет)
      if (!result[g.user].stages[currentStage]) {
        result[g.user].stages[currentStage] = 0;
      }
      result[g.user].stages[currentStage] += change;
    });
  });

  return result;
}

/**
 * Отрисовка таблицы денег (баланс по этапам и итого).
 * Показывает: Место, Участник, этапы, Итого (₽)
 */
/**
 * Отрисовка таблицы денег (баланс по этапам и итого).
 * - Колонка «Место»: узкая, по центру
 * - Колонка «Участник»: широкая, слева
 * - Суммы: зелёный (+), красный (-), серый (0)
 * - Шапка: в стиле остальных таблиц
 */
function renderMoneyTable(data, users) {
  const container = document.getElementById("money-container");
  if (!container) return;

  const allStages = new Set();
  users.forEach((u) => {
    Object.keys(data[u].stages).forEach((st) => allStages.add(st));
  });
  const stagesList = Array.from(allStages);

  const table = document.createElement("table");
  table.className = "money-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["Место", "Участник"];
  stagesList.forEach((st) => headers.push(st));
  headers.push("Итого (₽)");

  headers.forEach((text) => {
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

    // Место (узкая колонка)
    const tdPlace = document.createElement("td");
    tdPlace.textContent = index + 1;
    tr.appendChild(tdPlace);

    // Участник (широкая колонка)
    const tdUser = document.createElement("td");
    tdUser.textContent = user;
    tr.appendChild(tdUser);

    // Этапы
    stagesList.forEach((stage) => {
      const val = rowData.stages[stage] || 0;
      const td = document.createElement("td");
      td.textContent = val;

      if (val > 0) td.classList.add("money-cell-positive");
      else if (val < 0) td.classList.add("money-cell-negative");
      else td.classList.add("money-cell-zero");

      tr.appendChild(td);
    });

    // Итого
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



/**
 * Перекраска ячеек в строке при изменении счёта.
 * Обновляет классы (exact-win / team-win / loss) и текст.
 */
function updateRowColors(row, index, predictions, realScores, users) {
  const cells = row.querySelectorAll(".result-cell");
  const userPredictions = predictions[index] || [];
  const realScore = realScores[index];

  cells.forEach((cell, i) => {
    const prediction = userPredictions[i] || "";
    const newClass = getResultClass(prediction, realScore);
    cell.className = `result-cell ${newClass}`;
    cell.textContent = prediction ? prediction : "—";
  });
}

/**
 * Отрисовка итоговой таблицы с очками.
 * Столбцы: Место, Участник, Очки, Точные, Победы, Ничьи, Поражения
 */
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

  ["Место", "Участник", "Очки", "Точные", "Победы", "Ничьи", "Поражения"].forEach((text) => {
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

    [
      index + 1,
      user,
      stats.points,
      stats.exact,
      stats.wins,
      stats.draws,
      stats.losses,
    ].forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });

    // Выделение первого места
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



/**
 * Отрисовка основной таблицы матчей и прогнозов.
 * Включает:
 * - ввод реального счёта (input)
 * - ячейки прогнозов (с раскраской)
 * - клик по ячейке → показывает выигрыш за матч во всплывашке
 */
function buildTable(data) {
  const { matches, predictions, users, realScores } = data;
  const table = document.getElementById("predictions-table");
  if (!table) return;

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Заголовки: Матч / Этап, Реальный счёт, потом каждый пользователь
  const thMatch = document.createElement("th");
  thMatch.textContent = "Матч / Этап";
  headerRow.appendChild(thMatch);

  const thScore = document.createElement("th");
  thScore.textContent = "Реальный счёт";
  headerRow.appendChild(thScore);

  users.forEach((user) => {
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

    // Если это заголовок этапа — делаем одну ячейку на всю ширину
    if (isStageHeader(matchName)) {
      const td = document.createElement("td");
      td.colSpan = 2 + users.length;
      td.className = "stage-header";
      td.textContent = matchName.trim();
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Ячейка с названием матча
    const tdMatch = document.createElement("td");
    tdMatch.textContent = matchName;
    tr.appendChild(tdMatch);

    // Ячейка с реальным счётом (input для редактирования)
    const tdScore = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "real-score-input";
    const scoreVal = realScores[index] || "";
    input.value = scoreVal;

    // При изменении счёта — пересчитываем всё: раскраску, очки, деньги
    input.onchange = (e) => {
      realScores[index] = e.target.value.trim();

      // Перекрашиваем ячейки в этой строке
      updateRowColors(tr, index, predictions, realScores, users);

      // Считаем и рисуем таблицу очков
      const stats = calculateScoresWithUsers(
        matches,
        predictions,
        realScores,
        users,
      );
      renderScoresTable(stats, users);

      // Считаем и рисуем таблицу денег
      const money = calculateMoneyTable(
        matches,
        predictions,
        realScores,
        users,
      );
      renderMoneyTable(money, users);
    };

    tdScore.appendChild(input);
    tr.appendChild(tdScore);

    // Для каждого пользователя — ячейка прогноза
    const userPredictions = predictions[index] || [];

    users.forEach((userName, userIndex) => {
      const td = document.createElement("td");
      const card = document.createElement("div");
      card.className = `result-cell ${getResultClass(userPredictions[userIndex], realScores[index])}`;
      card.textContent = userPredictions[userIndex] ? userPredictions[userIndex] : "—";

      // --- КЛИК: показываем выигрыш за матч во всплывашке ---
      card.addEventListener("click", () => {
        const inputEl = tr.querySelector(".real-score-input");
        const scoreVal = inputEl ? inputEl.value.trim() : "";

        // Если счёт не введён — сразу показываем подсказку
        if (!scoreVal) {
          showTooltip(card, "Счёт ещё не задан");
          return;
        }

        const matchResult = parseScore(scoreVal);
        if (!matchResult) {
          showTooltip(card, "Неверный формат счёта (нужно: 2-1 или 2:1)");
          return;
        }

        const [rH, rA] = matchResult;
        const rWin = (rH === rA) ? 0 : (rH > rA ? 1 : 2);

        const prediction = userPredictions[userIndex] || "";
        const userType = getPredictionType(prediction, scoreVal);

        // Собираем типы прогнозов всех пользователей в этом матче
        const guesses = users.map((u, i) => {
          const p = (predictions[index] || [])[i];
          const t = getPredictionType(p, scoreVal);
          return { user: u, type: t };
        });

        const exactGuessers = guesses.filter((g) => g.type === "exact");
        const winGuessers = guesses.filter((g) => g.type === "win");
        const losers = guesses.filter((g) => g.type === "lose");

        let netResult = 0;

        // Считаем именно тот выигрыш/проигрыш, который этот пользователь получил в этом матче
        if (exactGuessers.length > 0) {
          if (userType === "exact") {
            netResult += winGuessers.length * 10;
            netResult += losers.length * 20;
          } else if (userType === "win") {
            netResult -= exactGuessers.length * 10;
            netResult += losers.length * 10;
          } else {
            // lose
            netResult -= (exactGuessers.length * 20) + (winGuessers.length * 10);
          }
        } else if (winGuessers.length > 0) {
          if (userType === "win") {
            netResult += losers.length * 10;
          } else {
            netResult -= winGuessers.length * 10;
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
 * Универсальная функция всплывашки (ПК + мобильные).
 * element — элемент, по которому кликнули/навели
 * text — текст подсказки
 */
function showTooltip(element, text) {
  // Удаляем старые тултипы, если есть
  const existing = document.querySelector(".tooltip");
  if (existing) existing.remove();

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.textContent = text;
  tooltip.style.position = "absolute";
  tooltip.style.padding = "8px 12px";
  tooltip.style.backgroundColor = "#333";
  tooltip.style.color = "#fff";
  tooltip.style.borderRadius = "6px";
  tooltip.style.fontSize = "13px";
  tooltip.style.pointerEvents = "none"; // чтобы не мешал событиям мыши
  tooltip.style.zIndex = "1000";
  tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

  document.body.appendChild(tooltip);

  // Определяем, мобильное ли устройство (простая эвристика)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // МОБИЛЬНАЯ ВЕРСИЯ: показываем по центру над/под элементом
    const rect = element.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const tooltipWidth = rect.width + 24; // с запасом

    let topPos, leftPos;

    // Центрируем по горизонтали относительно элемента
    leftPos = rect.left + (rect.width - tooltipWidth) / 2;
    // Если выходит за левый край — прижимаем к левому
    if (leftPos < 0) leftPos = 0;
    // Если выходит за правый край — прижимаем к правому
    if (leftPos + tooltipWidth > windowWidth) {
      leftPos = windowWidth - tooltipWidth;
    }

    // Показываем над элементом (или под, если не хватает места сверху)
    topPos = rect.top - 48;
    if (topPos < 20) topPos = rect.bottom + 12;

    tooltip.style.left = leftPos + "px";
    tooltip.style.top = topPos + "px";

    // На мобильных убираем mousemove/mouseleave и просто оставляем тултип
    // (он исчезнет при следующем вызове showTooltip или можно добавить закрытие по тапу вне)
  } else {
    // ПК: показываем рядом с курсором при наведении
    element.addEventListener(
      "mousemove",
      (e) => {
        tooltip.style.left = e.pageX + 14 + "px";
        tooltip.style.top = e.pageY + 14 + "px";
      },
      { once: true },
    );

    element.addEventListener(
      "mouseleave",
      () => {
        setTimeout(() => {
          if (tooltip.parentNode) tooltip.remove();
        }, 150);
      },
      { once: true },
    );
  }
}


/**
 * Инициализация всего приложения.
 * Вызывается после загрузки страницы.
 */
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

// Запуск после загрузки DOM
document.addEventListener("DOMContentLoaded", initApp);
