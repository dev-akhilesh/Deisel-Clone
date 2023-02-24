import { _fetch, debounce } from "../external/scripts/api.js";

const PRODUCT_URL = "http://localhost:3000/products";
const limitPerPage = 10;
let queryString = null;
let products = null;
let currentPage = null;
let currentProductCount = null;
let totalPages = null;
let debouncePaginition = debounce();
let isLoaded = false;
let totalProducts = null;

/************************ Creating URL parameters based on sorting values *******************/
function createSortURLparameters(value) {
    if (value == "new-arrival") return "_sort=created_at&_order=desc";
    if (value == "price-ascending") return "_sort=price&_order=asc";
    if (value == "price-descending") return "_sort=price&_order=desc";
    if (value == "discount-descending") return "_sort=discount&_order=desc";
}

/********************* Creating additional URL query parameters based on selected filtering options **************************/
function createFilterURLparameters(selectedFilters) {
    let parameters = [];
    parameters.push(selectedFilters.color.map(color => `color=${color}`).join("&"));
    parameters.push(selectedFilters.size.clothing.map(size => `size_like=\\b${size}\\b`).join("&"));
    parameters.push(selectedFilters.size.shoe.map(size => `size_like=${size}`).join("&"));
    parameters.push(selectedFilters.gender.map(gender => `gender=${gender}`).join("&"));
    parameters.push(selectedFilters.pattern.map(pattern => `pattern=${pattern}`).join("&"));
    parameters.push(selectedFilters.discount.map(discount => `discount=${discount}`).join("&"));

    parameters = parameters.filter(parameter => parameter)
    return parameters.join("&");
}

/********************* Getting selected sorting options **************************/
function getSelectedSortOption() {
    return document.querySelector("#sort input[name=sort-option]:checked").value;
}

/******************** Getting selected filters *********************/
function getSelectedFilters() {
    let list = {
        color: [],
        size: {
            clothing: [],
            shoe: []
        },
        gender: [],
        pattern: [],
        discount: []
    };

    document.querySelectorAll("#filters .color-filter input:checked").forEach(element => {
        list.color.push(element.getAttribute("data-value"));
    });
    document.querySelectorAll("#filters .chothing-size-filter input:checked").forEach(element => {
        list.size.clothing.push(element.getAttribute("data-value"));
    });
    document.querySelectorAll("#filters .shoe-size-filter input:checked").forEach(element => {
        list.size.shoe.push(element.getAttribute("data-value"));
    });
    document.querySelectorAll("#filters .gender-filter input:checked").forEach(element => {
        list.gender.push(element.getAttribute("data-value"));
    });
    document.querySelectorAll("#filters .pattern-filter input:checked").forEach(element => {
        list.pattern.push(element.getAttribute("data-value"));
    });
    document.querySelectorAll("#filters .discount-filter input:checked").forEach(element => {
        list.discount.push(element.getAttribute("data-value"));
    });

    return list;
}

/******************************* Making a query string based on all the sieve parameters ****************************/
function getSieveQueryString() {
    let filterQuery = createFilterURLparameters(getSelectedFilters());
    let sortQuery = createSortURLparameters(getSelectedSortOption());

    if (!filterQuery && !sortQuery) return "";
    if (!filterQuery || !sortQuery) return filterQuery || sortQuery;
    if (filterQuery && sortQuery) return `${filterQuery}&${sortQuery}`;
}

