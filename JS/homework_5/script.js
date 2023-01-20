console.log(`------------------------Задание №1------------------------`);
// 1
// Дан объект numbers.Необходимо в консоль вывести все значения больше или равные 3.

const numbers = {
  keyin1: 1,
  keyin2: 2,
  keyin3: 3,
  keyin4: 4,
  keyin5: 5,
  keyin6: 6,
  keyin7: 7,
}

for (const key in numbers) {
  if (numbers[key] >= 3) {
    console.log(numbers[key]);
  }
}


console.log(`------------------------Задание №2------------------------`);

// 2
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
// Object.values(post);

// console.log(post?.comments?.rating?.dislikes);
// Object.values(post.comments);
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




console.log(`------------------------Задание №3------------------------`);

// 3
// Дан массив products, необходимо цену каждого продукта уменьшить на 15 % используя
// метод forEach.

// const products = [
//   {
//     id: 3,
//     price: 200,
//   },
//   {
//     id: 4,
//     price: 900,
//   },
//   {
//     id: 1,
//     price: 1000,
//   },
// ];

console.log(`------------------------Задание №4------------------------`);

// 4
// https://medium.com/@stasonmars/подробно-про-метод-filter-в-javascript-1fcb239a0d74

const products = [
  {
    id: 3,
    price: 127,
    photos: [
      "1.jpg",
      "2.jpg",
    ],
  },
  {
    id: 5,
    price: 499,
    photos: [],
  },
  {
    id: 10,
    price: 26,
    photos: [
      "3.jpg",
    ],
  },
  {
    id: 8,
    price: 78,
  },
];

// Необходимо вывести в консоль массив продуктов в котором есть хоть одна фотография используя метод filter.Исходные данные - массив products.


const findPicture = products.filter(function (pic) {
  for (let i = 0; i < pic[i].length; i++) {
    const element = pic[i]
    console.log(pic[i]);
  }
  return pic;

});

for (let i = 0; i < findPicture.length; i++) {
  const element = findPicture[i];
  if (findPicture[i].photos > 0) {
    console.log('yes');
  }
}

console.log(findPicture[0].photos);




// Необходимо отсортировать массив products используя метод sort по цене, начиная с самой маленькой, заканчивая самой большой ценой, после чего вывести отсортированный массив в консоль.

console.log(`------------------------Задание №5------------------------`);

// 5
// Дано 2 массива

// const en = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
// const ru = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

// Вам необходимо объединить 2 этих массива, чтобы значения первого массива были ключами, а значения второго массива — значениями.