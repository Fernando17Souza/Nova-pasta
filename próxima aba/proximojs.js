// Configurações do jogo
const gameConfig = {
  "mega-sena": { maxNumber: 60, numbersPerGame: 6, apiName: 'megasena' },
  "lotofacil": { maxNumber: 25, numbersPerGame: 15, apiName: 'lotofacil' },
  "lotomania": { maxNumber: 100, numbersPerGame: 50, apiName: 'lotomania' }
};

// Estado global
let historyData = [];
let lastDraw = [];
let currentChart = null;

// Elementos DOM
const selectGameType = document.getElementById('gameType');
const inputNumbersPerGame = document.getElementById('numbersPerGame');
const inputGamesQuantity = document.getElementById('gamesQuantity');
const btnLoadHistory = document.getElementById('btnLoadHistory');
const btnGenerateSmart = document.getElementById('btnGenerateSmart');
const btnGenerateRandom = document.getElementById('btnGenerateRandom');
const btnClear = document.getElementById('btnClear');
const lastResultDiv = document.getElementById('lastResult');
const lastDrawInfo = document.getElementById('lastDrawInfo');
const statsDiv = document.getElementById('stats');
const gamesDiv = document.getElementById('games');
const validationDiv = document.getElementById('validation');
const freqChartCtx = document.getElementById('freqChart').getContext('2d');
const loader = document.getElementById('loader');

// Atualiza o campo "Números por jogo" conforme modalidade
function updateNumbersPerGame() {
  const type = selectGameType.value;
  inputNumbersPerGame.value = gameConfig[type].numbersPerGame;
  clearAll();
}

selectGameType.addEventListener('change', updateNumbersPerGame);
updateNumbersPerGame();

