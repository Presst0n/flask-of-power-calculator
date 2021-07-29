
const logIn = async (e) => {
    e.preventDefault();

    let clientId = document.getElementById('client-id');
    let secret = document.getElementById('secret');

    // let token = localStorage.getItem('token');

    try {
        const response = await fetch('https://eu.battle.net/oauth/token', {
            method: 'POST',
            body: `grant_type=client_credentials&client_id=${clientId.value}&client_secret=${secret.value}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const data = await response.json();
        // Maybe I should do null check here? We'll see later.  
        localStorage.setItem('client_id', clientId);
        localStorage.setItem('token', data?.access_token);
        localStorage.setItem('token_type', data?.token_type);

    } catch (error) {
        // Create method for displaying error above form.
        console.error('something went wrong', error);
    }

    clientId.value = "";
    secret.value = "";
}

// const validateToken = async (token) => {


//     const response = await fetch(`http://localhost:8080/jokes/random`, {
//         method: 'POST',
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: `token=${token}`
//     });
//     const data = await response.json();
//     console.log(data);
// }

document.getElementById('log-in').addEventListener('click', logIn);

const userAction = async (e) => {

    let ul = document.getElementsByClassName("errors")[0];
    if (ul.lastElementChild !== null){
        ul.removeChild(ul.lastElementChild);
    }
    
    let token = localStorage.getItem('token');
    let tokenType = localStorage.getItem('token_type');

    if (token === null || tokenType === null) {

        let li = document.createElement('li');
        li.innerText = `Invalid credentials. Please log in again.`;
        li.style.color = 'red';
        console.log(li);
        ul.appendChild(li);

        return;
    }




    let auctions = await getAuctionHouseData(token, tokenType);
    let span = document.getElementById('costs');
    span.innerText = '';
    let items = filteredAuctions(auctions);
    let sum = 0;

    items.forEach(e => {
        // console.log(e.name, `Price: ${e["lowest-price"]}`);

        if (e.name === "Nightshade") {
            sum += e["lowest-price"] * 3;
        }
        else {
            sum += e["lowest-price"] * 4;
        }
    });

    let multiply = document.getElementById('number-of-flasks');
    let flasksCraftingCosts = Math.round(((sum * ((multiply.value > 0) ? multiply.value : 1)) + Number.EPSILON) * 100) / 100;
    span.innerText = flasksCraftingCosts;
    let body = document.getElementsByTagName('body')[0];
    body.insertBefore(span, body.lastElementChild.previousElementSibling.previousElementSibling);

    // scriptJsVersioning();
}

// const scriptJsVersioning = () => {
//     let script = document.getElementById('main-js');
//     let srcValue = script.getAttribute('src');
//     let arrayOfChars = srcValue.split('');
//     let lastValues = arrayOfChars.splice(arrayOfChars.length - 3, 3);
//     let output = parseFloat(lastValues.join(''));
//     let result = 0.0;
//     result = (output + 0.1).toPrecision(2);
//     let newSrcValue = arrayOfChars.join('');
//     script.setAttribute('src', `${newSrcValue}${result}`);
// }

const getAuctionHouseData = async (token, tokenType) => {
    let ul = document.getElementsByClassName("errors")[0];

    if (ul.lastElementChild !== null){
        ul.removeChild(ul.lastElementChild);
    }
    
    try {
        // const response = await fetch('https://eu.battle.net/oauth/token', {
        //     method: 'POST',
        //     body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${secret}`,
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     }
        // });
        // const data = await response.json();
        const auctionsData = await fetch(`https://eu.api.blizzard.com/data/wow/connected-realm/3682/auctions?namespace=dynamic-eu`, {
            method: 'GET',
            headers: {
                'Authorization': tokenType + ' ' + token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return await auctionsData.json();

    } catch (error) {

        let li = document.createElement('li');
        li.innerText = `${error}`;
        li.style.color = 'red';
        ul.appendChild(li);

        console.log('something went wrong', error);
    }
}

// Nightshade: 171315
// Rising glory: 168586
// Marrowroot: 168589
// Widowbloom: 168583
// Vigil's Torch: 170554

const filteredAuctions = (auctions) => {
    let divider = 10000;

    let items = {
        "Vigils-torch": [],
        "Nightshade": [],
        "Rising-glory": [],
        "Marrowroot": [],
        "Widowbloom": []
    }

    auctions.auctions.forEach(async (e) => {
        if (e.item.id === 168589 || e.item.id === 171315 || e.item.id === 168586 || e.item.id === 168583 || e.item.id === 170554) {

            switch (e.item.id) {
                case 168589:
                    items['Marrowroot'].push((e.unit_price / divider).toFixed(2));
                    break;
                case 171315:
                    items['Nightshade'].push((e.unit_price / divider).toFixed(2));
                    break;
                case 168586:
                    items['Rising-glory'].push((e.unit_price / divider).toFixed(2));
                    break;
                case 168583:
                    items['Widowbloom'].push((e.unit_price / divider).toFixed(2));
                    break;
                case 170554:
                    items['Vigils-torch'].push((e.unit_price / divider).toFixed(2));
                    break;
                default:
                    break;
            }
        }
    });

    return [
        { 'name': "Vigils-torch", 'lowest-price': Math.min(...items["Vigils-torch"]) },
        { 'name': "Nightshade", 'lowest-price': Math.min(...items["Nightshade"]) },
        { 'name': "Rising-glory", 'lowest-price': Math.min(...items["Rising-glory"]) },
        { 'name': "Marrowroot", 'lowest-price': Math.min(...items["Marrowroot"]) },
        { 'name': "Widowbloom", 'lowest-price': Math.min(...items["Widowbloom"]) },
    ];
}


document.querySelector('#calculate')
    .addEventListener('click', userAction);