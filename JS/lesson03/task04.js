// Задание 4
// 1. Сделайте функцию, которая принимает параметром число от 1 до 7, а возвращает день недели на русском языке.
// 2. Написать функцию, которой передаем имя и она возвращает приветствие в зависимости от времени суток (Доброе утро\день\вечер\ночи Иван)

let dayOfWeek = Number(prompt('Введите день недели'));
function dayOfTheWeek(dayOfWeek) {
  switch (dayOfWeek) {
    case 1:
      console.log('Понедельник');
      break;
    case 2:
      console.log('Вторник');
      break;
    case 3:
      console.log('Среда');
      break;
    case 4:
      console.log('Четверг');
      break;
    case 5:
      console.log('Пятница');
      break;
    case 6:
      console.log('Суббота');
      break;
    case 7:
      console.log('Воскресенье');
      break;
    default:
      console.log("Нет такого дня недели");
  }
}
dayOfTheWeek(dayOfWeek);


// const dayWeek = (num) => {
//   num = Number(num);
//   if (num === 1) {
//     return console.log('Понедельник');
//   } else if (num === 2) {
//     return console.log('Вторник');
//   } else if (num === 3) {
//     return console.log('Среда');
//   } else if (num === 4) {
//     return console.log('Четверг');
//   } else if (num === 5) {
//     return console.log('Пятница');
//   } else if (num === 6) {
//     return console.log('Суббота');
//   } else if (num === 7) {
//     return console.log('Воскресенье');
//   } else if (num < 1 || num > 7) {
//     return console.log('Такого дня недели нет');
//   }
// }
// console.log(dayWeek((prompt('Введите число'))));



// let time = new Date().getHours();

let name = 'Иван';
function helloTime() {
  let now = new Date();
  let hours = now.getHours();
  if (hours >= 5 && hours <= 11)
    console.log(`Доброе утро, ${name}`);
  else if (hours == 12)
    console.log(`Добрый день, ${name}`);
  else if (hours > 12 && hours <= 17)
    console.log('Добрый день, уже вторая половина дня.');
  else if (hours > 17 && hours <= 23)
    console.log(`Добрый вечер, ${name}`);
  else if (hours > 23 && hours <= 5)
    console.log(`Доброй ночи, ${name}`);
}
helloTime();