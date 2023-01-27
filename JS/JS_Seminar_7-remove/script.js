// Дан блок, внутри него необходимо создать элемент div с классом item, разместить текст “Элемент внутри” и задать стили Цвет текста синий, Рамка сплошная черная, Цвет фона #f8f8f8, Внутренний отступ 16px, Добавить данному блоку класс item_1 (использоватьsetAttribute)
const blockEl = document.querySelector('.block');
const divEl = document.createElement('div');
const paragraphEl = document.createElement('p');
blockEl.appendChild(divEl);
divEl.setAttribute('class', 'item');
divEl.appendChild(paragraphEl);
paragraphEl.setAttribute('class', 'item_1');
paragraphEl.textContent = 'Элемент внутри';
console.log(blockEl);
// Необходимо с помощью querySelector найти параграф с классом text
// - Вывести в консоль соседний элемент h2
// - Вывести в консоль родительский элемент content
// - Вывести в консоль картинку
// - Вывести в консоль родительский элемент elem
const parEl = document.querySelector('.text');
console.log(parEl.previousElementSibling);
console.log(parEl.parentElement);
console.log(parEl.parentElement.previousElementSibling);
console.log(parEl.parentElement.previousElementSibling.parentElement);
// parEl.onclick = function () {
//     parEl.previousElementSibling.remove();
// }
//=======================================================
// С помощью querySelector найти элемент h2  и вывести в консоль всех его родителей
const subtitleEl = document.querySelector('.subtitle');
let parentEl = subtitleEl.parentElement;
for (let i = 0; i < document.body.childNodes.length; i++) {
  if (parentEl) {
    console.log(parentEl);
    parentEl = parentEl.parentElement;
  } else {
    break;
  }
}
while (parentEl) {
  console.log(parentEl);
  parentEl = parentEl.parentElement;
}
// Дано поле ввода и кнопка отправить, необходим реализовать функционал, если пользователь нажимает на кнопку отправить, а поле ввода пустое, то под полем ввода и кнопкой должен появиться заголовок h2 с текстом вы не заполнили поле ввода
// Цвет у рамки сделать красным
const body = document.querySelector("form");
const pElem = document.createElement("h2");
body.appendChild(pElem);
const buttonElem = document.querySelector(".btn");
const inputEl = document.querySelector("input");
buttonElem.onclick = function () {
  if (inputEl.value === "") {
    inputEl.style.border = "2px dashed red";
    pElem.textContent = "Вы не заполнили поле ввода!";
  }
};