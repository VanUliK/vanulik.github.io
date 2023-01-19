// 1. Создайте объект riddles 
const riddles = {};

// 2. Добавьте свойства question, answer
riddles.question = '',
  riddles.answer = '111'

// 3. создайте метод askQuestion который спрашивает у пользователя вопрос question и сравнивает ответ с answer
const askQuestion = () => {
  riddles.question = prompt('Введите ответ');
  if (riddles.question === this.answer) {
    console.log('Good');
  }
  else {
    console.log('вы проиграли');
  }
}
askQuestion();


// 4. Добавьте свойство hints (содержащее 2 подсказки)

riddles.hints = ['цифры', 'по порядку']
// console.log(ri);

// 5. Если пользователь ответил неверно, ему даётся одна подсказка


// 6. Если пользователь ответил второй раз неверно, даётся вторая подсказка


// 7. Если ответил неверно, то в консоль выводится текст: “вы проиграли”


// const riddles = {
//   question: 'where is my green suit?',
//   answer: 'Arkham Asylum',
//   riddler() {
//     userAnswer = prompt(this.question);
//     return console.log((userAnswer === this.answer) ? true : false);

//   }
// }
// riddles.riddler();