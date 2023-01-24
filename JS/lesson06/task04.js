// Создать элемент button, добавить в блок <div class="content"></div>
// При клике на который в консоль выводится сколько раз пользователь нажал на данную кнопку

// const buttonEl = document.createElement('button');
// buttonEl.textContent = 'Кнопка';
// const contentEl = document.querySelector('.content');
// contentEl.appendChild(buttonEl)


// const clickButton = document.querySelector('button');
// let count = 0;

// buttonEl.onclick = function () {
//   ;
//   console.log(++count);
// }

// Создать элемент button, добавить в блок <div class="content"></div>
// При клике на который в консоль выводится сколько раз пользователь нажал на данную кнопку

const buttonElem1 = document.createElement('button');
const buttonElem2 = document.createElement('button');
const buttonElem3 = document.createElement('button');
buttonElem1.classList.add(red - button);
buttonElem1.style.color = 'green';

buttonElem1.textContent = 'Кнопка';
buttonElem2.textContent = 'Кнопка';
buttonElem3.textContent = 'Кнопка';

const contentEl = document.querySelector('.content');
contentEl.appendChild(buttonElem1)
contentEl.appendChild(buttonElem2)
contentEl.appendChild(buttonElem3)

const clickButton = document.querySelectorAll('button');

function count() {
  let counter = 0;
  return function () {
    return counter++;
  };
}
for (let button of clickButton) {
  const counter = count();
  button.addEventListener('click', function () {
    this.textContent = counter();
  });
}

button.addEventListener('click', function (e) {
  console.log(++count);
});

// const content = document.querySelector('.content');
// const buttonEl = document.createElement('button');
// content.appendChild(buttonEl);
// buttonEl.textContent = 'Push';
// let count = 0;
// buttonEl.onclick = function () {
//   console.log(++count);
// }