// 🎯 Função para gerar jogo aleatório com quantidade escolhida
function generateGame(quantity) {
    const maxInput = document.querySelector(".input-max").value;
    const resultArea = document.querySelector(".result");

    const min = 1;
    const max = Math.floor(Number(maxInput));

    // Validações
    if (isNaN(max) || max < quantity) {
        resultArea.innerText = `⚠️ Informe um número máximo válido (≥ ${quantity})`;
        return;
    }

    const numbers = new Set();

    while (numbers.size < quantity) {
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(number);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    // Mostrar como bolinhas
    resultArea.innerHTML = sortedNumbers
        .map(n => `<span class="ball">${String(n).padStart(2, '0')}</span>`)
        .join("");
}

// 🎯 Monta grade de números de 00 a 99 com limite de 20 seleções manuais
const numberGrid = document.getElementById('numberGrid');
for (let i = 0; i <= 99; i++) {
    const div = document.createElement('div');
    div.classList.add('number');
    div.textContent = i.toString().padStart(2, '0');

    div.addEventListener('click', () => {
        if (!div.classList.contains('selected')) {
            const selected = document.querySelectorAll('.number.selected');
            if (selected.length >= 50) {
                alert('Você só pode selecionar até 50 números manualmente.');
                return;
            }
        }
        div.classList.toggle('selected');
    });

    numberGrid.appendChild(div);
}

// 🎯 Botão que completa até 30 números únicos
const completeBtn = document.getElementById('completeTo30');
completeBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('.number.selected'));
    const selectedValues = selected.map(el => parseInt(el.textContent));

    if (selectedValues.length > 50) {
        alert('Você já selecionou mais de 50 números.');
        return;
    }

    const remaining = 50 - selectedValues.length;

    // Cria lista dos números restantes disponíveis
    const available = [];
    for (let i = 0; i <= 99; i++) {
        if (!selectedValues.includes(i)) {
            available.push(i);
        }
    }

    // Embaralha
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }

    const toSelect = available.slice(0, remaining);

    // Marca automaticamente os números escolhidos
    const allNumberDivs = document.querySelectorAll('.number');
    toSelect.forEach(num => {
        const numStr = num.toString().padStart(2, '0');
        allNumberDivs.forEach(div => {
            if (div.textContent === numStr) {
                div.classList.add('selected');
            }
        });
    });
});

// 🎯 Botão para limpar seleção
const clearBtn = document.getElementById('clearSelection');

clearBtn.addEventListener('click', () => {
    const selected = document.querySelectorAll('.number.selected');
    selected.forEach(el => el.classList.remove('selected'));

    const resultArea = document.querySelector(".result");
    resultArea.innerHTML = "";
});

function generateSingleByMax() {
    const maxInput = document.getElementById("maxValueInput").value;
    const max = parseInt(maxInput);
    const min = 0;

    const resultDiv = document.getElementById("singleResult");

    // Validação
    if (isNaN(max) || max < 1) {
        resultDiv.innerText = "⚠️ Digite um número máximo válido (maior que 0)";
        return;
    }

    const number = Math.floor(Math.random() * (max - min + 1)) + min;

    resultDiv.innerHTML = `<span class="ball">${String(number).padStart(2, '0')}</span>`;
}


function generateClover() {
    const min = parseInt(document.getElementById("cloverMinInput").value);
    const max = parseInt(document.getElementById("cloverMaxInput").value);
    const quantity = parseInt(document.getElementById("cloverQtyInput").value);
    const result = document.getElementById("cloverResult");

    // Validações
    if (isNaN(min) || isNaN(max) || isNaN(quantity) || min < 0 || max <= min || quantity < 1 || quantity > (max - min + 1)){
        result.innerHTML = "⚠️ Valores Inválidos! Verifique a Quantidade, Mínimo e Máximo.";
        return
    }

    const numbers = new Set();
    while (numbers.size < quantity) {
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(number);
    }

    const sortedNumber = Array.from(numbers).sort((a, b) => a - b);
    result.innerHTML = sortedNumber
    .map(num => `<div class="clover-ball">${String(num).padStart(2, 0)}</div>`)
    .join("");

    // 🎯 Botão para limpar seleção
    const clearBtn = document.getElementById("clearSelection");

    clearBtn.addEventListener("click", () => {
        const selected = document.querySelectorAll(".number.selected");
        selected.forEach(el => el.classList.remove("selected"));
        
        const resultArea = document.querySelector(".clover-container");
        resultArea.innerHTML = "";
    });
}





function generateFromUserNumbers() {
    const input = document.getElementById("userBaseNumbers").value;
    const gameQty = parseInt(document.getElementById("userGameQty").value);
    const perGameQty = parseInt(document.getElementById("userPerGameQty").value);
    const resultArea = document.getElementById("userResultArea");

    if (!input) {
        resultArea.innerHTML = "⚠️ Digite os números-base.";
        return;
    }

    const baseNumbers = input
        .split(",")
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n) && n >= 0 && n <= 99);

    if (baseNumbers.length < perGameQty) {
        resultArea.innerHTML = `⚠️ É necessário ter ao menos ${perGameQty} números válidos.`;
        return;
    }

    resultArea.innerHTML = ""; // Limpa resultados anteriores

    for (let i = 0; i < gameQty; i++) {
        const game = [];

        const pool = [...baseNumbers];
        // Embaralha os números base
        for (let j = pool.length - 1; j > 0; j--) {
            const r = Math.floor(Math.random() * (j + 1));
            [pool[j], pool[r]] = [pool[r], pool[j]];
        }

        game.push(...pool.slice(0, perGameQty));
        game.sort((a, b) => a - b);

        const div = document.createElement("div");
        div.classList.add("game");

        div.innerHTML = game
            .map(n => `<span class="ball">${String(n).padStart(2, '0')}</span>`)
            .join("");

        resultArea.appendChild(div);
    }
}