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
    "чемпион",
    "место",
    "отборочный",
    "групповой",
    "стадия",
    "раунд",
    "этап",
  ];

  return triggers.some((trigger) => t.includes(trigger));
}

function isChampionStage(stageName) {
  if (!stageName) return false;
  const t = String(stageName).trim().toLowerCase();
  return t.includes("чемпион");
}

/**
 * Парсит строку счёта в массив [home, away].
 * Поддерживает форматы: "2-1", "2:1", с пробелами и без.
 * Если не удалось распарсить — возвращает null.
 */
function parseScore(scoreStr) {
  if (!scoreStr) return null;
  const s = scoreStr.trim();
  if (s === "") return null;

  const parts = s.split(/[-:]/).map((x) => x.trim());
  if (parts.length !== 2) return null;

  const h = parseInt(parts[0], 10);
  const a = parseInt(parts[1], 10);

  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  return [h, a];
}

/**
 * Определяет тип прогноза: 'exact', 'win', 'lose'.
 * Для обычных матчей — по счёту.
 * Для «ЧЕМПИОН»/«Кто победит» — по совпадению текста.
 */
function getPredictionType(prediction, realScore, matchName) {
  if (!prediction || !realScore) return "lose";

  // Если в названии матча есть намёк на угадывание победителя — считаем как текстовый прогноз
  const cleanName = String(matchName || "").toLowerCase();
  const isTextMatch =
    cleanName.includes("чемпион") ||
    cleanName.includes("кто победит") ||
    cleanName.includes("победитель");

  if (isTextMatch) {
    const pNorm = (prediction || "").trim().toLowerCase();
    const rNorm = realScore.trim().toLowerCase();
    return pNorm && pNorm === rNorm ? "exact" : "lose";
  }

  // Обычный матч: счёт цифрами
  const pParts = parseScore(prediction);
  const rParts = parseScore(realScore);

  if (!pParts || !rParts) return "lose";

  const pH = parseInt(pParts[0], 10);
  const pA = parseInt(pParts[1], 10);
  const rH = parseInt(rParts[0], 10);
  const rA = parseInt(rParts[1], 10);

  if (
    Number.isNaN(pH) ||
    Number.isNaN(pA) ||
    Number.isNaN(rH) ||
    Number.isNaN(rA)
  ) {
    return "lose";
  }

  if (pH === rH && pA === rA) return "exact";

  const pWin = pH === pA ? 0 : pH > pA ? 1 : 2;
  const rWin = rH === rA ? 0 : rH > rA ? 1 : 2;

  return pWin === rWin ? "win" : "lose";
}

/**
 * Определение класса раскраски ячейки прогноза.
 * exact-win — зелёный (точный счёт)
 * team-win — светло-зелёный (угадан исход)
 * loss — красный (не угадан)
 */
