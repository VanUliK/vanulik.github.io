console.log(`------------------------Задание №1------------------------`);
// 1. Создайте объект с ключами от 1 до 7, в качестве значений содержащий имена дней недели.Выведите на экран “Вторник”
const day = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  7: 'Воскресенье',
};
console.log(day[2]);

// Первый вариант

const dayArr = Object.values(day);
console.log(dayArr);

// Второй вариант

const dayArray = Object.keys(day);
for (let i = 0; i < dayArray.length; i++) {
  if (dayArray[i] > 3 && dayArray[i] < 7)
    console.log(day[dayArray[i]]);
}

// Третий вариант

console.log(Object.entries(day));


console.log(`------------------------Задание №2------------------------`);
//  2. Создайте объект user с ключами 'name', 'surname', ‘age’. Выведите на экран фамилию, имя и возраст через дефис.
const user = {
  name: 'Иван',
  surname: 'Васин',
  age: '35'
};
console.log(`${user.name} - ${user.surname} - ${user.age}`);
let temp = ' ';
for (const key in user) {
  temp += user[key] + ' ';
}
console.log(temp);

console.log(`------------------------Задание №3------------------------`);
// 3. Добавьте в объект user свойство отчество, которое пользователь должен ввести с клавиатуры
user.patronymic = prompt('Введите отчество'),
  console.log(user.patronymic);


console.log(`------------------------Задание №4------------------------`);
// 4. Удалите свойство surname
delete user.surname;
console.log(user);