const delayAmount = 500;
const retryAmount = 3;

/* 
    A function executer that introduces an delay before execution. 
    Takes a callback function as parameter that returns a promise.
    It itself returns a promise that gets resolved/rejected with the value of the returned promise of the callback function.
*/
let delay = (function (delay) {
    let queue = [];

    setInterval(async () => {
        if (queue.length) {
            let [func, resolve, reject] = queue.shift();
            try {
                resolve(await func())
            } catch (error) {
                reject(error);
            }
        }
    }, delay);

    return function (func) {
        let resolve, reject;
        let promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        })
        queue.push([func, resolve, reject]);
        return promise;
    }
})(delayAmount);

/* 
    Same as fetch function except it introduces a delay between each invocation
    And also retry if the returned promise has been rejected. It takes the same 
    parameters as fetch function.
*/
async function _fetch(url, options = null) {
    let retry = retryAmount;
    while (true) {
        try {
            return await delay(async () => await fetch(url, options));
        } catch (error) {
            if (retry <= 0) return error;
            retry--;
        }
    }
}

export {
    _fetch
}