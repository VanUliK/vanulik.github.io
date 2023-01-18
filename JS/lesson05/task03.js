// Найдите сумму элементов приведенного объекта.
const obj = {
  key1: {
    key1: 1,
    key2: 2,
    key3: 3,
  },
  key2: {
    key1: 4,
    key2: 5,
    key3: 6,
  },
  key3: {
    key1: 7,
    key2: 8,
    key3: 9,
  },
}


console.log(obj);
let sum = 0;
for (let key in obj.key2) {
  sum += Number(obj[obj.key2]);

  console.log(sum);
}
// console.log(sum);