// console.log("gna")

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


let data = JSON.parse(localStorage.getItem("cart"));
let totoalbill = document.querySelector("#total_bill")
console.log(data)
let cart = document.querySelector("#cart")
let x = 1;
function show() {
  data.map((function (el) {

    console.log(el.image.gallery[0])



    let div = document.createElement("div");
    div.id = "cartdiv"
    let div1 = document.createElement('div');
    // prodiv.id="prodivimg"
    let div2 = document.createElement("div");
    let div3 = document.createElement('div');

    let name = document.createElement("h3")
    name.innerText = "Name:-" + el.name;
    let color = document.createElement("h4");
    color.innerText = "Color:-" + el.color;
    // let size=el.size;
    let fit = document.createElement("h4")
    fit.innerText = "Fit:-" + el.fit
    let img = document.createElement("img")
    img.src = el.image.gallery[0]
    img.id = "img"
    let price = document.createElement("h2");
    price.innerText = "price:-" + el.price


    totoalbill.innerText = "Total Price:-" + el.price


    let btn1 = document.createElement("div");
    btn1.innerText = "-"



    let p = document.createElement("p")
    p.innerText = 1;
    p.className = "button"
    let btn2 = document.createElement("div");
    btn2.innerText = "+"
    let button = document.createElement("button")
    button.innerText = "Delete"
    button.className = "button"
    let id = el.id
    button.addEventListener('click', function (e) {

      let item = JSON.parse(localStorage.getItem("cart"))
      const filtered = items.filter(item => item.id !== id);

      localStorage.setItem('cart', JSON.stringify(filtered));
      show()
    })


    let price1 = +el.price
    totoalbill.innerHTML = price1
    btn1.addEventListener("click", function (e) {
      e.preventDefault()


      if (x > 1) {
        // totoalbill="TotalBill"+price1
        x--
        // totoalbill.innerText=price1-(+el.price)
        console.log(price1, el.price)
        totoalbill.innerText = "Total price:-" + (price1 - (el.price * x))
        p.innerText = x

      }


      // console.log(typeof totoalbill)
      // console.log("ganaa")
    })

    btn2.addEventListener("click", function (e) {
      e.preventDefault()

      if (x <= 3) {
        x++
        // totoalbill.innerText=((+price1)+(+el.price))
        totoalbill.innerText = "Total price:-" + (+price1 + (+el.price * x))
        // totoalbill.innerText=totoalbill-(+el.price)
        // totoalbill=totoalbill+el.price
        p.innerText = x
      } else {
        alert("maximum limit over")
      }

      // console.log("ganaa")
    })

    div3.append(btn1, p, btn2, button)
    div1.append(img)
    div2.append(name, color, fit, color, price)
    // prodiv.append(name,color,price)
    div.append(div1, div2, div3)
    cart.append(div)
  }))
}


show()