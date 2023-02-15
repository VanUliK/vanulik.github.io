fetch("./data.json")
  .then((response) => response.json())
  .then((data) => showItem(data))
  .catch((error) => console.error(error));

function showItem(data) {
  const templateEl = document.querySelector('.template');
  const itemGroup = document.querySelector('.featuredItems');


  data.forEach(element => {
    const itemEl = templateEl.content
      .querySelector(".featuredItem")
      .cloneNode(true);
    const headingEl = itemEl.querySelector(".featuredName");
    headingEl.textContent = element.head;

    const dscItem = itemEl.querySelector(".featuredText");
    dscItem.textContent = element.description;

    const infoEl = itemEl.querySelector(".featuredPrice");
    infoEl.textContent = element.price;

    const imgEl = itemEl.querySelector(".item-img__width");
    imgEl.src = element.image;
    itemGroup.appendChild(itemEl)

  });

}