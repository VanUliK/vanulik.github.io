fetch("./data.json")
  .then((response) => response.json())
  .then((data) => showItem(data))
  .catch((error) => console.error(error));

function showItem(data) {
  const templateEl = document.querySelector('.template');
  const itemGroup = document.querySelector('.featuredItems');

  data.forEach(element => {
    const itemEl = templateEl.content
      .querySelector(".item_block")
      .cloneNode(true);

    const featuredItemAttribute = itemEl.querySelector(".featuredItem");
    console.log('featuredItem');
    featuredItemAttribute.setAttribute('data-id', element.id);
    featuredItemAttribute.setAttribute('data-name', element.head);
    featuredItemAttribute.setAttribute('data-price', element.price);

    const headingEl = itemEl.querySelector(".featuredName");
    headingEl.textContent = element.head;

    const dscItem = itemEl.querySelector(".featuredText");
    dscItem.textContent = element.description;


    const priceEl = itemEl.querySelector(".featuredPrice");
    const redSize = priceEl.querySelector('.featuredPrice_color');
    redSize.textContent = '$' + element.price.toFixed(2);

    const imgEl = itemEl.querySelector(".featuredImg");
    imgEl.src = element.image;
    itemGroup.appendChild(itemEl)
  });
}
