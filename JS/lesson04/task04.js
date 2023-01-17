// Дан массив const arr = [2, 5, 9, 15, 1, 4];
// Выведите в консоль те элементы массива, которые больше 3-х, но меньше 10.

const arr = [2, 5, 9, 15, 1, 4];
for (let i = 0; i < arr.length; i++) {
  const element = arr[i];
  if (element >= 3 && element <= 10) {
    console.log(`элементы массива, которые больше 3-х, но меньше 10 - ${element}`);
  }
}

// Найдите сумму четных чисел от 2 до 100.
let sum = 0;
for (let i = 2; i <= 100; i++) {
  if (!(i % 2)) {
    sum += i;
  }
}
console.log(sum);


// Дан массив const = [2, 5, 9, 3, 1, 4];
// Найдите сумму элементов этого массива.

const array = [2, 5, 9, 3, 1, 4];
sum = 0;
for (let i = 0; i < array.length; i++) {
  const element = array[i];
  sum += element;
}
console.log(sum);

// С помощью цикла сформируйте строку '-1-2-3-4-5-6-7-8-9-'.

let text = '-';
for (let i = 1; i <= 9; i++) {
  text += i + '-';
}
console.log(text);

// Дан массив с числами. const = [2, 5, 9, 0, 3, 1, 4]; Запустите цикл, который будет по очереди выводить элементы этого массива в консоль до тех пор, пока не встретится элемент со значением 0. После этого цикл должен завершить свою работу.

const arr5 = [2, 5, 9, 0, 3, 1, 4];
for (let i = 0; i < arr5.length; i++) {
  const element = arr5[i];
  console.log(element);
  if (element === 0) {
    break;
  }
}