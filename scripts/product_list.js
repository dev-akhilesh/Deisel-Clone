import { _fetch, debounce } from "../external/scripts/api.js";

const PRODUCT_URL = "http://localhost:3000/products";
const limitPerPage = 12;
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
        <div data-id="${product.id}" class="product-card redirectable">
            <img data-id="${product.id}" src="${product.image}" alt="Image for product: ${product.name}" class="redirectable">
            <div data-id="${product.id}" class="product-brif redirectable">
                <p data-id="${product.id}" class="product-price redirectable">${"₹" + product.price}</p>
                <p data-id="${product.id}" class="product-color redirectable">${product.color}</p>
                <p data-id="${product.id}" class="product-name redirectable">${product.name}</p>
            </div>
            <button class="quick-view" 
                data-gallery=${JSON.stringify(product.gallery.map(element => element.image))}
                data-name="${product.name}"
                data-price=${product.price}
                data-color="${product.color}"
                data-sizes=${JSON.stringify(product.size)}
                data-description="${product.description}"
            >Quick View</button>
        </div>
    `;
}

/**************** Displaying the products by appending them to dom without removing the previous ones ********************/
function displayProducts(products) {
    document.querySelector("#products #list").innerHTML += products.map(product => createProductElement(product)).join("");
}

/*************** Creating filter options DOM elements **************/
function createFilter(filterType, filterValue) {
    return `
        <div class="filter-option">
            <span class="fake-checkbox">
                <input type="checkbox" data-type="${filterType}" data-value="${filterValue}" name="${filterType}-${filterValue.toLowerCase()}" class="filter-checkbox sieve">
            </span>
            <label for="${filterType}-${filterValue.toLowerCase()}">${filterValue}</label>
        </div>
    `;
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
    document.querySelector("#filters .color-filter").innerHTML += `<div class="option-container">${filterList.color.map(color => createFilter("color", color)).join("")}</div>`;
    document.querySelector("#filters .chothing-size-filter").innerHTML += `<div class="option-container">${filterList.size.cloth.map(size => createFilter("chothing-size", size)).join("")}</div>`;
    document.querySelector("#filters .shoe-size-filter").innerHTML += `<div class="option-container">${filterList.size.shoe.map(size => createFilter("shoe-size", size)).join("")}</div>`;
    document.querySelector("#filters .gender-filter").innerHTML += `<div class="option-container">${filterList.gender.map(gender => createFilter("gender", gender)).join("")}</div>`;
    document.querySelector("#filters .pattern-filter").innerHTML += `<div class="option-container">${filterList.pattern.map(pattern => createFilter("pattern", pattern)).join("")}</div>`;
    document.querySelector("#filters .discount-filter").innerHTML += `<div class="option-container">${filterList.discount.map(discount => createFilter("discount", discount)).join("")}</div>`;
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

/***************************** Sets the visibility of the go to top button **************************/
function goToTopButtonVisibility() {
    if (window.pageYOffset == 0) {
        // Hide the "Go to top" button
        document.querySelector("#go-to-top").classList.add("hide");
        document.querySelector("#go-to-top").classList.remove("show");
    }
    else {
        // Show the "Go to top" button
        document.querySelector("#go-to-top").classList.remove("hide");
        document.querySelector("#go-to-top").classList.add("show");
    }
}

/************************* After window load ********************************/
window.addEventListener("load", async () => {
    try {
        let products = await _fetch(PRODUCT_URL);
        products = await products.json();

    //    console.log(products)
        displayFilters(products);
        displayProducts(products);
=======
        // Getting the query parameters after the first page load and storing for future fetching operations
        queryString = new URLSearchParams(window.location.search).toString();

        // Fetching products only based on first url query parameters to get the filter list
        let _products = await _fetch(`${PRODUCT_URL}?${queryString == "" ? "" : `&${queryString}`}`);
        _products = await _products.json();
        displayFilters(_products);


        await setUpFromScratch(`${PRODUCT_URL}?_limit=${limitPerPage}&_page=1&_sort=created_at&_order=desc${queryString == "" ? "" : `&${queryString}`}`);

        // Toggling the visibility of go to top button
        goToTopButtonVisibility();

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

        await setUpFromScratch(`${PRODUCT_URL}?_limit=${limitPerPage}&_page=1${sieveQueryString == "" ? "" : `&${sieveQueryString}`}${queryString == "" ? "" : `&${queryString}`}`);

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
                        products = await _fetch(`${PRODUCT_URL}?_limit=${limitPerPage}&_page=${currentPage}${sieveQueryString == "" ? "" : `&${sieveQueryString}`}${queryString == "" ? "" : `&${queryString}`}`);
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

/******************* Taking an image URL and appending it to modal window image container
                    and returning a promise that resolves when the image is loaded ************************/
async function createAndAppendImage(imageURL) {
    // Creating an image element and waiting for it to decode
    let img = new Image();
    img.src = imageURL;
    await img.decode();

    // Appending the image
    document.querySelector("#modal-content .image-container").innerHTML = "";
    document.querySelector("#modal-window .image-container").appendChild(img);
}

/********************* Creating the size element for modal window ********************/
function createModalSizeElement(size) {
    return `
        <div class="product-size-div">
            <span>${size}</span>
        </div>
    `
}

/******************** Adding static info to modal window - name, price etc.. *******************/
function addStaticModalInfo(element) {
    document.querySelector("#modal-content .product-name-modal").innerText = element.getAttribute("data-name");
    document.querySelector("#modal-content .product-price-modal").innerText = "₹" + element.getAttribute("data-price");
    document.querySelector("#modal-content .product-description-modal").innerText = element.getAttribute("data-description");
    document.querySelector("#modal-content .product-color-modal").innerText = element.getAttribute("data-color");

    // Adding the sizes to the modal window
    document.querySelector("#modal-content .product-sizes-modal").innerHTML = JSON.parse(element.getAttribute("data-sizes")).map(size => createModalSizeElement(size)).join("")
}

/**************************** Checkes whether to display the previous and next button or not ************************ */
function modalImageButtonsVisibility(index, arrLength) {
    if (index == 0) {
        // Hiding the previous button as it is starting with the first image
        document.querySelector("#modal-content .previous-img").classList.add("hide");
        document.querySelector("#modal-content .previous-img").classList.remove("show");
    }
    else if (index > 0) {
        // Show the previous button as it is not the first image
        document.querySelector("#modal-content .previous-img").classList.remove("hide");
        document.querySelector("#modal-content .previous-img").classList.add("show");
    }

    if (index == arrLength - 1) {
        // Hiding the next button as it is the last image
        document.querySelector("#modal-content .next-img").classList.add("hide");
        document.querySelector("#modal-content .next-img").classList.remove("show");
    }
    else if (index < arrLength - 1) {
        // Show the next button as it is not the last image
        document.querySelector("#modal-content .next-img").classList.remove("hide");
        document.querySelector("#modal-content .next-img").classList.add("show");
    }
}

/***************************** Adding click event to "Quick View" button **********************************/
document.querySelector("#products #list").addEventListener("click", async (event) => {
    if (!event.target.classList.contains("quick-view")) return;

    // Showing the animation element: loading before modal window is displayed
    document.querySelector("#before-modal-loader").classList.remove("hide");
    document.querySelector("#before-modal-loader").classList.add("show-before-modal-loading");

    let images = JSON.parse(event.target.getAttribute("data-gallery"))
    let index = 0;

    await createAndAppendImage(images[index]);
    addStaticModalInfo(event.target);
    modalImageButtonsVisibility(index, images.length);

    // Hiding the animation element: loading after modal window is displayed
    document.querySelector("#before-modal-loader").classList.add("hide");
    document.querySelector("#before-modal-loader").classList.remove("show-before-modal-loading");

    // Showing the modal window
    document.querySelector("#modal-window").classList.remove("hide");
    document.querySelector("#modal-window").classList.add("show-modal");

    /******************* Adding click event to previous image button ************************/
    document.querySelector("#modal-content .previous-img").addEventListener("click", async () => {
        // Make the image div opaque
        document.querySelector("#modal-content .image-container").classList.add("opaqued");
        document.querySelector("#modal-content .image-container").classList.remove("cleared");

        // Show the loading animation
        document.querySelector("#modal-window #loading-modal").classList.add("show");
        document.querySelector("#modal-window #loading-modal").classList.remove("hide");

        index--;
        if (index < 0) {
            index = 0;
            modalImageButtonsVisibility(index, images.length);
        }
        else {
            await createAndAppendImage(images[index]);
            modalImageButtonsVisibility(index, images.length);
        }

        // Hide the loading animation
        document.querySelector("#modal-window #loading-modal").classList.remove("show");
        document.querySelector("#modal-window #loading-modal").classList.add("hide");

        // Make the image div clear
        document.querySelector("#modal-content .image-container").classList.remove("opaqued");
        document.querySelector("#modal-content .image-container").classList.add("cleared");
    })

    /******************* Adding click event to next image button ************************/
    document.querySelector("#modal-content .next-img").addEventListener("click", async () => {
        // Make the image div opaque
        document.querySelector("#modal-content .image-container").classList.add("opaqued");
        document.querySelector("#modal-content .image-container").classList.remove("cleared");

        // Show the loading animation
        document.querySelector("#modal-window #loading-modal").classList.add("show");
        document.querySelector("#modal-window #loading-modal").classList.remove("hide");

        index++;
        if (index >= images.length) {
            index = images.length - 1
            modalImageButtonsVisibility(index, images.length);
        }
        else {
            await createAndAppendImage(images[index]);
            modalImageButtonsVisibility(index, images.length);
        }

        // Hide the loading animation
        document.querySelector("#modal-window #loading-modal").classList.remove("show");
        document.querySelector("#modal-window #loading-modal").classList.add("hide");

        document.querySelector("#modal-content .image-container").classList.remove("opaqued");
        document.querySelector("#modal-content .image-container").classList.add("cleared");
    })

    /************************************ Adding click event to close button **********************************/
    document.querySelector("#modal-window .close-button").addEventListener("click", () => {
        // Resetting the modal window
        images = [];
        index = 0;
        document.querySelector("#modal-content .image-container").innerHTML = "";

        // Hide the modal window
        document.querySelector("#modal-window").classList.add("hide");
        document.querySelector("#modal-window").classList.remove("show-modal");
    })
})

/******************************* Adding event to "Go to top" button *******************************************/
document.querySelector("#go-to-top").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
})

/**************************** Hiding the "Go to top button" at the top of the page *****************************/
window.addEventListener("scroll", event => {
    goToTopButtonVisibility();
})

/************************** Adding event listner to the products cards that will redirect to indevidual page ****************************/
document.querySelector("#products #list").addEventListener("click", async (event) => {
    if (!event.target.classList.contains("redirectable")) return;

    window.location.href = `./singleProductPage.html?id=${event.target.getAttribute("data-id")}`;
})