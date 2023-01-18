console.log(`------------------------Задание №1------------------------`);
// 1.
// Необходимо с помощью цикла for вывести следующие 11 строк в консоль:
// 0 – это ноль
// 1 – нечетное число
// 2 – четное число
// 3 – нечетное число
// …
// 10 – четное число

for (let i = 0; i <= 10; i++) {
  if (i === 0) {
    console.log(`${i} - это ноль`);
  }
  else if (i % 2) {
    console.log(`${i} - нечетное число`);
  }
  else {
    console.log(`${i} - четное число`);
  }
}

console.log(`------------------------Задание №2------------------------`);
// 2. Дан массив [1, 2, 3, 4, 5, 6, 7]
// Сделайте из этого массива следующий [1, 2, 3, 6, 7]

const arr = [1, 2, 3, 4, 5, 6, 7];
arr.splice(3, 2);
console.log(arr);


console.log(`------------------------Задание №3------------------------`);
// 3.
// Используя Math.random() вам необходимо генерировать цифры от 0 до 9, и создать массив состоящий из 5 таких элементов
// 1. Рассчитать сумму элементов этого массива
// 2. Найти минимальное число
// 3. Найти есть ли в этом массиве число 3

const arrayRandom = (x) => {
  for (let i = 0; i < x; i++) {
    arrRandom[i] = Math.floor(Math.random() * 10);
  }
}

function findNumber(arrRandom, elem) {
  for (let i = 0; i < arr.length; i++) {
    if (arrRandom[i] === elem) {
      return console.log(`В данном массиве есть цифра ${elem}`);
    }
  }
  return console.log(`В данном массиве нет цифры ${elem}`);
}

const arrRandom = [];
arrayRandom(5);
console.log(arrRandom);
let sum = 0;
let min = arrRandom[0];
let elemFind = 3;
for (let i = 0; i < arrRandom.length; i++) {
  const element = arrRandom[i];
  if (min > element) {
    min = element;
  }
  sum += element;
}
console.log(`Сумма всех элементов массива = ${sum}`);
console.log(`Минимальное число массива = ${min}`);
findNumber(arrRandom, elemFind);

console.log(`------------------------Задание №4------------------------`);
// 4.
// Необходимо вывести горку в консоль (используя цикл for), как показано на
// рисунке, только у вашей горки должно быть 20 рядов, а не 5:

// x
// xx
// xxx
// xxxx
// xxxxx
let x = ' ';
for (let i = 0; i < 20; i++) {
  x += 'x';
  console.log(x);
}

console.log(`------------------------Задание №5------------------------`);
// 5. Построить таблицу умножения

let count = 1;
const table = [];
for (let i = 1; i <= 10; i++) {
  for (let j = 1; j <= 10; j++) {
    table[j] = i * j;
  }
  console.log(table);
}

console.log(`------------------------Задание №6------------------------`);
// 6. Реализовать алгоритм умножения матриц

function multiArray(A, B) {
  let rowA = A.length,
    colA = A[0].length,
    rowB = B.length,
    colB = B[0].length;
  const multiArr = [];
  if (colA != rowB) return false;
  for (let i = 0; i < rowA; i++) {
    multiArr[i] = [];
  }
  for (let k = 0; k < colB; k++) {
    for (let i = 0; i < rowA; i++) {
      let temp = 0;
      for (let j = 0; j < rowB; j++) {
        temp += A[i][j] * B[j][k];
      }
      multiArr[i][k] = temp;
    }
  }
  return multiArr;
}
const matrixA = [[1, 2], [3, 2]];
const matrixB = [[3, 2], [1, 1]];

// multiArray(matrixA, matrixB);
// [[5, 4], [11, 8]]

const matrixC = [
  [2, 5],
  [6, 7],
  [1, 8],
];
const matrixD = [
  [1, 2, 1],
  [0, 1, 0],
];

// multiArray(matrixC, matrixD);
// [
//   [2, 9, 2],
//   [6, 19, 6],
//   [1, 10, 1],
// ]

console.log(multiArray(matrixA, matrixB));
console.log(multiArray(matrixC, matrixD));

