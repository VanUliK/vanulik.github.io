// Создайте объект riddles 
// Добавьте свойства question, answer
// создайте метод askQuestion который спрашивает у пользователя вопрос question и сравнивает ответ с answer
// Добавьте свойство hints (содержащее 2 подсказки)
// Если пользователь ответил неверно, ему даётся одна подсказка
// Если пользователь ответил второй раз неверно, даётся вторая подсказка
// Если ответил неверно, то в консоль выводится текст: “вы проиграли”


const riddles = {
  question: 'Зимой и летом одним цветом',
  answer: 'ель',
  hints: ['3 буквы', 'зеленая', 'колючая'],
  askQuestion: function () {
    this.userAnswer = prompt(this.question).toLowerCase();
    if (this.userAnswer === this.answer) {
      console.log('Вы угадали');
    }
    else if (this.hints.length > 0) {
      this.showHints();
      this.askQuestion();
    }
    else {
      console.log('Вы проиграли');
    }
  },
  showHints: function () {

    alert(this.hints.shift())
  }
};
riddles.askQuestion();