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
    key13: 1,

  },
  key4: {
    key1: 1,
    key2: 1,
    key3: 1,
    key13: 1,

  },

}

// Первый вариант

let sum = 0;
for (const key in obj) {
  for (const keyIn in obj[key]) {
    sum += obj[key][keyIn];
  }
}
console.log(sum);


// Второй вариант

// const sum = val =>
//   val instanceof Object
//     ? Object.values(val).reduce((acc, n) => acc + sum(n), 0)
//     : val;
// console.log(sum(obj));

// Третий вариант

// let sum = 0;
// for (const key in obj) {
//   console.log(Object.values(obj[key]).reduce((a, b) => a + b));
//   sum += Object.values(obj[key]).reduce((a, b) => a + b);
// }
// console.log(sum);




// const obj = {
//   key1: {
//     key1: 1,
//     key2: 2,
//     key3: 3,
//   },
//   key2: {
//     key1: 4,
//     key2: 5,
//     key3: 6,
//   },
//   key3: {
//     key1: 7,
//     key2: 8,
//     key3: 9,
//   },
// }

// Четвертый вариант

// const test1 = Object.values(obj.key1);
// let sum2 = 0;
// for (let i = 0; i < test1.length; i++) {
//   sum2 += test1[i];
// }
// const test2 = Object.values(obj.key2);
// for (let i = 0; i < test2.length; i++) {
//   sum2 += test2[i];
// }
// const test3 = Object.values(obj.key3);
// for (let i = 0; i < test3.length; i++) {
//   sum2 += test3[i];
// }
// console.log(sum2);

