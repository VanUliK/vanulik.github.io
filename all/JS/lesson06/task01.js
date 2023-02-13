// <div id="block">
// 	<p>1</p>
// 	<p>2</p>
// </div>
// Получите ссылку на первый абзац из дива с id, равным block, выведите его в консоль

// const blockEl = document.querySelector("#block p");
const blockEl = document.querySelector('#block p:first-child');

console.log(blockEl);

// Получите ссылку на первый абзац с классом www. и вывести его в консоль
// <p class="www">text 1</p>
// <p class="www">text 2</p>

const linkEl = document.querySelectorAll(".www");
console.log(linkEl[0]);