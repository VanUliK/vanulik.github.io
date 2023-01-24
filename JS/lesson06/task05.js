// Дан тег <div class="content"></div> 
// Создайте с помощью javascript новый элемент button
// Добавьте текст для кнопки “Отправить”
// При клике на данную кнопку необходимо чтобы текст поменялся на “Текст отправлен”

const contentEl = document.querySelector('.content');
const buttonElem = document.createElement('button');
buttonElem.textContent = 'Отправить';
contentEl.appendChild(buttonElem);
buttonElem.onclick = function () {
  if (buttonElem.textContent === 'Отправить') {
    buttonElem.textContent = 'Текст отправлен';
  } else {
    buttonElem.textContent = 'Отправить';
  }
}


const content = document.querySelector('.content');
const title = document.createElement("h1");
title.textContent = "Отправьте текст";
content.appendChild(title);
const myButton = document.createElement('button');
myButton.textContent = 'Oтправить';
content.appendChild(myButton);
let count = 0;
myButton.onclick = function () {
  if (count % 2 === 0) {
    myButton.textContent = 'Текст отправлен';
    title.textContent = 'Отправили'
  } else {
    myButton.textContent = 'Отправить';
    title.textContent = 'Отправьте текст';
  }
  count++;
  if (count === 5) {
    alert('Вы сломали кнопку');
  }
}

    //  const content = document.querySelector('.content') 
    //  const title = document.createElement("h1");  
    //  title.textContent = "Кнопка катапультирования лектора";  
    //  content.appendChild(title);  
    //  const myButton = document.createElement('button');  
    //  myButton.textContent = 'ЖМИ!';  
    //  content.appendChild(myButton);  
    //  let count = 0;  
    //  myButton.onclick = function () {  
    //      if (count % 2 === 0) {  
    //          myButton.textContent = 'Давай еще раз!';  
    //          title.textContent = 'Не выходит :('  
    //      } else {  
    //          myButton.textContent = 'Жми! Жми! Жми!';  
    //          title.textContent = 'Кнопка катапультирования лектора';  
    //      }  
    //      count++;  
    //      if (count === 5) {  
    //          alert('Вы сломали кнопку'); 
    //          myButton.remove(); 
    //          title.textContent = 'Эх... В следующий раз повезет.'  
    //      }  
    //  } 
