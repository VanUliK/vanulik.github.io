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

const productsPhoto = products.filter(product => product.photos >= '.jpg');
console.log(productsPhoto);

// Необходимо отсортировать массив products используя метод sort по цене, начиная с самой маленькой, заканчивая самой большой ценой, после чего вывести отсортированный массив в консоль.

products.sort((min, max) => min.price - max.price);
console.log(products);