function getResultClass(prediction, realScore, matchName) {
  // Если реального результата ещё нет — серая ячейка
  if (!realScore || realScore.trim() === "") {
    return "result-cell-neutral";
  }

  const type = getPredictionType(prediction, realScore, matchName);
  if (type === "exact") return "exact-win";
  if (type === "win") return "team-win";
  return "loss";
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

    const cleanName = String(matchName).toLowerCase();
    const isTextMatch =
      cleanName.includes("чемпион") ||
      cleanName.includes("кто победит") ||
      cleanName.includes("победитель");

    if (isTextMatch) {
      // Текстовый прогноз: совпадение имени = точный прогноз
      const actualWinner = realScore.trim().toLowerCase();
      if (!actualWinner) return;

      const userPredictions = predictions[index] || [];
      users.forEach((user, userIdx) => {
        const prediction = (userPredictions[userIdx] || "")
          .trim()
          .toLowerCase();
        if (prediction && prediction === actualWinner) {
          userStats[user].points += 3;
          userStats[user].exact++;
        } else {
          userStats[user].losses++;
        }
      });
      return;
    }

    // Обычный матч: счёт цифрами
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

/**
 * Вспомогательная функция: считает изменение баланса для ОДНОГО пользователя в ОДНОМ матче.
 * Правила:
 * - Если есть хотя бы один exact: exact получает от win (10₽) и от lose (20₽)
 * - Иначе: win получает от lose (10₽)
 */
function calcMatchChange(
  type,
  exactCount,
  winCount,
  loserCount,
  isChampionStage,
) {
  let change = 0;

  if (isChampionStage) {
    // ЭТАП «ЧЕМПИОН»: перераспределение денег
    if (type === "exact") {
      // Угадавший забирает по 100₽ с каждого проигравшего
      change = loserCount * 100;
    } else {
      // Проигравший платит по 100₽ каждому, кто угадал (в нашем случае exactCount всегда 0 или 1)
      // Но так как exactCount может быть >1 (если несколько угадали), платим всем угадавшим
      change = -(exactCount * 100);
    }
    return change;
  }

  // ОБЫЧНЫЕ ЭТАПЫ (старая логика)
  if (exactCount > 0) {
    if (type === "exact") {
      change += winCount * 10;
      change += loserCount * 20;
    } else if (type === "win") {
      change -= exactCount * 10;
      change += loserCount * 10;
    } else {
      // lose
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
    // Если это заголовок этапа — обновляем currentStage
    if (isStageHeader(matchName)) {
      currentStage = matchName.trim();
      return;
    }

    const realScore = realScores[idx];
    if (!realScore) return;

    const isChampStage = isChampionStage(currentStage);

    // Для обычных матчей парсим счёт, для текстовых (внутри ЧЕМПИОН) это не обязательно
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

    const exactGuessers = guesses.filter((g) => g.type === "exact");
    const winGuessers = guesses.filter((g) => g.type === "win");
    const losers = guesses.filter((g) => g.type === "lose");

    const countExact = exactGuessers.length;
    const countWin = winGuessers.length;
    const countLosers = losers.length;

    guesses.forEach((g) => {
      const change = calcMatchChange(
        g.type,
        countExact,
        countWin,
        countLosers,
        isChampStage,
      );

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
function updateRowColors(row, index, matches, predictions, realScores, users) {
  const cells = row.querySelectorAll(".result-cell");
  const matchName = matches[index];
  const userPredictions = predictions[index] || [];
  const realScore = realScores[index];

  cells.forEach((cell, i) => {
    const prediction = userPredictions[i];
    const hasPrediction = prediction && prediction.trim() !== "";
    const hasResult = realScore && realScore.trim() !== "";

    // Класс зависит от наличия реального результата
    const newClass = getResultClass(prediction, realScore, matchName);
    cell.className = `result-cell ${newClass}`;

    if (!hasResult) {
      // Нет результата матча: серая ячейка, но прогноз показываем
      cell.textContent = hasPrediction ? prediction : "—";
    } else {
      // Результат есть: цвет по точности прогноза
      if (hasPrediction) {
        cell.textContent = prediction;
      } else {
        // Прогноз не сделан, хотя результат есть
        cell.textContent = "—";
      }
    }
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

  [
    "Место",
    "Участник",
    "Очки",
    "Точные",
    "Победы",
    "Ничьи",
    "Поражения",
  ].forEach((text) => {
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
 * По индексу матча возвращает название текущего этапа (последний встреченный заголовок).
 */
function getCurrentStageForMatch(index, matches) {
  let stage = "Общий";
  for (let i = 0; i <= index; i++) {
    if (isStageHeader(matches[i])) {
      stage = matches[i].trim();
    }
  }
  return stage;
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
      updateRowColors(tr, index, matches, predictions, realScores, users);

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

      // matchName уже доступен из замыкания (из matches.forEach), ничего заново не объявляем
      const realScore = realScores[index];
const hasResult = realScore && realScore.trim() !== "";
const userPrediction = userPredictions[userIndex];
const hasPrediction = userPrediction && userPrediction.trim() !== "";

// Класс: серый, если нет результата; иначе — по типу прогноза
card.className = `result-cell ${getResultClass(userPrediction, realScore, matchName)}`;

if (!hasResult) {
  // Нет результата матча: серая ячейка, прогноз всё равно показываем
  card.textContent = hasPrediction ? userPrediction : "—";
} else {
  // Результат есть: цвет по точности прогноза
  if (hasPrediction) {
    card.textContent = userPrediction;
  } else {
    // Прогноз не сделан, хотя результат есть
    card.textContent = "—";
  }
}


      // --- КЛИК: показываем выигрыш за матч во всплывашке ---
      card.addEventListener("click", () => {
        const inputEl = tr.querySelector(".real-score-input");
        const scoreVal = inputEl ? inputEl.value.trim() : "";

        if (!scoreVal) {
          showTooltip(card, "Счёт ещё не задан");
          return;
        }

        // --- ОПРЕДЕЛЯЕМ ЭТАП ---
        const currentStage = getCurrentStageForMatch(index, matches);
        const isChampStage = isChampionStage(currentStage);

        let userType;
        let exactGuessers = [];
        let winGuessers = [];
        let losers = [];

        // --- ПРОВЕРКА СЧЁТА И ТИПЫ ПРОГНОЗОВ ---
        if (isChampStage) {
          // ДЛЯ ЭТАПА «ЧЕМПИОН»: считаем по тексту (имя победителя)
          const actualWinner = scoreVal.toLowerCase(); // Реальный победитель из инпута

          users.forEach((u, i) => {
            const p = (predictions[index] || [])[i] || "";
            const pNorm = p.trim().toLowerCase();

            // Если угадал имя — это 'exact', иначе 'lose' (для ЧЕМПИОН нет типа 'win')
            const t = pNorm && pNorm === actualWinner ? "exact" : "lose";

            if (t === "exact") exactGuessers.push({ user: u, type: t });
            else losers.push({ user: u, type: t });
          });

          // Тип прогноза текущего пользователя
          const myPrediction = userPredictions[userIndex] || "";
          userType =
            myPrediction.trim().toLowerCase() === actualWinner
              ? "exact"
              : "lose";
        } else {
          // ОБЫЧНЫЙ МАТЧ: парсим цифры
          const matchResult = parseScore(scoreVal);
          if (!matchResult) {
            showTooltip(card, "Неверный формат счёта (нужно: 2-1 или 2:1)");
            return;
          }

          const [rH, rA] = matchResult;
          const rWin = rH === rA ? 0 : rH > rA ? 1 : 2;

          // Собираем типы прогнозов всех пользователей
          users.forEach((u, i) => {
            const p = (predictions[index] || [])[i];
            const t = getPredictionType(p, scoreVal, matchName);

            if (t === "exact") exactGuessers.push({ user: u, type: t });
            else if (t === "win") winGuessers.push({ user: u, type: t });
            else losers.push({ user: u, type: t });
          });

          userType = getPredictionType(
            userPredictions[userIndex],
            scoreVal,
            matchName,
          );
        }

        // --- РАСЧЁТ ВЫИГРЫША ---
        let netResult = 0;
        const countExact = exactGuessers.length;
        const countWin = winGuessers.length;
        const countLosers = losers.length;

        if (isChampStage) {
          if (userType === "exact") {
            // Получает по 100₽ с каждого, кто ошибся
            netResult = countLosers * 100;
          } else {
            // Платит по 100₽ каждому, кто угадал
            netResult = -(countExact * 100);
          }
        } else {
          // Обычная логика
          if (countExact > 0) {
            if (userType === "exact") {
              netResult += countWin * 10 + countLosers * 20;
            } else if (userType === "win") {
              netResult -= countExact * 10 + countWin * -10 + countLosers * 10;
              // Упрощённо из твоего старого кода:
              netResult = 0; // Пересчитаем ниже правильно
              netResult -= countExact * 10;
              netResult += countLosers * 10;
            } else {
              netResult -= countExact * 20 + countWin * 10;
            }
          } else if (countWin > 0) {
            if (userType === "win") {
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
 * Универсальная функция всплывашки (ПК + мобильные).
 * element — элемент, по которому кликнули/навели
 * text — текст подсказки
 */
function showTooltip(element, text) {
  const tooltip = document.getElementById("tooltip");
  if (!tooltip) {
    console.error("Нет элемента #tooltip в HTML!");
    return;
  }

  // 1. Сразу ставим текст
  tooltip.textContent = text;

  // 2. Принудительно задаём все стили, чтобы перебить любой CSS
  Object.assign(tooltip.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#333",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "8px",
    fontSize: "16px",
    zIndex: "99999",          // максимально высокий
    opacity: "0",
    pointerEvents: "none",   // не перехватывает клики
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    maxWidth: "300px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    whiteSpace: "nowrap"
  });

  // 3. Даём браузеру применить стили, потом включаем видимость
  requestAnimationFrame(() => {
    tooltip.style.opacity = "1";
  });
}

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) {
    tooltip.style.opacity = "0";
    // Можно оставить элемент на странице, он просто прозрачный
  }
}

// Скрываем при клике в любое место, скролле и ресайзе
document.addEventListener("click", hideTooltip);
window.addEventListener("scroll", hideTooltip, { passive: true });
window.addEventListener("resize", hideTooltip);


function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) {
    tooltip.classList.remove("visible");
  }
}

// Скрываем при клике в любое место, скролле или ресайзе
document.addEventListener("click", hideTooltip);
window.addEventListener("scroll", hideTooltip, { passive: true });
window.addEventListener("resize", hideTooltip);


function updateTooltipPosition(element, tooltip) {
  const rect = element.getBoundingClientRect();
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  let top = rect.bottom + scrollY + 6; // +6px отступ снизу
  let left = rect.left + scrollX;

  // Корректировка по ширине (чтобы не улетал вправо)
  const screenWidth = window.innerWidth;
  // Сначала ставим, потом меряем реальную ширину (учитывая max-width)
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;

  if (left + tw > screenWidth) {
    left = screenWidth - tw - 10; // Прижимаем к правому краю
  }

  // Если вылезает снизу - показываем НАД ячейкой
  if (top + th > window.innerHeight) {
    top = rect.top + scrollY - th - 6;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

// Скрываем при клике в любое место ИЛИ при скролле
document.addEventListener("click", () => {
  hideTooltip();
});

window.addEventListener("scroll", hideTooltip, { passive: true });
window.addEventListener("resize", hideTooltip);

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) {
    tooltip.style.opacity = '0';
    tooltip.classList.remove('visible');
    tooltip.removeAttribute('data-visible');
  }
}



// Скрываем при любом клике вне
document.addEventListener("click", () => {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) tooltip.classList.remove("visible");
});


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
