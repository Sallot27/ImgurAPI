const clientId = "a4b616e1ef60967";
const defaultAlbumId = 'Jfni3';

function requestAlbum() {
  let albumId = document.getElementById("albumIdField").innerText;
  if (!albumId) {
    albumId = defaultAlbumId;
  }

  fetch('https://api.imgur.com/3/album/' + albumId + '/images', {
    headers: {
      'Authorization': 'Client-ID ' + clientId
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Error with the imgur API');
    }
  })
  .then(data => {
    data.slice(0, 10).forEach(item => {
      console.log(item);
      requestImage(item.id);
    });
  })
  .catch(error => {
    console.log(error);
  });
}

function requestImage(imageHash) {
  fetch('https://api.imgur.com/3/image/' + imageHash, {
    headers: {
      'Authorization': 'Client-ID ' + clientId
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Error with the imgur API');
    }
  })
  .then(data => {
    const imgElem = document.createElement("img");
    imgElem.src = data.data.link;
    document.body.appendChild(imgElem);
  })
  .catch(error => {
    console.log(error);
  });
}
