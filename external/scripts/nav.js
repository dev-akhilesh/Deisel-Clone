let isAlternate = false;
setInterval(() => {
  if (isAlternate) {
    document.getElementById("offers").innerHTML =
      "ADDITIONAL 10% OFF ON MINIMUM ORDER VALUE OF 18000 USE CODE EXTRA:10";
  } else {
    document.getElementById("offers").innerHTML =
      "TRACK YOU ORDERS & RETURNS HERE";
  }
  isAlternate = !isAlternate;
}, 2000);

setTimeout(function () {
  // console.log(document.getElementById("nav-search"));
  document
    .getElementById("nav-search")
    .addEventListener("submit", function (event) {
      event.preventDefault();
    //   console.log(event.target.querySelector(".search-bar").value);
      window.location.href = `./product_list.html?q=${
        event.target.querySelector(".search-bar").value
      }`;
    });
}, 1000);

