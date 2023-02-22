import { requestDelay, retry } from "./delays.js";

// A callback executer with an intervel of requestDelay ms. The callback function MUST return a promise.
let rateLimiter = (function () {
    let queue = [];

    setInterval(async () => {
        if (queue.length) {
            let [callback, resolve, reject] = queue.shift();

            try {
                resolve(await callback())
            } catch (error) {
                reject(error);
            }
        }
    }, requestDelay);

    return function (callback) {
        let promiseResolve, promiseReject;

        let promise = new Promise((resolve, reject) => {
            promiseResolve = resolve;
            promiseReject = reject;
        })

        queue.push([callback, promiseResolve, promiseReject]);

        return promise;
    }
})();

// Modified fetch function with a rate limiter with a delay of requestDelay ms to prevent overloading the API. Takes an url and an optional argument - an object - same as the fetch function.
async function rateLimitedFetch(url, options = {}) {
    if (Object.keys(options).length === 0)
        return await rateLimiter(async () => await fetch(url));
    else
        return await rateLimiter(async () => await fetch(url, options));
}

// Same as above rateLimitedFetch, except on promise rejetion, it retries the request up to "retry" times. retry < 0 will be treted as 0
async function rateLimitedFetchRetry(retry, url, options = {}) {
    while (true) {
        try {
            return await rateLimitedFetch(url, options);
        } catch (error) {
            if (retry <= 0)
                return error;
            retry--;
        }
    }
}

async function getAllData(retry, url) {
    try {
        let response = await rateLimitedFetchRetry(retry, url);
        response = await response.json();
        return response;
    } catch (error) {
        return error;
    }
}



/***********  To be modified later **************/
async function overwriteAllData(retry, data) {
    try {
        let response = await rateLimitedFetchRetry(retry, userURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        response = await response.text();
        return response;
    } catch (error) {
        return error;
    }
}
/************************************************ */


// Takes an url and returns all of the products as an array through a promise.
async function getProducts(url) {
    try {
        let response = await getAllData(retry, url);
        return response.products;
    }
    catch (error) {
        return error;
    }
}

// Takes an url and an id and returns that specific product1 through a promise.
async function getProduct(url, id) {
    try {
        let products = await getProducts(url);
        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                return products[i];
            }
        }
    }
    catch (error) {
        return error;
    }
}


/***********  To be modified later **************/
async function overwriteAllUsers(retry, userList) {
    try {
        let response = await overwriteAllData(retry, {
            users: [...userList]
        });
        return response;
    } catch (error) {
        return error;
    }
}

async function deleteUser(retry, id) {
    try {
        let users = await getUsers(retry);
        users = users.filter(user => user.id != id);
        return await overwriteAllUsers(retry, users);
    } catch (error) {
        return error;
    }
}

async function addUser(retry, user) {
    try {
        let users = await getUsers(retry);
        users.push(user);
        return await overwriteAllUsers(retry, users);
    } catch (error) {
        return error;
    }
}

async function updateUser(retry, id, userData) {
    try {
        let users = await getUsers(retry);
        for (let user of users) {
            if (user.id === id) {
                for (let key in userData) {
                    user[key] = userData[key];
                }
                break;
            }
        }
        return await overwriteAllUsers(retry, users);
    } catch (error) {
        return error;
    }
}
/************************************************ */



export {
    rateLimitedFetchRetry,
    getProducts,
    getProduct,
    overwriteAllUsers,
    deleteUser,
    addUser,
    updateUser
}