console.log(`------------------------Задание №1------------------------`);
// 1. Даны два массива: первый с названиями дней недели, а второй - с их порядковыми номерами:
// const arr1 = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
// const arr2 = [1, 2, 3, 4, 5, 6, 7];
// С помощью цикла создайте объект, ключами которого будут названия дней, а значениями - их номера.
const arr1 = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const arr2 = [1, 2, 3, 4, 5, 6, 7];
const day = {};
for (let i = 0; i < arr1.length; i++) {
  day[arr1[i]] = arr2[i];
}
console.log(day);

console.log(`------------------------Задание №2------------------------`);
// 2. const obj = {x: 1, y: 2, z: 3};
// Переберите этот объект циклом и возведите каждый элемент этого объекта в квадрат.

const obj = {
  x: 1,
  y: 2,
  z: 3,
};
console.log(obj);
for (let key in obj) {
  obj[key] **= 2;
}
console.log(obj);
