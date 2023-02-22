import { getProducts, getProduct } from "../external/scripts/products_api.js";

const productsURL = "../database/products_database.json";


getProduct(productsURL, 10)
    .then(product => {
        console.log(product);
    })
    .catch(error => {
        console.error(error);
    })