// Limpa as seções
function clearAll() {
  lastResultDiv.innerHTML = '';
  lastDrawInfo.textContent = '';
  statsDiv.innerHTML = '';
  gamesDiv.innerHTML = '';
  validationDiv.innerHTML = '';
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

// Mostrar loader
function showLoader() {
  loader.classList.remove('hidden');
}

// Esconder loader
function hideLoader() {
  loader.classList.add('hidden');
}

// Função para buscar histórico dos últimos 50 concursos via API pública
async function loadHistory() {
  clearAll();
  const type = selectGameType.value;
  lastDrawInfo.textContent = 'Carregando histórico...';
  showLoader();

  try {
    let url = '';
    if (type === 'mega-sena') {
      url = 'https://loteriascaixa-api.herokuapp.com/api/megasena?limit=50';
    } else if (type === 'lotofacil') {
      url = 'https://loteriascaixa-api.herokuapp.com/api/lotofacil?limit=50';
    } else if (type === 'lotomania') {
      url = 'https://loteriascaixa-api.herokuapp.com/api/lotomania?limit=50';
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na requisição');
    const data = await response.json();

    historyData = data.map(item => ({
      concurso: item.concurso,
      data: item.data,
      dezenas: item.dezenas.map(n => parseInt(n, 10)),
    }));

    lastDraw = historyData[0].dezenas;

    // Exibe último resultado
    lastResultDiv.innerHTML = '';
    lastDraw.forEach(n => {
      const span = document.createElement('span');
      span.textContent = String(n).padStart(2, '0');
      span.className = 'inline-block bg-red-600 text-white rounded-full w-8 h-8 text-center font-semibold mr-1 mb-1';
      lastResultDiv.appendChild(span);
    });

    lastDrawInfo.textContent = `Último concurso: ${historyData[0].concurso} — Data: ${historyData[0].data}`;

    // Exibe estatísticas
    renderStats();

  } catch (e) {
    lastDrawInfo.textContent = 'Erro ao carregar histórico. Tente novamente.';
    console.error(e);
  } finally {
    hideLoader();
  }
}

// Obtém mapa de frequência dos números no histórico
function getFrequencyMap() {
  const freq = {};
  historyData.forEach(c => {
    c.dezenas.forEach(n => {
      freq[n] = (freq[n] || 0) + 1;
    });
  });
  return freq;
}

// Calcula a chance com base na frequência somada
function calculateGameChance(game) {
  const freqMap = getFrequencyMap();
  let sumFreq = 0;
  game.forEach(n => {
    sumFreq += (freqMap[n] || 0);
  });

  const maxFreq = Math.max(...Object.values(freqMap));
  const maxPossible = maxFreq * game.length;

  if (maxPossible === 0) return { raw: 0, percent: 0 };

  const percent = (sumFreq / maxPossible) * 100;

  return { raw: sumFreq, percent: percent.toFixed(2) };
}

// Renderiza estatísticas na tela
function renderStats() {
  const freqMap = getFrequencyMap();
  let totalCount = 0;
  let sum = 0;
  let pares = 0, impares = 0, primos = 0;

  Object.entries(freqMap).forEach(([num, count]) => {
    const n = parseInt(num);
    totalCount += count;
    sum += n * count;
    if (n % 2 === 0) pares += count;
    else impares += count;
    if (isPrime(n)) primos += count;
  });

  const avg = (sum / totalCount).toFixed(2);
  const sortedFreq = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

  statsDiv.innerHTML = `
    <p><strong>Números mais frequentes:</strong> ${sortedFreq.slice(0,7).map(e => `${e[0]} (${e[1]})`).join(', ')}</p>
    <p><strong>Números menos frequentes:</strong> ${sortedFreq.slice(-7).map(e => `${e[0]} (${e[1]})`).join(', ')}</p>
    <p><strong>Total de números sorteados:</strong> ${totalCount}</p>
    <p><strong>Pares:</strong> ${pares}, <strong>Ímpares:</strong> ${impares}</p>
    <p><strong>Primos:</strong> ${primos}</p>
    <p><strong>Soma média dos números:</strong> ${avg}</p>
  `;

  renderChart(freqMap);
}

// Verifica se um número é primo
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Renderiza gráfico de frequência com Chart.js
function renderChart(freqMap) {
  if (currentChart) currentChart.destroy();

  const labels = [];
  const data = [];
  const maxNum = gameConfig[selectGameType.value].maxNumber;
  for (let i = 1; i <= maxNum; i++) {
    labels.push(String(i));
    data.push(freqMap[i] || 0);
  }

  currentChart = new Chart(freqChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Frequência',
        data,
        backgroundColor: 'rgba(37, 99, 235, 0.7)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, precision: 0 }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// Gera subconjunto aleatório
function getRandomSubset(array, size) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, size);
}

// Gera jogos inteligentes com frequência ponderada
function generateSmartGames() {
  if (historyData.length === 0) {
    alert('Carregue o histórico antes de gerar jogos.');
    return;
  }

  clearGamesAndValidation();

  const type = selectGameType.value;
  const maxNum = gameConfig[type].maxNumber;
  const perGame = parseInt(inputNumbersPerGame.value, 10);
  const qty = parseInt(inputGamesQuantity.value, 10);
  const freqMap = getFrequencyMap();
  const lastSorted = [...lastDraw].sort((a,b) => a-b);

  const generatedSet = new Set();
  const games = [];

  function weightedPick(pool, count) {
    const weightedPool = [];
    pool.forEach(n => {
      const w = (freqMap[n] || 0) + 1;
      for (let i = 0; i < w; i++) weightedPool.push(n);
    });
    const chosen = new Set();
    while (chosen.size < count && weightedPool.length > 0) {
      const pick = weightedPool[Math.floor(Math.random() * weightedPool.length)];
      chosen.add(pick);
    }
    return Array.from(chosen);
  }

  for (let i = 0; i < qty; i++) {
    let game = [];

    if (type === 'lotomania' || type === 'lotofacil') {
      const fixed = getRandomSubset(lastSorted, 5);

      const allNumbers = Array.from({ length: maxNum }, (_, i) => i + 1);
      const exclude = (type === 'lotomania') ? fixed : lastSorted;
      const available = allNumbers.filter(n => !exclude.includes(n));

      const restCount = perGame - 5;
      const rest = weightedPick(available, restCount);
      game = fixed.concat(rest);
    } else {
      const allNumbers = Array.from({ length: maxNum }, (_, i) => i + 1);
      const available = allNumbers.filter(n => !lastSorted.includes(n));
      game = weightedPick(available, perGame);
    }

    game.sort((a,b) => a - b);
    const key = game.join(',');
    if (generatedSet.has(key)) {
      i--;
      continue;
    }
    generatedSet.add(key);
    games.push(game);
  }

  displayGames(games);
  validateGames(games);
}

// Gera jogos aleatórios
function generateRandomGames() {
  if (historyData.length === 0) {
    alert('Carregue o histórico antes de gerar jogos.');
    return;
  }

  clearGamesAndValidation();

  const type = selectGameType.value;
  const maxNum = gameConfig[type].maxNumber;
  const perGame = parseInt(inputNumbersPerGame.value, 10);
  const qty = parseInt(inputGamesQuantity.value, 10);
  const lastSorted = [...lastDraw].sort((a,b) => a-b);

  const generatedSet = new Set();
  const games = [];

  for (let i = 0; i < qty; i++) {
    let game = [];

    if (type === 'lotomania' || type === 'lotofacil') {
      const fixed = getRandomSubset(lastSorted, 5);
      const allNumbers = Array.from({ length: maxNum }, (_, i) => i + 1);
      const exclude = (type === 'lotomania') ? fixed : lastSorted;
      const available = allNumbers.filter(n => !exclude.includes(n));
      const rest = getRandomSubset(available, perGame - 5);
      game = fixed.concat(rest);
    } else {
      const allNumbers = Array.from({ length: maxNum }, (_, i) => i + 1);
      const available = allNumbers.filter(n => !lastSorted.includes(n));
      game = getRandomSubset(available, perGame);
    }

    game.sort((a,b) => a - b);
    const key = game.join(',');
    if (generatedSet.has(key)) {
      i--;
      continue;
    }
    generatedSet.add(key);
    games.push(game);
  }

  displayGames(games);
  validateGames(games);
}

// Exibe jogos na tela
function displayGames(games) {
  gamesDiv.innerHTML = '';
  games.forEach(game => {
    const chanceObj = calculateGameChance(game);
    const chancePercent = chanceObj.percent;
    const chanceRaw = chanceObj.raw;

    const maxCheck = Math.min(historyData.length, 50);
    let totalHits = 0;
    for (let i = 0; i < maxCheck; i++) {
      const concurso = historyData[i];
      const hits = game.filter(n => concurso.dezenas.includes(n)).length;
      totalHits += hits;
    }
    const avgHits = (totalHits / maxCheck).toFixed(2);

    const div = document.createElement('div');
    div.className = 'bg-blue-100 rounded p-3 shadow flex flex-col items-center gap-1';
    div.innerHTML = `
      <div class="flex flex-wrap justify-center mb-2">
        ${game.map(n => {
          const isInLastDraw = lastDraw.includes(n);
          return `<span class="inline-block w-8 h-8 rounded-full mx-1 mb-1 text-center leading-8 font-semibold ${
            isInLastDraw ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
          }">${String(n).padStart(2, '0')}</span>`;
        }).join('')}
      </div>
      <div class="text-sm text-gray-700">
        <strong>Chance (freq. soma):</strong> ${chanceRaw} (${chancePercent}%)<br/>
        <strong>Média acertos últimos 50:</strong> ${avgHits}
      </div>
    `;
    gamesDiv.appendChild(div);
  });
}

// Limpa jogos e validação
function clearGamesAndValidation() {
  gamesDiv.innerHTML = '';
  validationDiv.innerHTML = '';
}

// Valida jogos contra histórico
function validateGames(games) {
  if (historyData.length === 0) {
    validationDiv.innerHTML = '<em>Carregue o histórico antes para validar jogos.</em>';
    return;
  }

  const maxCheck = Math.min(historyData.length, 50);
  const hitsCount = {};

  games.forEach(game => {
    for (let i = 0; i < maxCheck; i++) {
      const concurso = historyData[i];
      const hits = game.filter(n => concurso.dezenas.includes(n)).length;
      hitsCount[hits] = (hitsCount[hits] || 0) + 1;
    }
  });

  const entries = Object.entries(hitsCount).sort((a, b) => b[0] - a[0]);

  validationDiv.innerHTML = '<ul class="list-disc pl-5">';
  entries.forEach(([hits, count]) => {
    validationDiv.innerHTML += `<li><strong>${hits} acertos:</strong> ${count} vezes</li>`;
  });
  validationDiv.innerHTML += '</ul>';
}

// Eventos dos botões
btnLoadHistory.addEventListener('click', loadHistory);
btnGenerateSmart.addEventListener('click', generateSmartGames);
btnGenerateRandom.addEventListener('click', generateRandomGames);
btnClear.addEventListener('click', () => {
  clearAll();
  clearGamesAndValidation();
});
