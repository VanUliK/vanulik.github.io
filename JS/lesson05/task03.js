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


const test1 = Object.values(obj.key1);
let sum = 0;
for (let i = 0; i < test1.length; i++) {
  sum += test1[i];
}
const test2 = Object.values(obj.key2);
for (let i = 0; i < test2.length; i++) {
  sum += test2[i];
}

const test3 = Object.values(obj.key3);
for (let i = 0; i < test3.length; i++) {
  sum += test3[i];
}

console.log(sum);




// console.log(obj);
// let sum = 0;
// for (let key in obj.key2) {
//   sum += Number(obj[obj.key2]);

//   console.log(sum);
// }
// console.log(sum);