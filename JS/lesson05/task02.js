console.log(`------------------------Задание №1------------------------`);
// 1. Даны два массива: первый с названиями дней недели, а второй - с их порядковыми номерами:
// const arr1 = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
// const arr2 = [1, 2, 3, 4, 5, 6, 7];
// С помощью цикла создайте объект, ключами которого будут названия дней, а значениями - их номера.
const arr1 = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const arr2 = [1, 2, 3, 4, 5, 6, 7];
const dayFirstMethod = {};
for (let i = 0; i < arr1.length; i++) {
  dayFirstMethod[arr1[i]] = arr2[i];
}
console.log(dayFirstMethod);


arr1.forEach((element, index) => dayFirstMethod[element] = arr2[index]);
console.log(dayFirstMethod);


console.log(`------------------------Задание №2------------------------`);
// 2. const obj = {x: 1, y: 2, z: 3};
// Переберите этот объект циклом и возведите каждый элемент этого объекта в квадрат.

const obj = {
  x: 1,
  y: '2',
  z: 3,
};
console.log(Object.values(obj));

console.log(obj);
for (let key in obj) {
  if (typeof obj[key] === 'number')
    obj[key] **= 2;
  else
    console.log("Не все значения числа!");
}
console.log(obj);


for (let key of Object.values(obj)) {
  console.log(key ** 2);
}

const arr = Object.values(obj).map(x => x * x);
console.log(arr);
