import './css/styles.css';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { Notify } from 'notiflix';

const submBtn = document.querySelector('.submit-button');
const userInput = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
const KEY = '33649719-b7fecbfe979c6e7e0b54f5aa7';
let currentPage = 1;
const contentPerPage = 40;
let totalFound;

const largePicture = new simpleLightbox('.photo-card a');

async function fetchPictures() {
  try {
    const response = await axios('https://pixabay.com/api/', {
      params: {
        key: KEY,
        q: userInput.value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: currentPage,
        per_page: contentPerPage,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
}

function renderPics(pictures) {
  const markup = pictures.hits
    .map(pic => {
      return `<div class="photo-card">
  <a href="${pic.largeImageURL}"><img src="${pic.webformatURL}" alt="${pic.tags}" loading="lazy" class="photo-card-img"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${pic.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${pic.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${pic.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${pic.downloads}
    </p>
  </div>
</div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  largePicture.refresh();
  loadBtn.style.display = 'flex';
}

async function getPictures() {
  const res = await fetchPictures();
  const totalContent = currentPage * contentPerPage;
  if (res.data.hits.length === 0) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else if (res.data.totalHits < totalContent) {
    renderPics(res.data);
    Notify.info("We're sorry, but you've reached the end of search results.");
    loadBtn.style.display = 'none';
    return;
  }
  totalFound = res.data.totalHits;
  renderPics(res.data);
}

submBtn.addEventListener('click', async e => {
  e.preventDefault();
  gallery.innerHTML = '';
  currentPage = 1;
  totalFound = 0;
  loadBtn.style.display = 'none';
  await getPictures();
  if (totalFound !== 0) {
    Notify.success(`Hooray! We found ${totalFound} images.`);
  }
});

loadBtn.addEventListener('click', () => {
  currentPage += 1;
  getPictures();
});
