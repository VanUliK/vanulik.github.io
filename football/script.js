// ============================================================
// ОСНОВНОЙ КОД ПРИЛОЖЕНИЯ
// НЕ МЕНЯЙТЕ ЭТОТ ФАЙЛ, ЕСЛИ НЕ ЗНАЕТЕ, ЧТО ДЕЛАЕТЕ!
// ============================================================

// ==================== УТИЛИТЫ ====================
const UTILS = {
  STAGE_TRIGGERS: ['финал', '1/', 'четвертьфинал', 'полуфинал', 'чемпион', 'место', 'отборочный', 'групповой', 'стадия', 'раунд', 'этап'],
  TEXT_MATCH_KEYWORDS: ['чемпион', 'кто победит', 'победитель'],
  
  isStageHeader: function(text) {
    if (!text) return false;
    const t = String(text).toLowerCase();
    return this.STAGE_TRIGGERS.some(trigger => t.includes(trigger));
  },
  
  isChampionStage: function(name) {
    if (!name) return false;
    return String(name).toLowerCase().includes('чемпион');
  },
  
  isTextMatch: function(name) {
    if (!name) return false;
    const t = String(name).toLowerCase();
    return this.TEXT_MATCH_KEYWORDS.some(keyword => t.includes(keyword));
  },
  
  parseScore: function(str) {
    if (!str) return null;
    const parts = str.trim().split(/[-:]/).map(x => x.trim());
    if (parts.length !== 2) return null;
    const h = parseInt(parts[0]);
    const a = parseInt(parts[1]);
    if (isNaN(h) || isNaN(a)) return null;
    return [h, a];
  },
  
  getWinType: function(h, a) {
    if (h === a) return 0;
    return h > a ? 1 : 2;
  },
  
  formatMoney: function(val) {
    if (val > 0) return '+' + val + ' ₽';
    if (val < 0) return val + ' ₽';
    return '0 ₽';
  }
};

// ==================== ЗАГРУЗКА ДАННЫХ ====================
async function loadData() {
  const basePath = "./data/";
  const files = ['matches.json', 'predictions.json', 'users.json', 'real-scores.json'];
  
  try {
    const responses = await Promise.all(files.map(f => fetch(basePath + f)));
    const failed = responses.find(r => !r.ok);
    if (failed) throw new Error('Ошибка загрузки: ' + failed.url);
    
    const data = await Promise.all(responses.map(r => r.json()));
    return {
      matches: data[0],
      predictions: data[1],
      users: data[2],
      realScores: data[3]
    };
  } catch (error) {
    console.error("loadData error:", error);
    throw error;
  }
}

// ==================== РАСЧЕТ ПРОГНОЗОВ ====================
function getPredictionType(prediction, realScore, matchName) {
  if (!prediction || !realScore) return 'lose';
  
  const isTextMatch = UTILS.isTextMatch(matchName);
  
  if (isTextMatch) {
    const pNorm = String(prediction).trim().toLowerCase();
    const rNorm = String(realScore).trim().toLowerCase();
    if (pNorm && pNorm === rNorm) return 'exact';
    return 'lose';
  }
  
  const pParts = UTILS.parseScore(prediction);
  const rParts = UTILS.parseScore(realScore);
  if (!pParts || !rParts) return 'lose';
  
  const pH = pParts[0];
  const pA = pParts[1];
  const rH = rParts[0];
  const rA = rParts[1];
  
  if (isNaN(pH) || isNaN(pA) || isNaN(rH) || isNaN(rA)) return 'lose';
  
  if (pH === rH && pA === rA) return 'exact';
  
  const pWin = UTILS.getWinType(pH, pA);
  const rWin = UTILS.getWinType(rH, rA);
  
  if (pWin === rWin) return 'win';
  return 'lose';
}

function getResultClass(prediction, realScore, matchName) {
  if (!realScore || realScore.trim() === '') {
    return 'result-cell-neutral';
  }
  const type = getPredictionType(prediction, realScore, matchName);
  if (type === 'exact') return 'exact-win';
  if (type === 'win') return 'team-win';
  return 'loss';
}

