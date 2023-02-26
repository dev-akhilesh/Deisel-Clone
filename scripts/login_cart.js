// Fetching the nav and footer
window.addEventListener("load", async () => {
  try {
    // Getting the nav bar
    let html = await Promise.all([
      fetch("./external/nav.html"),
      fetch("./external/footer.html"),
    ]);
    html[0] = await html[0].text();
    html[1] = await html[1].text();
    document.querySelector("nav").innerHTML = html[0];
    document.querySelector("footer").innerHTML = html[1];
  } catch (error) {
    console.error(error);
  }
});


let totoalbill = document.querySelector("#total_bill")
let cart = document.querySelector("#cart")
let x = 1;

function createCard(product) {
  return `
    <div id="cartdiv">
      <div id="prodivimg">
        <h3>${"Name: " + product.name}</h3>
        <h4>${"Color: " + product.color}</h4>
        <h4>${"Fit: " + product.model_fit}</h4>
        <img id="img" src="${product.image}" alt="">
        <h2>${"Price: ₹" + product.price}</h2>
        <button class="decrease" data-id="${product.id}">-</button>
        <p class="quantity">${product.quantity}</p>
        <button class="increase" data-id="${product.id}">+</button>
        <button class="button delete-button" data-id="${product.id}">Delete</button>
        
      </div>
    </div>
  `
}

// Creating DOM elements from the data in local storage 
function show() {

  let totalBill = 0;
  let cart = JSON.parse(localStorage.getItem("cart"));
  document.querySelector("#cart").innerHTML = cart.map(item => {
    totalBill += item.price * item.quantity;
    return createCard(item)
  }).join("")

  document.querySelector("#total_bill").innerHTML = `Total Bill: ₹${totalBill}`;
}
show()

// Activiting the plus button
document.querySelector("#cart").addEventListener("click", function (event) {
  if (!event.target.classList.contains("increase")) return;

  let items = JSON.parse(localStorage.getItem("cart"))
  for (let i = 0; i < items.length; i++) {
    if (items[i].id == event.target.dataset.id) {
      items[i].quantity++
      break;
    }
  }

  localStorage.setItem("cart", JSON.stringify(items))
  show();
})

// Activiting the minus button
document.querySelector("#cart").addEventListener("click", function (event) {
  if (!event.target.classList.contains("decrease")) return;

  let items = JSON.parse(localStorage.getItem("cart"))
  for (let i = 0; i < items.length; i++) {
    if (items[i].id == event.target.dataset.id) {
      items[i].quantity--

      if (items[i].quantity <= 0)
        items[i].quantity++;

      break;
    }
  }

  localStorage.setItem("cart", JSON.stringify(items))
  show();
})

// Adding delete function
document.querySelector("#cart").addEventListener('click', function (event) {
  if (!event.target.classList.contains('delete-button')) return;

  let items = JSON.parse(localStorage.getItem("cart"))
  const filtered = items.filter(item => item.id != event.target.dataset.id);

  localStorage.setItem('cart', JSON.stringify(filtered));
  show();
})