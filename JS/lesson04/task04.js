// Дан массив const arr = [2, 5, 9, 15, 1, 4];
// Выведите в консоль те элементы массива, которые больше 3-х, но меньше 10.

const arr1 = [2, 5, 9, 15, 1, 4];
for (let i = 0; i < arr1.length; i++) {
  const element = arr1[i];
  if (element >= 3 && element <= 10) {
    console.log(`элементы массива, которые больше 3-х, но меньше 10 - ${element}`);
  }
}


console.log(`второй вариант ---------------`);

const arr = [2, 5, 9, 15, 1, 4];
const arrFinal = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] > 3 && arr[i] < 10) {
    arrFinal.push((arr[i]));
  }
}
console.log(arrFinal);

console.log(`третий вариант ---------------`);


arr.forEach(element => {
  if (element <= 10 && element >= 3) {
    console.log(element);
  }
});


// Найдите сумму четных чисел от 2 до 100.

let sum = 0;
for (let i = 2; i <= 100; i++) {
  if (!(i % 2)) {
    sum += i;
  }
}
console.log(sum);

console.log(`второй вариант ---------------`);

sum = 0;
for (let i = 2; i <= 100; i += 2) {
  sum = sum + i;
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




console.log(`второй вариант ---------------`);


const arrNew = [1, 2, 3, 4, 5, 6, 7, 8, 9];
for (i = 0; i < arrNew.length; i++) {
  console.log("-" + arrNew.join('-') + '-')
}

console.log(`третий вариант ---------------`);

const arrNine = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let s = '-'
for (const arrayNew of arrNine) {
  s += arrayNew + '-'
}
console.log(s);


// Дан массив с числами. const = [2, 5, 9, 0, 3, 1, 4]; Запустите цикл, который будет по очереди выводить элементы этого массива в консоль до тех пор, пока не встретится элемент со значением 0. После этого цикл должен завершить свою работу.

const arr5 = [2, 5, 9, 0, 3, 1, 4];
for (let i = 0; i < arr5.length; i++) {
  const element = arr5[i];
  console.log(element);
  if (element === 0) {
    break;
  }
}