import { _fetch, debounce } from "../external/scripts/api.js";

const PRODUCT_URL = "http://localhost:3000/products";
let id = null;

function addSingleValues(product) {
    document.querySelectorAll("#form form input:not(#gallery-main, #submit, .gallery-input, .size-input), #form form textarea").forEach(element => {
        element.value = product[element.getAttribute("id")];
    })
}

function createGalleryFields(gallery) {
    document.querySelector("#gallery-other").innerHTML = "<button class=\"gallery-add\">Add</button><br>" + gallery.map(img => `
        <button class="delete-button gallery-delete">Delete</button>
        <input type="text" value="${img}" class="gallery-input"><br>
    `).join("")
}

function createSizes(_sizes) {
    document.querySelector("#size-list").innerHTML = "<button class=\"size-add\">Add</button><br>" + _sizes.map(size => `
        <button class="delete-button size-delete">Delete</button>
        <input type="text" value="${size}" class="size-input"><br>
    `).join("")
}

function getFormData() {
    let data = {}
    document.querySelectorAll("#form form input:not(#gallery-main, #submit, .gallery-input, .size-input), #form form textarea, #form form select").forEach(element => {

        data[element.getAttribute("id")] = element.value;
    })

    data.image = document.querySelector("#gallery-main").value;

    data.gallery = []
    let i = 0;
    document.querySelectorAll("#form .gallery-input").forEach(element => {
        i++;
        data.gallery.push({
            image: element.value,
            position: i,
            vedio: "false"
        })
    })

    data.size = []
    document.querySelectorAll("#form .size-input").forEach(element => {
        data.size.push(element.value)
    })

    return data;
}

window.addEventListener("load", async event => {
    try {
        // Adding the form
        let form = await fetch("../external/product_manipulation_form.html");
        form = await form.text()
        document.querySelector("#form").innerHTML = form;

        // Getting the product ID if present in the query parameters
        id = new URLSearchParams(window.location.search).get("id");
        if (id) {
            // Getting the product
            let product = await _fetch(`${PRODUCT_URL}?id=${id}`);
            product = await product.json();
            product = product[0];

            document.querySelector("#page-info").innerText = `Edit Product With ID: ${product.id}`;

            // Adding  product sizes to DOM
            createSizes(product.size);

            // Adding main gallery image
            document.querySelector("#gallery-main").setAttribute("value", product.image)

            // Adding images fields to DOM
            createGalleryFields(product.gallery.map(img => img.image));

            // Adding other single values to form in DOM
            addSingleValues(product);
        }
        else {
            document.querySelector("#page-info").innerText = `Add A New Product`;
            document.querySelector("#gallery-other").innerHTML = "<button class=\"gallery-add\">Add</button><br>";
            document.querySelector("#size-list").innerHTML = "<button class=\"size-add\">Add</button><br>"
        }
    } catch (error) {
        console.error(error);
    }
})

// Activating the gallery delete button
document.querySelector("#form").addEventListener("click", function (event) {
    if (!event.target.classList.contains("gallery-delete")) return;

    let temp = []
    document.querySelectorAll(".gallery-delete+input").forEach(input => temp.push(input.value))
    temp = temp.filter(img => img != event.target.nextElementSibling.value)
    createGalleryFields(temp)
})

// Activating the size delete button
document.querySelector("#form").addEventListener("click", function (event) {
    if (!event.target.classList.contains("size-delete")) return;

    let temp = []
    document.querySelectorAll(".size-delete+input").forEach(input => temp.push(input.value))
    temp = temp.filter(size => size != event.target.nextElementSibling.value)
    createSizes(temp);
})

// Activating the gallery add button
document.querySelector("#form").addEventListener("click", function (event) {
    if (!event.target.classList.contains("gallery-add")) return;

    document.querySelector("#gallery-other").innerHTML += `
        <button class="delete-button gallery-delete">Delete</button>
        <input type="text" class="gallery-input"><br>
    `
})

// Activating the size add button
document.querySelector("#form").addEventListener("click", function (event) {
    if (!event.target.classList.contains("size-add")) return;

    document.querySelector("#size-list").innerHTML += `
        <button class="delete-button size-delete">Delete</button>
        <input type="text" class="size-input"><br>
    `
})

// Adding submit event to form
document.querySelector("#form").addEventListener("submit", async event => {
    event.preventDefault();

    let formData = getFormData()
    try {
        if (!id) {
            // Use POST
            let res = await _fetch(PRODUCT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            res = await res.json();
            console.log(res);
        }
        else {
            // Use PUT
            let res = await _fetch(`${PRODUCT_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            res = await res.json();
            console.log(res);
        }
    } catch (error) {
        console.error(error);
    }
})