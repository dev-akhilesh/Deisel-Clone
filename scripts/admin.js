import { _fetch, debounce } from "../external/scripts/api.js";

const PRODUCT_URL = "http://localhost:3000/products";

/******************* Low lighting all the tabs**************************/
function lowlightAllTabs() {
    document.querySelectorAll("#main .tab button").forEach(element => {
        element.classList.add("lowlight-tab");
        element.classList.remove("highlight-tab");
    })
}

/************************ Hiding all tabs ****************************/
function hideAllTabsContents() {
    document.querySelectorAll("#main .tab-content div").forEach(element => {
        element.classList.add("hide");
        element.classList.remove("show");
    })
}

/****************** Creating tabbing functionality **********************/
document.querySelectorAll("#main .tab > button").forEach(element => {
    element.addEventListener("click", function (event) {
        if (event.target.parentElement.classList.contains("products")) {
            lowlightAllTabs();
            hideAllTabsContents();

            // Highlighting the tab
            event.target.parentElement.classList.add("highlight-tab");
            event.target.parentElement.classList.remove("lowlight-tab");

            // Showing the products tab
            document.querySelector("#main .tab-content .products").classList.add("show");
            document.querySelector("#main .tab-content .products").classList.remove("hide");
        }
        else if (event.target.parentElement.classList.contains("users")) {
            lowlightAllTabs();
            hideAllTabsContents();

            // Highlighting the tab
            event.target.parentElement.classList.add("highlight-tab");
            event.target.parentElement.classList.remove("lowlight-tab");

            // Showing the users tab
            document.querySelector("#main .tab-content .users").classList.add("show");
            document.querySelector("#main .tab-content .users").classList.remove("hide");
        }
    })
})

function createTableRow(product) {
    return `
        <tr>
            <td class="id">${product.id}</td>
            <td class="image">
                <img src="${product.image}" alt="">
            </td>
            <td class="brand_name">${product.brand_name}</td>
            <td class="category">${product.category}</td>
            <td class="gender">${product.gender}</td>
            <td class="price">${product.price}</td>
            <td class="stock_status">${product.stock_status}</td>
            <td class="updated_at">${product.updated_at}</td>
            <td>
            <button class="view-product" data-id="${product.id}">View</button>
            </td>
            <td>
                <button class="edit-product" data-id="${product.id}">Edit</button>
            </td>
            <td>
                <button class="delete-product" data-id="${product.id}">Delete</button>
            </td>
        </tr>
    `
}

function displayProducts(products) {
    document.querySelector("#products-info tbody").innerHTML = products.map(product => createTableRow(product)).join("")
}

window.addEventListener("load", async event => {
    // Fetching all the products
    let products = await _fetch(PRODUCT_URL);
    let productsData = await products.json();

    displayProducts(productsData)
})

// Adding edit product functionality
document.querySelector("#products-info tbody").addEventListener("click", event => {
    if (!event.target.classList.contains("edit-product")) return;

    window.open(`./manipulate_product.html?id=${event.target.dataset.id}`)
})

// Adding view product functionality
document.querySelector("#products-info tbody").addEventListener("click", event => {
    if (!event.target.classList.contains("view-product")) return;

    window.open(`./singleProductPage.html?id=${event.target.dataset.id}`)
})

// Adding delete product functionality
document.querySelector("#products-info tbody").addEventListener("click", async event => {
    if (!event.target.classList.contains("delete-product")) return;

    try {
        // Use DELETE
        let res = await _fetch(`${PRODUCT_URL}/${event.target.dataset.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        res = await res.json();
        console.log(res);


        // Fetch all products
        let products = await _fetch(PRODUCT_URL);
        let productsData = await products.json();

        displayProducts(productsData)
    } catch (error) {
        console.error(error);
    }
})