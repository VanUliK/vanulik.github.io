// Задание 5 
// 1. Пользователь с клавиатуры вводит число, Необходимо создать условный оператор который
// Выводит в консоль “Число больше 5”
// Выводит в консоль “Число меньше 5”
// Выводит в консоль “Число равно 5”

let number = Number(prompt('Введите число'));
function NumberMinFive() {
  if (number > 5) {
    console.log('Число больше 5');
  }
  else if (number < 5) {
    console.log('Число меньше 5');
  }
  else if (number === 5) {
    console.log('Число равно 5');
  }
  else {
    console.log('некорректно введено число');
  }
}
NumberMinFive();

// 2. Даны переменные test1 и test2. Проверьте, равны ли их значения и выведите соответствующее сообщение.

let test1 = 3;
let test2 = 3;
const Solution = (test1, test2) => {
  test1 === test2 ? console.log('равны') : console.log('не равны');
}
Solution(test1, test2);

// 3. Пользовать с клавиатуры вводит 2 числа
// Необходимо найти какое из двух чисел минимальное

let first = Number(prompt('Введите 1ое число'));
let second = Number(prompt('Введите 2ое число'));
const MinNuber = (first, second) => {
  let min = first;
  if (second < first) {
    min = second;
  }
  console.log(min);
}
MinNuber(first, second);

// 4. Пользователь с клавиатуры вводит число, Проверьте, что данная переменная больше нуля и меньше 15.

let num = Number(prompt('Введите число (больше нуля и меньше 15?)'));
const Number0vs15 = () => {
  num > 0 && num < 15 ? console.log('больше нуля и меньше 15') : console.log('не попадает в диапазон >0 и <15')
}
Number0vs15();