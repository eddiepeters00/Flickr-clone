const searchBtn = document.getElementById('search-button');
const searchContainer = document.getElementById('search-container');
const loadingContainer = document.getElementById('loading-container');

const prePageBtn = document.getElementById('pre-page-button');
const nextPageBtn = document.getElementById('next-page-button');
const amountErrorText = document.getElementById('amount-error-text');
const searchErrorText = document.getElementById('search-error-text');
const invalidSearchText = document.createElement('h4');

let nbrOfImages;
let page = 1;


searchBtn.addEventListener('click', e => {
    e.preventDefault();
    amountErrorText.style.display = 'none';
    searchErrorText.style.display = 'none';
    invalidSearchText.style.display = 'none';

    const textInput = document.getElementById('search-input');
    searchText = textInput.value.toLowerCase();

    nbrOfImages = document.getElementById('amount-input').value;

    if (!checkForInputErrors(searchText, nbrOfImages)){
        searchContainer.style.height = '100%';
        fetchImages(searchText, nbrOfImages, page);
    }
});


//Fetches the images on the previus page
prePageBtn.addEventListener('click', () => {
    page--;
    fetchImages(searchText, nbrOfImages, page);
    console.log('prev');
});


//Fetches the images on the next page
nextPageBtn.addEventListener('click', () => {
    page++;
    fetchImages(searchText, nbrOfImages, page);
    console.log('next');
});


function checkForInputErrors(searchText, nbrOfImages) {
    let foundError = false;
    if (searchText === '') {
        console.log('Search is empty');
        searchErrorText.style.display = 'block';
        foundError = true;
    }

    if (nbrOfImages > 500 || nbrOfImages < 1) {
        amountErrorText.style.display = 'block';
        foundError = true;
    }

    return foundError;
}


//Fetches images from the Flickr API and displays them on the page.
function fetchImages(searchText, nbrOfImages, page) {
    const imageFeedContainer = document.querySelector('.image-feed-container');
    imageFeedContainer.innerHTML = '';

    const sortSelection = document.getElementById('sort-selection').value;
    const url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=70b34f31df03f69ceb08c94f2dd17004&text=${searchText}&per_page=${nbrOfImages}&sort=${sortSelection}&page=${page}&format=json&nojsoncallback=1`;
    console.log(url);
    const selectedSize = document.getElementById('size-selection').value;

    displayLoading();


    fetch(url).then(response => {
        if (response.status >= 200 && response.status < 300) {
            return response.json();
        }
        else {
            throw 'Could not fetch data';
        }
    }).then(data => {
        let totalPages = data.photos.pages;
        hideLoading();

        console.log('DATA:', data);
        if(data.photos.photo.length != 0){
            displayImages(data.photos.photo, selectedSize);
            displayPageButtons(totalPages);
        }

        else{
            hidePageButtons();
            console.log('No photos found');

            invalidSearchText.style.display = 'block';
            invalidSearchText.innerText = 'What does that even mean? Search for something legit!';
            invalidSearchText.style.color = 'hsl(0, 100%, 50%)';
            document.body.appendChild(invalidSearchText);
        }

    }).catch(error => {
        console.log('ERROR:', error);
        hideLoading();
        displayFetchErrorMessage(error);
    });
}


//Displays all the images that were fetched
function displayImages(photos, size) {
    const imgFeed = document.querySelector('.image-feed-container');

    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_${size}.jpg`;
        imgFeed.appendChild(img);

        //Img effect on click
        let clickCounter = 0;
        img.addEventListener('click', () => {
            clickCounter++;
            console.log('image clicked')
            if (clickCounter % 2 === 1) {
                img.classList.add('image-clicked');
            }
            else {
                img.classList.remove('image-clicked');
            }
        });
    });
}


//Displays a loading animation
function displayLoading() {
    loadingContainer.style.display = 'block';
    const loadingAnimation = {
        targets: '#loading-container span',
        keyframes: [
            { delay: anime.stagger(10), color: 'hsl(200, 70%, 80%)', duration: 100 },
            { delay: anime.stagger(10), scale: 0.5, delay: 50 }
        ],

        loop: true,
    }
    anime(loadingAnimation);
}


function hideLoading() {
    loadingContainer.style.display = 'none';
}


//Displays / removes the page-buttons 
function displayPageButtons(totalPages) {
    prePageBtn.style.display = 'none';
    nextPageBtn.style.display = 'block';

    if (page > 1) {
        prePageBtn.style.display = 'block';

        if (page === totalPages) {
            nextPageBtn.style.display = 'none';
        }
    }
    else {
        nextPageBtn.style.display = 'block';
        prePageBtn.style.display = 'none';
    }
}

function hidePageButtons(){
    prePageBtn.style.display = 'none';
    nextPageBtn.style.display = 'none';
}


//Displays an error-message
function displayFetchErrorMessage(error) {
    const errorMessageContainer = document.createElement('div');
    const errorMessage = document.createElement('h3');
    errorMessage.innerText = error;
    errorMessage.style.color = '#ff0000';
    errorMessageContainer.appendChild(errorMessage);
    document.body.appendChild(errorMessageContainer);
}