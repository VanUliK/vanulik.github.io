// Создайте массив с элементами 1, 2 и 3. С помощью оператора ++ увеличьте каждый элемент массива на единицу.
// Узнайте длину следующего массива:
// const arr = [];
// arr[3] = 'a';
// arr[8] = 'b';
const arr = [1, 2, 3];
for (let i = 0; i < arr.length; i++) {
  arr[i]++;
}
console.log(arr);

// Пусть дан такой массив:
// const arr = [1, 2, 3];
// Добавьте ему в конец элементы 4 и 5.
const array = [1, 2, 3];
array.push(4);
array.push(5);
console.log(array);

// Создайте произвольный массив из 5 элементов, Удалите из него два элемента. Проверьте, какое станет значение свойства length после этого.
const arrRandom = [];
for (let i = 0; i < 5; i++) {
  arrRandom[i] = Math.floor(Math.random() * 10);
}
console.log(arrRandom);
for (let i = 0; i < 2; i++) {
  arrRandom.pop();
}
console.log(arrRandom);
console.log(arrRandom.length);