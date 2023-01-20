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

console.log('----------------------------------------------');

const riddles = {
  question: 'Введите набор цифр',
  answer: '123',
  hints: ['цифры', 'по порядку', 'asfasf'],
  askQuestion: function () {
    this.userAnswer = prompt('Введите ответ', this.question);
    if (this.userAnswer === this.answer) {
      console.log('Вы угадали');
    }
    else if (this.hints.length > 0) {
      this.showHints();
      this.askQuestion();
    }
    else {
      console.log('Не угадали');
    }
  },
  showHints: function () {

    alert(this.hints.shift())
  }
};
riddles.askQuestion();


// const riddles = {
//   question: 'Зимой и летом одним цветом',
//   answer: 'елка',
//   hints: [
//     'Зеленая',
//     'С иголками',

//   ],
//   askQuestion() {
//     if (prompt(this.question).toLowerCase() !== riddles.answer) {
//       do {
//         alert(this.hints.shift());
//         if (prompt(this.question).toLowerCase() == riddles.answer) {
//           return alert('Молодец');
//         }
//       } while (this.hints.length > 0);
//     }
//     console.log('вы проиграли');
//   }
// }

// riddles.askQuestion();
