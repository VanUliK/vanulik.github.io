const data = JSON.parse(dataProducts);
const fiCatalogEl = document.querySelector(".fi_catalog");
const templateEl = document.querySelector(".template");
const btnViewAllEl = document.querySelector(".view_all");

let end = 6;
let start = 0;
const visibleCount = 3;
let counter = 0;

showItems();

let addToCartBtn = document.querySelectorAll(".cart");
addItemToCart(addToCartBtn);

btnViewAllEl.addEventListener("click", function (e) {
  start = end;
  end = end + visibleCount;

  showItems();

  if (end >= data.length) {
    btnViewAllEl.classList.add("hide");
  }

  const newBtn = fiCatalogEl.querySelectorAll(".cart");
  const result = Array.from(newBtn).slice(start, end);
  addItemToCart(result);
});

function showItems() {
  const dataSlice = data.slice(start, end);

  dataSlice.forEach((item) => {
    const fiCatalogItemEl = templateEl.content
      .querySelector(".fi_catalog_item")
      .cloneNode(true);

    const imgEl = fiCatalogItemEl.querySelector(".fi_catalog_image");
    imgEl.src = item.img;

    const itemNameEl = fiCatalogItemEl.querySelector(".item_name");
    itemNameEl.textContent = item.name;

    const descriptionEl = fiCatalogItemEl.querySelector(".description");
    descriptionEl.textContent = item.description;

    const priceEl = fiCatalogItemEl.querySelector(".price");
    priceEl.textContent = item.price;

    fiCatalogEl.appendChild(fiCatalogItemEl);
  });
}

const countBlock = document.querySelector(".count_block");
let cartCounter = document.querySelector(".cart_num");

function addItemToCart(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      countBlock.classList.remove("hide");
      counter++;
      console.log(counter);
      cartCounter.textContent = counter;
      console.log(e.target);
    });
  });
}

const mainEl = document.querySelector('.main');
const headEl = document.querySelector('.head');
window.addEventListener('scroll', function (e) {
  const headHeight = headEl.getBoundingClientRect().height;
  if (window.pageYOffset > 0) {
    console.log(window.pageYOffset);
    headEl.classList.add('fix__head');

    mainEl.style.paddingTop = headHeight + "px";
  }
  else {
    headEl.classList.remove('fix__head');
    mainEl.style.paddingTop = 0;
  }
});

// let end = 6;
// let start = 0;
// let counter = 0;

// showItems();
// let addToCartBtn = document.querySelectorAll(".cart");
// addItemToCart(addToCartBtn);

// btnViewAllEl.addEventListener("click", function (e) {
//   start = end;
//   end = end + 3;
//   showItems();
//   if (end == data.length) {
//     btnViewAllEl.classList.add("hide");
//   }
// const newBtn = document.querySelectorAll(".cart");
// addToCartBtn = newBtn;
// addItemToCart(newBtn);
// });

// function showItems() {
//   for (i = start; i < end; i++) {
//     const fiCatalogItemEl = templateEl.content
//       .querySelector(".fi_catalog_item")
//       .cloneNode(true);

//     const imgEl = fiCatalogItemEl.querySelector(".fi_catalog_image");
//     imgEl.src = data[i].img;

//     const itemNameEl = fiCatalogItemEl.querySelector(".item_name");
//     itemNameEl.textContent = data[i].name;

//     const descriptionEl = fiCatalogItemEl.querySelector(".description");
//     descriptionEl.textContent = data[i].description;

//     const priceEl = fiCatalogItemEl.querySelector(".price");
//     priceEl.textContent = data[i].price;

//     fiCatalogEl.appendChild(fiCatalogItemEl);
//   }
// }

// const countBlock = document.querySelector(".count_block");
// let cartCounter = document.querySelector(".cart_num");

// function addItemToCart(buttons) {
//   buttons.forEach((button) => {
//     button.addEventListener("click", function (e) {
//       countBlock.classList.remove("hide");
//       counter += 1;
//       cartCounter.textContent = counter;
//     });
//   });
// }

// data.forEach(element => {
//     const fiCatalogItemEl = templateEl.content.querySelector('.fi_catalog_item').cloneNode(true);

//     const imgEl = fiCatalogItemEl.querySelector('.fi_catalog_image');
//     imgEl.src = element.img;

//     const itemNameEl = fiCatalogItemEl.querySelector('.item_name');
//     itemNameEl.textContent = element.name;

//     const descriptionEl = fiCatalogItemEl.querySelector('.description');
//     descriptionEl.textContent = element.description;

//     const priceEl = fiCatalogItemEl.querySelector('.price');
//     priceEl.textContent = element.price;

//     fiCatalogEl.appendChild(fiCatalogItemEl);
// });