// ==================== РАСЧЕТ ОЧКОВ ====================
function calculateScoresWithUsers(matches, predictions, realScores, users) {
  const userStats = {};
  users.forEach(function(user) {
    userStats[user] = { points: 0, exact: 0, wins: 0, losses: 0, draws: 0 };
  });
  
  matches.forEach(function(matchName, index) {
    if (UTILS.isStageHeader(matchName)) return;
    
    const realScore = realScores[index];
    if (!realScore) return;
    
    const isTextMatch = UTILS.isTextMatch(matchName);
    const userPredictions = predictions[index] || [];
    
    if (isTextMatch) {
      const actualWinner = String(realScore).trim().toLowerCase();
      if (!actualWinner) return;
      
      users.forEach(function(user, userIdx) {
        const pred = String(userPredictions[userIdx] || '').trim().toLowerCase();
        if (pred && pred === actualWinner) {
          userStats[user].points += 3;
          userStats[user].exact++;
        } else {
          userStats[user].losses++;
        }
      });
      return;
    }
    
    const rParts = UTILS.parseScore(realScore);
    if (!rParts) return;
    
    const rH = rParts[0];
    const rA = rParts[1];
    const rWin = UTILS.getWinType(rH, rA);
    
    users.forEach(function(user, userIdx) {
      const prediction = userPredictions[userIdx];
      if (!prediction) {
        userStats[user].losses++;
        return;
      }
      
      const pParts = UTILS.parseScore(prediction);
      if (!pParts) {
        userStats[user].losses++;
        return;
      }
      
      const pH = pParts[0];
      const pA = pParts[1];
      if (isNaN(pH) || isNaN(pA)) {
        userStats[user].losses++;
        return;
      }
      
      const pWin = UTILS.getWinType(pH, pA);
      
      if (pH === rH && pA === rA) {
        userStats[user].points += 3;
        userStats[user].exact++;
      } else if (pWin === rWin) {
        userStats[user].points += 1;
        if (rWin === 0) {
          userStats[user].draws++;
        } else {
          userStats[user].wins++;
        }
      } else {
        userStats[user].losses++;
      }
    });
  });
  
  return userStats;
}

// ==================== ФИНАНСОВЫЕ РАСЧЕТЫ ====================
function calcMatchChange(type, exactCount, winCount, loserCount, isChampionStage) {
  if (isChampionStage) {
    if (type === 'exact') {
      return loserCount * 100;
    } else {
      return -(exactCount * 100);
    }
  }
  
  if (exactCount > 0) {
    if (type === 'exact') {
      return winCount * 10 + loserCount * 20;
    } else if (type === 'win') {
      return -exactCount * 10 + loserCount * 10;
    } else {
      return -exactCount * 20 - winCount * 10;
    }
  }
  
  if (winCount > 0) {
    if (type === 'win') {
      return loserCount * 10;
    } else {
      return -winCount * 10;
    }
  }
  
  return 0;
}