/******************** Creating DOM Element for individual product ********************/
function createProductElement(product) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="Image for product: ${product.name}">
            <div class="product-brif">
                <p class="product-price">${"₹" + product.price}</p>
                <p class="product-color">${product.color}</p>
                <p class="product-name">${product.name}</p>
            </div>
            <button class="quick-view">Quick View</button>
        </div>
    `;
}

/**************** Displaying the products by appending them to dom without removing the previous ones ********************/
function displayProducts(products) {
    document.querySelector("#products #list").innerHTML += products.map(product => createProductElement(product));
}

/*************** Creating filter options DOM elements **************/
function createFilter(filterType, filterValue) {
    return `<div class="filter-option">
        <span class="fake-checkbox">
            <input type="checkbox" data-type="${filterType}" data-value="${filterValue}" name="${filterType}-${filterValue.toLowerCase()}" class="filter-checkbox sieve">
        </span>
        <label for="${filterType}-${filterValue.toLowerCase()}">${filterValue}</label>
    </div>`;
}

/********* Create the filter options list by: color, size: chothing & shoe, gender, pattern, discount ***********/
function createFilterList(products) {
    let filterList = {
        color: {},
        size: {
            cloth: {},
            shoe: {}
        },
        gender: {},
        pattern: {},
        discount: {}
    }

    products.forEach(product => {
        if (filterList.color[product.color] == undefined) filterList.color[product.color] = null;
        if (filterList.gender[product.gender] == undefined) filterList.gender[product.gender] = null;
        if (filterList.pattern[product.pattern] == undefined) filterList.pattern[product.pattern] = null;
        if (filterList.discount[product.discount] == undefined) filterList.discount[product.discount] = null;

        product.size.forEach(size => {
            if (["XS", "S", "M", "L", "XL", "XXL"].includes(size)) {
                if (filterList.size.cloth[size] === undefined) filterList.size.cloth[size] = null;
            }
            else {
                if (filterList.size.shoe[size] === undefined) filterList.size.shoe[size] = null;
            }
        })
    })

    filterList.color = Object.keys(filterList.color);
    filterList.size.cloth = Object.keys(filterList.size.cloth);
    filterList.size.shoe = Object.keys(filterList.size.shoe);
    filterList.gender = Object.keys(filterList.gender);
    filterList.pattern = Object.keys(filterList.pattern);
    filterList.discount = Object.keys(filterList.discount);

    return filterList;
}

/***************Displaying the filters to DOM *****************/
function displayFilters(products) {
    let filterList = createFilterList(products);

    // Creating color filter list
    document.querySelector("#filters .color-filter").innerHTML += filterList.color.map(color => createFilter("color", color)).join("");
    document.querySelector("#filters .chothing-size-filter").innerHTML += filterList.size.cloth.map(size => createFilter("chothing-size", size)).join("");
    document.querySelector("#filters .shoe-size-filter").innerHTML += filterList.size.shoe.map(size => createFilter("shoe-size", size)).join("");
    document.querySelector("#filters .gender-filter").innerHTML += filterList.gender.map(gender => createFilter("gender", gender)).join("");
    document.querySelector("#filters .pattern-filter").innerHTML += filterList.pattern.map(pattern => createFilter("pattern", pattern)).join("");
    document.querySelector("#filters .discount-filter").innerHTML += filterList.discount.map(discount => createFilter("discount", discount)).join("");
}

/******************************* Setting up some things as if it it's the first load of the page ********************************/
async function setUpFromScratch(url) {
    // Getting sorted value based on new arrivals as it's the default value
    products = await _fetch(url);

    // Setting the variables from scratch
    currentPage = 1;
    totalProducts = products.headers.get("x-total-count");
    totalPages = Math.ceil(products.headers.get("x-total-count") / limitPerPage);
    products = await products.json();
    currentProductCount = products.length;

    // If no products were fetched, display error message and return
    if (totalProducts == 0) {
        document.querySelector("#products #list").innerHTML = `<h2>No Matching Products Found :(</h2>`;
        return;
    }

    // Displaying the products
    document.querySelector("#products #list").innerHTML = "";
    displayProducts(products);

    // Making the parent element of loding animation element visible
    document.querySelector("#loading").classList.remove("hide");
    document.querySelector("#loading").classList.add("show");

    // Displaying the current and total product count
    document.querySelector("#loading span:nth-child(1)").innerText = currentProductCount;
    document.querySelector("#loading span:nth-child(2)").innerText = totalProducts;
}

/************************* After window load ********************************/
window.addEventListener("load", async () => {
    try {
        // Getting the query parameters after the first page load and storing for future fetching operations
        queryString = new URLSearchParams(window.location.search).toString();

        // Fetching products only based on first url query parameters to get the filter list
        let _products = await _fetch(`${PRODUCT_URL}?${queryString == "" ? "" : `&${queryString}`}`);
        _products = await _products.json();
        displayFilters(_products);

        await setUpFromScratch(`${PRODUCT_URL}?_limit=${limitPerPage}&_page=1&_sort=created_at&_order=desc${queryString == "" ? "" : `&${queryString}`}`);

        isLoaded = true;
    } catch (error) {
        // If fetching promise is getting rejected, display error message
        document.querySelector("#products #list").innerHTML = `<h2>Problem Fetching From The Server :(</h2>`;
        console.error(error);
    }
})

/******************* Adding event listner to sieves ************************/
document.querySelector("#sieve").addEventListener("change", async (event) => {
    if (!event.target.classList.contains("sieve")) return;

    try {
        // Making the parent element of loding animation element hidden
        document.querySelector("#loading").classList.add("hide");
        document.querySelector("#loading").classList.remove("show");

        // Getting the sieve value as query parameters
        let sieveQueryString = getSieveQueryString();

        await setUpFromScratch(`${PRODUCT_URL}?_limit=${limitPerPage}&_page=1${sieveQueryString == "" ? "" : `&${sieveQueryString}`}`);

    } catch (error) {
        document.querySelector("#products #list").innerHTML = `<h2>Problem Fetching From The Server :(</h2>`;
        console.error(error);
    }
})

/***************************** Adding scroll event to window for scroll based pagination ******************************/
window.addEventListener("scroll", async (event) => {
    await debouncePaginition(async () => {
        currentPage++;
        if (currentPage <= totalPages) {
            // If user is at the bottom of the page
            if (window.innerHeight + Math.ceil(window.pageYOffset) >= document.body.offsetHeight) {
                if (isLoaded) {
                    try {
                        isLoaded = false;

                        // Showing the animation element
                        document.querySelector("#loading .lds-ring").classList.remove("hide");
                        document.querySelector("#loading .lds-ring").classList.add("show");

                        // Getting the sieve value as query parameters and fetching the products with peginition
                        let sieveQueryString = getSieveQueryString();
                        products = await _fetch(`${PRODUCT_URL}?_limit=${limitPerPage}&_page=${currentPage}&${sieveQueryString == "" ? "" : `&${sieveQueryString}`}`);
                        products = await products.json();

                        // Hide the animation element as products are fetched successfully
                        document.querySelector("#loading .lds-ring").classList.add("hide");
                        document.querySelector("#loading .lds-ring").classList.remove("show");

                        // Displaying the products
                        displayProducts(products);

                        // Displaying the current and total product count
                        currentProductCount += products.length;
                        document.querySelector("#loading span:nth-child(1)").innerText = currentProductCount;
                        document.querySelector("#loading span:nth-child(2)").innerText = totalProducts;

                        isLoaded = true;
                    } catch (error) {
                        // If fetching promise is getting rejected, display error message and also decrease the page number as the page couldn't been fetched
                        currentPage--;

                        // Hiding the animation element
                        document.querySelector("#loading .lds-ring").classList.add("hide");
                        document.querySelector("#loading .lds-ring").classList.remove("show");

                        document.querySelector("#products #list").innerHTML = `<h2>Problem Fetching More Products From The Server :(</h2>`;
                        console.error(error);
                    }
                }
            }
        }
        else
            currentPage--;
        return Promise.resolve();
    }, 500)
})