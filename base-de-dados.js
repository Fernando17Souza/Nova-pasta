/*function generateNumber(){

    const min = Math.ceil(document.querySelector(".input-min").value)
    const max = Math.floor(document.querySelector(".input-max").value)

    const result = Math.floor(Math.random() * (max - min + 1) + min)

    alert(result)

}
*/


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
        .map(n => `<span class="ball">${n}</span>`)
        .join("");
}