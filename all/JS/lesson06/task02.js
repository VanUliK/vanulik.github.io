// Дан тег <a class="link" href="#">link text html</a>
// Вам необходимо поменять текст внутри ссылки на “link text js”
// Заменить href, на значение https://developer.mozilla.org/ru/

const newHref = document.querySelector(".link");
newHref.textContent = "link text js";
// newHref.setAttribute("href", "https://developer.mozilla.org/ru");
newHref.href = 'https://ya.ru';
// Дан тег <img class="photo" src="" alt="">
// Вам необходимо с помощью js поменять значение src на любое изображение из интернета

const newSrc = document.querySelector(".photo");
// newSrc.setAttribute("src", "https://molva33.ru/wp-content/uploads/2022/07/12-13-1-350x250.jpg");
newSrc.src = 'https://molva33.ru/wp-content/uploads/2022/07/12-13-1-350x250.jpg';

const btnEl = document.querySelector('.btn');
btnEl.onclick = function () {
  newSrc.src = 'https://image.shutterstock.com/shutterstock/photos/3206115/display_1500/stock-photo-resurrection-bay-in-alaska-3206115.jpg'
  newSrc.alt = 'Описание из JS'

}