let isAlternate = false;
setInterval(() => {
    if (isAlternate) {
        document.getElementById("offers").innerHTML = "ADDITIONLA 10% OFF ON MINIMUM ORDER VALUE OF 18000 USE CODE EXTRA:10"
    } else {
        document.getElementById("offers").innerHTML = "TRACK YOU ORDERS & RETURNS HERE"
    }
    isAlternate = !isAlternate;
}, 2000);