// 1
// Создайте функцию которая возводит переданное число в куб, необходимо вывести в консоль результат 2^3 степени + 3 ^ 3 степени
let numberA = Number(prompt('Введите число A'));
let numberB = Number(prompt('Введите число B'));
let numberC = Number(prompt('Введите число C'));

const Exponentiation = (a, b) => {
  console.log(`результат: ${numberA}^3 + ${numberB}^3 = ${a ** 3 + b ** 3}`);
}
Exponentiation(numberA, numberB)

// 2
// Пользователь вводит с клавиатуры число, если ввёл текст, необходимо вывести что значение задано неверно
// Создать фукнцию, которая высчитывает 13% от данного числа и выводит в консоль текст "Размер заработной платы за вычетом налогов равен значение"
let salarySum = Number(prompt('Введите размер з/п'));

const Salary = (salarySum) => {
  if (Number.isInteger(salarySum)) {
    console.log(`Размер заработной платы за вычетом налогов равен ${salarySum * 0.87}`);
  }
  else {
    console.log('Введено некорректное значение');
  }
}
Salary(salarySum);

// 3
// Пользователь с клавиатуры вводит 3 числа, необходимо создать функцию, которая определяет максимальное значение среди этих чисел
const maxNumber = (maxA, maxB, maxC) => {
  let max = maxA;
  if (maxB > max) max = maxB;
  if (maxC > max) max = maxC;
  console.log(`максимальное значение среди чисел ${numberA}, ${numberB} и ${numberC} - ${max}`);
}
maxNumber(numberA, numberB, numberC);

// 4
// Необходимо реализовать четыре функции, каждая функция должна принимать по два
// числа и выполнять одну из операций (каждая функция выполняет одну из них):
// 1. Сложение
// 2. Разность
// 3. Умножение
// 4. Деление
// Необходимо сделать так, чтобы функция вернула число, например выражение
// console.log(sum(2, 6)); должно вывести число 8 в консоль (sum - функция
// сложения в данном примере, ваши названия функций могут отличаться).
// Округлять значения, которые возвращают функции не нужно, однако, обратите
// внимание на разность, функция должна вычесть из большего числа меньшее, либо
// вернуть 0, если числа равны.
// Функциям всегда передаются корректные числа, проверки на NaN, Infinity делать
// не нужно.
let sum;
const Sum = (a, b) => {
  return sum = a + b;
}
Sum(numberA, numberB);
console.log(`Сложение ${numberA} и ${numberB} = ${sum}`);

let diff;
const Diff = (a, b) => {
  (a > b) ? (diff = a - b) : (diff = b - a);
  return diff;
}
Diff(numberA, numberB);
(numberA > numberB) ? console.log(`Разность ${numberA} и ${numberB} = ${diff}`) : console.log(`Разность ${numberB} и ${numberA} = ${diff}`);

let multi;
const Multi = (a, b) => {
  return multi = a * b;
}
Multi(numberA, numberB);
console.log(`Умножение ${numberA} и ${numberB} = ${multi}`);

let delenie;
const Delenie = (a, b) => {
  return delenie = a / b;
}
Delenie(numberA, numberB);
console.log(`Деление ${numberA} на ${numberB} = ${delenie}`);

