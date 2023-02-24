import { _fetch, debounce } from "../external/scripts/api.js";

const PRODUCT_URL = "http://localhost:3000/products";
let queryString = null;
let products = null;
let currentPage = 1;
let totalPages = null;
const limitPerPage = 10;

/************************ Creating URL parameters based on sorting values *******************/
function createSortURLparameters(value) {
    /* Sorting based on new arrival needs to be implemented manually */
    if (value == "price-ascending") return "_sort=price&_order=asc";
    if (value == "price-descending") return "_sort=price&_order=desc";
    if (value == "discount-descending") return "_sort=discount&_order=desc";
}

/********************* Creating additional URL query parameters based on selected filtering options **************************/
function createFilterURLparameters(selectedFilters) {
    let parameters = [];
    parameters.push(selectedFilters.color.map(color => `color=${color}`).join("&"));
    /* For size there is a need for manual filtration - which is done after getting the products and through url parameters */
    parameters.push(selectedFilters.gender.map(gender => `gender=${gender}`).join("&"));
    parameters.push(selectedFilters.pattern.map(pattern => `pattern=${pattern}`).join("&"));
    parameters.push(selectedFilters.discount.map(discount => `discount=${discount}`).join("&"));

    parameters = parameters.filter(parameter => parameter)

    return parameters.join("&");
}

/**************************************** Sorting based on new Arrival ******************************************/
function sortByNewArrivals(products) {
    if (document.querySelector("#sort input[value=new-arrival]").checked)
        return products.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    else
        return products;
}

/********************* Manual filtering based on sizes ************************/
function filterBySize(products, size) {
    let allSizes = [...size.clothing, ...size.shoe];
    return products.filter(product => {
        if (!allSizes.length) return true;
        else {
            for (let i = 0; i < product.size.length; i++) {
                if (allSizes.includes(product.size[i] + "")) return true;
            }
            return false;
        }
    })
}

/********************* Getting selected sorting options **************************/
function getSortOption() {
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

/**************** Displaying the products ********************/
function displayProducts(products) {

    console.log(products);

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

/************************* After window load ********************************/
window.addEventListener("load", async () => {
    try {
        queryString = new URLSearchParams(window.location.search).toString();

        products = await _fetch(`${PRODUCT_URL}?${queryString}`);
        products = await products.json();

        // Manual sorting based on new arrivals as it's the default value
        products = sortByNewArrivals(products);

        displayFilters(products);
        displayProducts(products);
    } catch (error) {
        return error;
    }
})

/******************* Adding event listner to sieves ************************/
document.querySelector("#sieve").addEventListener("change", async (event) => {
    if (!event.target.classList.contains("sieve")) return;

    let selectedFilters = getSelectedFilters();

    currentPage = 1;
    let newQueryString = `_limit=${limitPerPage}&_page=${currentPage}&${queryString}&${createFilterURLparameters(selectedFilters)}&${createSortURLparameters(getSortOption())}`;
    while (true) {
        if (newQueryString[0] == "&")
            newQueryString = newQueryString.slice(1);
        else if (newQueryString[newQueryString.length - 1] == "&")
            newQueryString = newQueryString.slice(0, newQueryString.length - 1);
        else
            break;
    }

    products = await _fetch(`${PRODUCT_URL}?${newQueryString}`);
    products = await products.json();

    // Manual filtering based on size
    products = filterBySize(products, selectedFilters.size);

    // Manual sorting based on new arrivals
    products = sortByNewArrivals(products);

    displayProducts(products)
})

// /***************************** Adding scroll event to window for scroll based pagination ******************************/
let debouncePaginition = debounce();
window.addEventListener("scroll", async (event) => {
    await debouncePaginition(async () => {
        if (window.innerHeight + Math.ceil(window.pageYOffset) >= document.body.offsetHeight) {

        }
        return Promise.resolve();
    }, 1000)
})