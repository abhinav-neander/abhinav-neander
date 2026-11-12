'use strict';

const entrance = document.querySelector('#entrance');
const gallery = document.querySelector('#gallery');
const door = document.querySelector('#door');
const room = document.querySelector('.room');
const exhibits = document.querySelector('#exhibits');
const filters = document.querySelectorAll('[data-filter]');

function render(filter) {
  const visible = galleryItems.filter(item => filter === 'all' || item.category === filter);
  exhibits.replaceChildren(...visible.map(item => {
    const entry = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'exhibit ' + item.category;
    link.href = item.url;
    for (const [tag, value, className] of [
      ['span', item.label + ' ↗', 'kind'],
      ['strong', item.title, ''],
      ['small', item.detail, '']
    ]) {
      const element = document.createElement(tag);
      element.className = className;
      element.textContent = value;
      link.append(element);
    }
    entry.append(link);
    return entry;
  }));
  document.querySelector('#results').textContent = visible.length + ' exhibits';
  for (const button of filters) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
  }
}

function showGallery() {
  entrance.hidden = true;
  gallery.hidden = false;
  document.querySelector('#gallery-title').focus();
}

function openDoor() {
  if (door.disabled) return;
  door.disabled = true;
  entrance.classList.add('entering');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) showGallery();
  else setTimeout(showGallery, 1650);
}

door.addEventListener('click', openDoor);

document.querySelector('#back').addEventListener('click', () => {
  gallery.hidden = true;
  entrance.classList.remove('entering');
  entrance.hidden = false;
  door.disabled = false;
  door.focus();
});

for (const button of filters) {
  button.addEventListener('click', () => render(button.dataset.filter));
}
for (const button of document.querySelectorAll('[data-angle]')) {
  button.addEventListener('click', () => room.style.setProperty('--angle', button.dataset.angle + 'deg'));
}

render('all');

if (new URLSearchParams(location.search).get('enter') === '1') {
  const art = entrance.querySelector('img');
  const start = () => setTimeout(openDoor, 500);
  if (art.complete) start();
  else {
    art.addEventListener('load', start, { once: true });
    art.addEventListener('error', start, { once: true });
  }
}
