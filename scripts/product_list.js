import { _fetch } from "../external/scripts/api.js";
const PRODUCT_URL = "http://localhost:3000/products";



function createURLparameters(selectedFilters) {
    let parameters = [];
    parameters.push(selectedFilters.color.map(color => `color=${color}`).join("&"));
    /* For size there is a need for manual filtration */
    parameters.push(selectedFilters.gender.map(gender => `gender=${gender}`).join("&"));
    parameters.push(selectedFilters.pattern.map(pattern => `pattern=${pattern}`).join("&"));
    parameters.push(selectedFilters.discount.map(discount => `discount=${discount}`).join("&"));

    parameters = parameters.join("&");

    parameters = parameters.split("");
    // Getting rid of "&" at beginning
    for (let i = 0; i < parameters.length; i++) {
        if (parameters[i] === "&")
            parameters.shift();
        else
            break;
    }
    // Getting rid of "&" at end
    for (let i = parameters.length - 1; i >= 0; i--) {
        if (parameters[i] === "&")
            parameters.pop();
        else
            break;
    }

    console.log(parameters.join(""));
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

/**************** Filtering the products based on the selected filters ******************/
// function filterProducts(products) {

//     let selectedFilters = getSelectedFilters();

//     // Filtering based on color
//     products = products.filter(product => !selectedFilters.color.length || selectedFilters.color.includes(product.color.toLowerCase()));

//     // Filtering based on chothing size
//     products = products.filter(product => {
//         if (!["Footwear", "Sandals", "Sneakers"].includes(product.name_of_commodity)) {
//             for (let i = 0; i < product.size.length; i++) {
//                 if (!selectedFilters.clothing.length || selectedFilters.color.includes(product.size[i]))
//                     return true;
//             }
//         }
//         else
//             return true;

//         return false;
//     });

//     // Filtering based on shoe size
//     products = products.filter(product => {
//         if (["Footwear", "Sandals", "Sneakers"].includes(product.name_of_commodity)) {
//             for (let i = 0; i < product.size.length; i++) {
//                 if (!selectedFilters.shoe.length || selectedFilters.shoe.includes(product.size[i]))
//                     return true;
//             }
//         }
//         else
//             return true;

//         return false;
//     });

//     // Filtering based on gender
//     products = products.filter(product => !selectedFilters.gender.length || selectedFilters.gender.includes(product.gender.toLowerCase()));

//     // Filtering based on color
//     products = products.filter(product => !selectedFilters.pattern.length || selectedFilters.pattern.includes(product.pattern.toLowerCase()));

//     // Filtering based on color
//     products = products.filter(product => !selectedFilters.discount.length || selectedFilters.discount.includes(product.discount.toLowerCase()));

//     return products;
// }

/**************** Displaying the products ********************/
function displayProducts(products) {

    // console.log(products);

}

/*************** Creating filter options DOM elements **************/
function createFilter(filterType, filterValue) {
    return `<div class="filter-option">
        <span class="fake-checkbox">
            <input type="checkbox" data-type="${filterType}" data-value="${filterValue}" name="${filterType}-${filterValue.toLowerCase()}" class="filter-checkbox">
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

window.addEventListener("load", async () => {
    try {
        let products = await _fetch(PRODUCT_URL);
        products = await products.json();


        displayFilters(products);
        displayProducts(products);


        document.querySelector("#filters").addEventListener("change", (event) => {
            if (!event.target.classList.contains("filter-checkbox")) return;

            createURLparameters(getSelectedFilters())
            displayProducts(products)
        })




        // let search = new URLSearchParams(window.location.search);
        // console.log(search.toString("m"));

    } catch (error) {
        return error;
    }
})

