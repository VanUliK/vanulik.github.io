// С помощью цикла for выведите в консоль числа от 11 до 33.
for (let i = 11; i <= 33; i++) {
  console.log(i);
}

console.log(`второй вариант ---------------`);

const arrFirst = [];
for (let i = 11; i <= 33; i++) {
  arrFirst.push(i);
}
console.log(arrFirst);



// С помощью цикла for выведите в консоль нечетные числа в промежутке от 1 до 99.
for (let i = 1; i < 100; i++) {
  if (i % 2 === 0) {
    console.log(i);
  }
}

console.log(`второй вариант ---------------`);

const arrSecond = [];
for (let i = 1; i <= 99; i++) {

  if (i % 2) {
    // !(i % 2)
    arrSecond.push(i);
  }
}
console.log(arrSecond);

// С помощью цикла for выведите в консоль числа от 100 до 0.
for (let i = 100; i > 0; i--) {
  console.log(i);
}

console.log(`второй вариант ---------------`);

const arrThird = [];

for (let i = 100; i >= 0; i--) {
  arrThird.push(i);
}
console.log(arrThird);


// Дано число num с неким начальным значением. Умножайте его на 3 столько раз, пока результат умножения не станет больше 1000. Какое число получится? Посчитайте количество итераций, необходимых для этого.

let num = 2;
let i = 0;
while (num < 1000) {
  num *= 3;
  i++;
}
console.log(`количество итераций ${i}`);

