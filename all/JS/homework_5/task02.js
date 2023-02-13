// Необходимо из объекта, который лежит в константе post вывести значения, к
// которым приписан комментарий, в консоль.

const post = {
  author: "John", // вывести этот текст
  postId: 23,
  comments: [
    {
      userId: 10,
      userName: "Alex",
      text: "lorem ipsum",
      rating: {
        likes: 10,
        dislikes: 2, // вывести это число
      },
    },
    {
      userId: 5, // вывести это число
      userName: "Jane",
      text: "lorem ipsum 2", // вывести этот текст
      rating: {
        likes: 3,
        dislikes: 1,
      },
    },
  ],
};


console.log(`------------------------Первый вариант------------------------`);

console.log(post.author);
for (var i = 0; i < post.comments.length; i++) {
  const element = post.comments[i];
  if (element.userName === 'Alex') {
    console.log(`У ${element.userName} ${element.rating.dislikes} дизлайка`);
  }
  if (element.userId == '5') {
    console.log(`userId - ${element.userId} \ntext: ${element.text}`);
  }
}

console.log(`------------------------Второй вариант------------------------`);

const firstArray = Object.values(post.comments[0]);
const ratingAray = Object.values(firstArray[3]);
const secondArray = Object.values(post.comments[1]);
// console.log(post.author, ratingAray[1], secondArray[0], secondArray[2]);
console.log(
  `${post.author} 
${Object.values(firstArray[3])[1]} или так ${ratingAray[1]}
${secondArray[0]} \n${secondArray[2]}`
);