function calculateMoneyTable(matches, predictions, realScores, users) {
  const result = {};
  users.forEach(function(user) {
    result[user] = { total: 0, stages: {} };
  });
  
  let currentStage = 'Общий';
  
  matches.forEach(function(matchName, idx) {
    if (UTILS.isStageHeader(matchName)) {
      currentStage = matchName.trim();
      return;
    }
    
    const realScore = realScores[idx];
    if (!realScore) return;
    
    const isChampStage = UTILS.isChampionStage(currentStage);
    const userPredictions = predictions[idx] || [];
    
    const guesses = users.map(function(user, i) {
      return {
        user: user,
        type: getPredictionType(userPredictions[i], realScore, matchName)
      };
    });
    
    const exactGuessers = guesses.filter(function(g) { return g.type === 'exact'; });
    const winGuessers = guesses.filter(function(g) { return g.type === 'win'; });
    const losers = guesses.filter(function(g) { return g.type === 'lose'; });
    
    const countExact = exactGuessers.length;
    const countWin = winGuessers.length;
    const countLosers = losers.length;
    
    guesses.forEach(function(g) {
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

function getStageMoneyForDisplay(matches, predictions, realScores, users) {
  const moneyData = calculateMoneyTable(matches, predictions, realScores, users);
  const stageMoney = {};
  
  users.forEach(function(user) {
    const stages = moneyData[user].stages;
    for (var stage in stages) {
      if (stages.hasOwnProperty(stage)) {
        if (!stageMoney[stage]) {
          stageMoney[stage] = {};
        }
        stageMoney[stage][user] = stages[stage];
      }
    }
  });
  
  return stageMoney;
}

function getCurrentStageForMatch(index, matches) {
  let stage = 'Общий';
  for (var i = 0; i <= index; i++) {
    if (UTILS.isStageHeader(matches[i])) {
      stage = matches[i].trim();
    }
  }
  return stage;
}

// ==================== РЕНДЕРИНГ ТАБЛИЦ ====================
function renderScoresTable(userStats, users) {
  const container = document.getElementById('scores-container');
  if (!container) return;
  
  const sortedUsers = users.slice().sort(function(a, b) {
    if (userStats[b].points !== userStats[a].points) {
      return userStats[b].points - userStats[a].points;
    }
    return userStats[b].exact - userStats[a].exact;
  });
  
  var html = '<table class="standings-table">';
  html += '<thead><tr>';
  html += '<th>Место</th><th>Участник</th><th>Очки</th><th>Точные</th><th>Победы</th><th>Ничьи</th><th>Поражения</th>';
  html += '</tr></thead><tbody>';
  
  sortedUsers.forEach(function(user, index) {
    const stats = userStats[user];
    var style = '';
    if (index === 0) {
      style = ' style="font-weight: bold; background-color: #e8f5e9;"';
    }
    html += '<tr' + style + '>';
    html += '<td>' + (index + 1) + '</td>';
    html += '<td>' + user + '</td>';
    html += '<td>' + stats.points + '</td>';
    html += '<td>' + stats.exact + '</td>';
    html += '<td>' + stats.wins + '</td>';
    html += '<td>' + stats.draws + '</td>';
    html += '<td>' + stats.losses + '</td>';
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderMoneyTable(data, users) {
  const container = document.getElementById('money-container');
  if (!container) return;
  
  const allStages = {};
  users.forEach(function(user) {
    var stages = data[user].stages;
    for (var stage in stages) {
      if (stages.hasOwnProperty(stage)) {
        allStages[stage] = true;
      }
    }
  });
  const stagesList = Object.keys(allStages);
  
  const sortedUsers = users.slice().sort(function(a, b) {
    return data[b].total - data[a].total;
  });
  
  var html = '<table class="money-table">';
  html += '<thead><tr>';
  html += '<th>Место</th><th>Участник</th>';
  stagesList.forEach(function(stage) {
    html += '<th>' + stage + '</th>';
  });
  html += '<th>Итого (₽)</th>';
  html += '</tr></thead><tbody>';
  
  sortedUsers.forEach(function(user, index) {
    const rowData = data[user];
    html += '<tr>';
    html += '<td>' + (index + 1) + '</td>';
    html += '<td>' + user + '</td>';
    
    stagesList.forEach(function(stage) {
      const val = rowData.stages[stage] || 0;
      var cls = 'money-cell-zero';
      if (val > 0) cls = 'money-cell-positive';
      else if (val < 0) cls = 'money-cell-negative';
      html += '<td class="' + cls + '">' + val + '</td>';
    });
    
    var totalCls = 'money-cell-zero';
    if (rowData.total > 0) totalCls = 'money-cell-positive';
    else if (rowData.total < 0) totalCls = 'money-cell-negative';
    html += '<td class="' + totalCls + '">' + rowData.total + '</td>';
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderFinalResults(moneyData, users) {
  const container = document.getElementById('final-results');
  if (!container) return;
  
  const sortedUsers = users.slice().sort(function(a, b) {
    return moneyData[b].total - moneyData[a].total;
  });
  
  var html = '<table>';
  html += '<thead><tr>';
  html += '<th><span class="place-number">Место</span></th>';
  html += '<th><span class="participant-name">Участник</span></th>';
  html += '<th><span class="total-balance"><span class="coin-icon"></span>Итоговый баланс ₽</span></th>';
  html += '</tr></thead><tbody>';
  
  sortedUsers.forEach(function(user, index) {
    const total = moneyData[user].total;
    var balanceClass = 'zero';
    if (total > 0) balanceClass = 'positive';
    else if (total < 0) balanceClass = 'negative';
    
    html += '<tr>';
    html += '<td><span class="place-number">' + (index + 1) + '</span></td>';
    html += '<td><span class="participant-name">' + user + '</span></td>';
    html += '<td><span class="total-balance ' + balanceClass + '">' + UTILS.formatMoney(total) + '</span></td>';
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

function updateStageSummaryRows(matches, predictions, realScores, users) {
  const stageMoney = getStageMoneyForDisplay(matches, predictions, realScores, users);
  
  document.querySelectorAll('.stage-summary-row').forEach(function(row) {
    const stageName = row.dataset.stage;
    users.forEach(function(user) {
      const td = row.querySelector('.stage-money-cell[data-user="' + user + '"]');
      if (!td) return;
      
      const val = stageMoney[stageName]?.[user] || 0;
      td.textContent = UTILS.formatMoney(val);
      td.className = 'stage-header stage-money-cell';
      if (val > 0) td.classList.add('money-cell-positive');
      else if (val < 0) td.classList.add('money-cell-negative');
      else td.classList.add('money-cell-zero');
    });
  });
}

function updateRowColors(matches, predictions, realScores, users) {
  document.querySelectorAll('.result-cell').forEach(function(cell) {
    const matchIdx = parseInt(cell.dataset.match);
    const userIdx = parseInt(cell.dataset.user);
    if (isNaN(matchIdx) || isNaN(userIdx)) return;
    
    const pred = predictions[matchIdx]?.[userIdx];
    const score = realScores[matchIdx];
    const match = matches[matchIdx];
    
    cell.className = 'result-cell ' + getResultClass(pred, score, match) + ' has-tooltip';
    cell.textContent = pred || '—';
  });
  
  const money = calculateMoneyTable(matches, predictions, realScores, users);
  renderFinalResults(money, users);
}

function calculateMatchResult(matchIdx, userIdx, matches, predictions, users, realScores) {
  const matchName = matches[matchIdx];
  const score = realScores[matchIdx];
  const currentStage = getCurrentStageForMatch(matchIdx, matches);
  const isChamp = UTILS.isChampionStage(currentStage);
  
  const guessTypes = users.map(function(u, i) {
    return getPredictionType(predictions[matchIdx]?.[i], score, matchName);
  });
  
  var countExact = 0, countWin = 0, countLose = 0;
  guessTypes.forEach(function(type) {
    if (type === 'exact') countExact++;
    else if (type === 'win') countWin++;
    else countLose++;
  });
  
  const myType = guessTypes[userIdx];
  return calcMatchChange(myType, countExact, countWin, countLose, isChamp);
}

// ==================== ТУЛТИПЫ ====================
var tooltip = document.getElementById('cellTooltip');
var activeTooltipCell = null;
var tooltipTimer = null;

function showTooltip(targetEl, text) {
  if (!tooltip || !targetEl) return;
  clearTimeout(tooltipTimer);
  activeTooltipCell = targetEl;
  
  tooltip.textContent = text;
  tooltip.style.display = 'block';
  tooltip.style.opacity = '1';
  tooltip.style.pointerEvents = 'auto';
  
  var rect = targetEl.getBoundingClientRect();
  var centerX = rect.left + rect.width / 2;
  var offsetY = 10;
  var topPos = rect.top - offsetY;
  
  tooltip.style.position = 'fixed';
  tooltip.style.left = centerX + 'px';
  tooltip.style.top = topPos + 'px';
  tooltip.style.transform = 'translateX(-50%)';
  tooltip.style.zIndex = '999999';
  tooltip.style.background = '#2c3e50';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '12px 16px';
  tooltip.style.borderRadius = '8px';
  tooltip.style.fontSize = '14px';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
  tooltip.style.maxWidth = '300px';
  
  tooltip.offsetHeight;
  
  var tooltipHeight = tooltip.offsetHeight;
  var newTop = rect.top - tooltipHeight - offsetY;
  
  if (newTop < 0) {
    newTop = rect.bottom + offsetY;
    tooltip.classList.remove('tooltip-top');
  } else {
    tooltip.classList.add('tooltip-top');
  }
  
  var tooltipWidth = tooltip.offsetWidth;
  var newLeft = centerX;
  if (newLeft - tooltipWidth / 2 < 10) {
    newLeft = tooltipWidth / 2 + 10;
  } else if (newLeft + tooltipWidth / 2 > window.innerWidth - 10) {
    newLeft = window.innerWidth - tooltipWidth / 2 - 10;
  }
  
  tooltip.style.left = newLeft + 'px';
  tooltip.style.top = newTop + 'px';
}

function hideTooltip() {
  if (!tooltip) return;
  tooltip.style.display = 'none';
  tooltip.style.opacity = '0';
  tooltip.style.pointerEvents = 'none';
  activeTooltipCell = null;
}

// ==================== ПОСТРОЕНИЕ ТАБЛИЦЫ ====================
function buildTable(data) {
  const matches = data.matches;
  const predictions = data.predictions;
  const users = data.users;
  const realScores = data.realScores;
  
  const table = document.getElementById('predictions-table');
  if (!table) return;
  
  const stageMoney = getStageMoneyForDisplay(matches, predictions, realScores, users);
  
  var html = '<thead><tr>';
  html += '<th>Матч / Этап</th>';
  html += '<th>Реальный счёт</th>';
  users.forEach(function(user) {
    html += '<th>' + user + '</th>';
  });
  html += '</tr></thead><tbody>';
  
  matches.forEach(function(matchName, index) {
    if (UTILS.isStageHeader(matchName)) {
      const stage = matchName.trim();
      html += '<tr class="stage-summary-row" data-stage="' + stage + '">';
      html += '<td class="stage-header stage-title-cell">' + stage + '</td>';
      html += '<td class="stage-header stage-score-empty"></td>';
      
      users.forEach(function(user) {
        const val = stageMoney[stage]?.[user] || 0;
        var cls = 'money-cell-zero';
        if (val > 0) cls = 'money-cell-positive';
        else if (val < 0) cls = 'money-cell-negative';
        html += '<td class="stage-header stage-money-cell ' + cls + '" data-user="' + user + '">' + UTILS.formatMoney(val) + '</td>';
      });
      
      html += '</tr>';
      return;
    }
    
    const realScore = realScores[index] || '';
    const userPredictions = predictions[index] || [];
    
    html += '<tr>';
    html += '<td>' + matchName + '</td>';
    html += '<td><input type="text" class="real-score-input" value="' + realScore + '" data-index="' + index + '"></td>';
    
    users.forEach(function(user, userIdx) {
      const pred = userPredictions[userIdx] || '';
      const cls = getResultClass(pred, realScore, matchName);
      const display = pred || '—';
      html += '<td><div class="result-cell ' + cls + ' has-tooltip" data-match="' + index + '" data-user="' + userIdx + '">' + display + '</div></td>';
    });
    
    html += '</tr>';
  });
  
  html += '</tbody>';
  table.innerHTML = html;
  
  attachTableHandlers(data);
}

function attachTableHandlers(data) {
  const matches = data.matches;
  const predictions = data.predictions;
  const users = data.users;
  const realScores = data.realScores;
  
  document.querySelectorAll('.real-score-input').forEach(function(input) {
    input.onchange = function() {
      const idx = parseInt(this.dataset.index);
      realScores[idx] = this.value.trim();
      
      const stats = calculateScoresWithUsers(matches, predictions, realScores, users);
      const money = calculateMoneyTable(matches, predictions, realScores, users);
      
      renderScoresTable(stats, users);
      renderMoneyTable(money, users);
      renderFinalResults(money, users);
      updateStageSummaryRows(matches, predictions, realScores, users);
      updateRowColors(matches, predictions, realScores, users);
    };
  });
  
  document.querySelectorAll('.result-cell').forEach(function(cell) {
    cell.onclick = function(e) {
      e.stopPropagation();
      
      const matchIdx = parseInt(this.dataset.match);
      const userIdx = parseInt(this.dataset.user);
      const score = realScores[matchIdx];
      
      if (!score) {
        showTooltip(this, 'Счёт ещё не задан');
        return;
      }
      
      const result = calculateMatchResult(matchIdx, userIdx, matches, predictions, users, realScores);
      const sign = result >= 0 ? '+' : '';
      showTooltip(this, 'За этот матч: ' + sign + result + ' ₽');
    };
  });
  
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.result-cell')) {
      hideTooltip();
    }
  });
  
  window.addEventListener('scroll', function() {
    hideTooltip();
  }, true);
  
  var tableWrapper = document.querySelector('.predictions-table-wrapper');
  if (tableWrapper) {
    tableWrapper.addEventListener('scroll', function() {
      hideTooltip();
    }, true);
  }
  
  document.addEventListener('scroll', function(e) {
    var target = e.target;
    if (target && target.closest && target.closest('#predictions-table')) {
      hideTooltip();
    }
  }, true);
  
  window.addEventListener('resize', function() {
    hideTooltip();
  });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
async function initApp() {
  try {
    const data = await loadData();
    window.appData = data;
    
    buildTable(data);
    
    const stats = calculateScoresWithUsers(data.matches, data.predictions, data.realScores, data.users);
    const money = calculateMoneyTable(data.matches, data.predictions, data.realScores, data.users);
    
    renderScoresTable(stats, data.users);
    renderMoneyTable(money, data.users);
    renderFinalResults(money, data.users);
  } catch (err) {
    console.error('Ошибка инициализации:', err);
    alert('Не удалось загрузить данные. Проверьте консоль.');
  }
}

document.addEventListener('DOMContentLoaded', initApp);


// ============================================================
// РЕГИСТРАЦИЯ SERVICE WORKER (PWA)
// ============================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/football/sw.js')
      .then(function(registration) {
        console.log('✅ Service Worker зарегистрирован успешно!');
      })
      .catch(function(error) {
        console.log('❌ Ошибка регистрации Service Worker:', error);
      });
  });
}

// Уведомление об обновлении
let newWorker;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    console.log('🔄 Приложение обновлено!');
    // Можно показать уведомление пользователю
    // showUpdateNotification();
  });
}

// ============================================================
// ПРЕДЛОЖЕНИЕ УСТАНОВИТЬ ПРИЛОЖЕНИЕ
// ============================================================

let deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  
  // Показываем кнопку
  const btn = document.createElement('button');
  btn.id = 'install-btn';
  btn.textContent = '📱 Установить приложение';
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a2a6c;
    color: #ffd900;
    border: none;
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999;
  `;
  
  btn.onclick = function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Приложение установлено!');
        }
        deferredPrompt = null;
        btn.remove();
      });
    }
  };
  
  document.body.appendChild(btn);
});

window.addEventListener('appinstalled', function() {
  console.log('✅ Приложение установлено!');
  const btn = document.getElementById('install-btn');
  if (btn) btn.remove();
});

// Уведомление об обновлении
navigator.serviceWorker.addEventListener('controllerchange', function() {
  alert('🔄 Доступна новая версия! Обновите страницу.');
});