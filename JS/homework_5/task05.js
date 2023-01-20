// Дано 2 массива
// Вам необходимо объединить 2 этих массива, чтобы значения первого массива были ключами, а значения второго массива — значениями.

const en = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const ru = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];
const dayFirstMethod = {};
const daySecondMethod = {};


// Первый способ

for (let i = 0; i < en.length; i++) {
  if (en.length === ru.length) {
    dayFirstMethod[en[i]] = ru[i];
  }
}
console.log(dayFirstMethod);

// Второй способ

en.forEach((element, index) => daySecondMethod[element] = ru[index]);
console.log(daySecondMethod);