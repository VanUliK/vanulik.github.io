// Дан массив products, необходимо цену каждого продукта уменьшить на 15 % используя
// метод forEach.

const products = [
  {
    id: 3,
    price: 200,
  },
  {
    id: 4,
    price: 900,
  },
  {
    id: 1,
    price: 1000,
  },
];

console.log(`------------------------Первый вариант------------------------`);
// Вывод значений price построчно

products.forEach(element => {
  const arrayProducts = Object.values(element);
  let newPrice = arrayProducts[1] * 0.85
  console.log(newPrice);
});

console.log(`------------------------Второй вариант------------------------`);
// Вывод массивом

products.forEach(element => {
  element.price *= 0.85;
});
console.log(products);
