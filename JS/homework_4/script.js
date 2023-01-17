// 1.
console.log(`------------------------Задание №1------------------------`);

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

// 2.
const arr = [1, 2, 3, 4, 5, 6, 7];
arr.splice(5, 6);
console.log(arr);


console.log(`------------------------Задание №3------------------------`);

// 3.
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


  if (element === elemFind) {
  }
  else {
  }
}
console.log(`Сумма всех элементов массива = ${sum}`);
console.log(`Минимальное число массива = ${min}`);
findNumber(arrRandom, elemFind);

console.log(`------------------------Задание №4------------------------`);

// 4.
for (let i = 0; i < 20; i++) {
  let x = '';
  for (var j = 0; j <= i; j++) {
    x += 'x';
  }
  console.log(x);
}

console.log(`------------------------Задание №5------------------------`);

// 5. Построить таблицу умножения

console.log(`------------------------Задание №6------------------------`);

// 6. Реализовать алгоритм умножения матриц