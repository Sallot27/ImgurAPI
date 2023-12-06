let btnXHR = document.getElementById('xhrSearch');
let btnFetch = document.getElementById('fetchSearch');
let btnFetchAsyncAwait = document.getElementById('fetchAsyncAwaitSearch');

let searchText = document.querySelector('header input[type="text"]');
let searchResults = document.getElementById("searchResults");

const clientId = "a4b616e1ef60967"; // Replace with your Imgur client ID

btnXHR.addEventListener("click", function () {
    // clear previous search results
    searchResults.innerHTML = "";
    fetchImgurAPI_UsingXHR(searchText.value);
});

btnFetch.addEventListener("click", function () {
    // clear previous search results
    searchResults.innerHTML = "";
    fetchImgurAPI_UsingFetch(searchText.value);
});

btnFetchAsyncAwait.addEventListener("click", function () {
    // clear previous search results
    searchResults.innerHTML = "";
    fetchImgurAPI_UsingFetchAsyncAwait(searchText.value)
        .catch((e) => {
            console.error(e);
        });
});

function fetchImgurAPI_UsingFetch(keyword) {
    if (!keyword) {
        return;
    }
    const albumId = keyword; // Assuming the user enters the album ID in the search field
    const url = `https://api.imgur.com/3/album/${albumId}/images`;
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': 'Client-ID ' + clientId
        }
    };
    fetch(url, requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error with the Imgur API: ' + response.status);
            }
        })
        .then((data) => {
            processResponse(data);
        })
        .catch((e) => {
            console.error(e);
        });
}

function fetchImgurAPI_UsingXHR(keyword) {
    if (!keyword) {
        return;
    }
    const albumId = keyword; // Assuming the user enters the album ID in the search field
    const url = `https://api.imgur.com/3/album/${albumId}/images`;
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            processResponse(JSON.parse(this.responseText));
        }
    });
    xhr.open("GET", url);
    xhr.setRequestHeader('Authorization', 'Client-ID ' + clientId);
    xhr.send();
}

function processResponse(resp) {
    for (const item of resp.data) {
        let imgElement = document.createElement("img");
        imgElement.src = item.link;
        imgElement.alt = item.title;
        searchResults.appendChild(imgElement);
    }
}

async function fetchImgurAPI_UsingFetchAsyncAwait(keyword) {
    if (!keyword) {
        return;
    }
    const albumId = keyword; // Assuming the user enters the album ID in the search field
    const url = `https://api.imgur.com/3/album/${albumId}/images`;
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': 'Client-ID ' + clientId
        }
    };
    const response = await fetch(url, requestOptions);
    if (response.ok) {
        const data = await response.json();
        processResponse(data);
    } else {
        throw new Error('Error with the Imgur API: ' + response.status);
    }
}
