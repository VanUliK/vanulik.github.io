// Пусть у нас дан массив состоящий из 10 элементов с произвольными числами. Давайте переберем его циклом и числа, которые делятся на 2, возведем в квадрат и выведем в консоль, а числа, которые делятся на 3, возведем в куб и выведем в консоль.

const arrTen = [];
const arrTenSqr = [];
for (let i = 0; i < 10; i++) {
  arrTen[i] = Math.floor((Math.random() * 10));
  if (arrTen[i] % 2 === 0) {
    arrTenSqr[i] = arrTen[i] ** 2;
  }
  else if (arrTen[i] % 3 === 0) {
    arrTenSqr[i] = arrTen[i] ** 3;
  }
  else {
    arrTenSqr[i] = arrTen[i];
  }
}
console.log(arrTen);
console.log(arrTenSqr);

// С помощью двух вложенных циклов выведите на экран следующую строку:
// Дан массив const arr = [1, 2, 3, 2, 4, 3, 5, 6, 3, 2, 3];
// Подсчитайте количество цифр 3 в этом массиве.
let sum = 0;
const arr = [1, 2, 3, 2, 4, 3, 5, 6, 3, 2, 3];
for (let i = 0; i < arr.length; i++) {
  const element = arr[i];
  if (element === 3) {
    sum++;
  }
}
console.log(`Количество цифр 3 в массиве = ${sum}`);
console.log(arr);

// Дан следующий массив:
// [1, 2, 3, 4, 5]
// С помощью метода splice преобразуйте массив в следующий:
// [1, 4, 5]

const array = [1, 2, 3, 4, 5];
array.splice(1, 2);
console.log(array);
