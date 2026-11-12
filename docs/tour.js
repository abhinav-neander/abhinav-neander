'use strict';

const entrance = document.querySelector('#entrance');
const gallery = document.querySelector('#gallery');
const door = document.querySelector('#door');
const stage = document.querySelector('.stage');
const room = document.querySelector('.room');
const walls = document.querySelector('#walls');
const compass = document.querySelector('#compass');
const filters = document.querySelectorAll('[data-filter]');
const wallNames = ['The workshop', 'The tower', 'The crypt', 'The archives'];
let yaw = 0;
let touchStart;

function exhibit(item) {
  const entry = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'exhibit ' + item.category;
  link.href = item.url;
  for (const [tag, value, className] of [
    ['span', item.label + ' ↗', 'kind'],
    ['strong', item.title, ''],
    ['small', item.detail.length > 115 ? item.detail.slice(0, 112) + '…' : item.detail, '']
  ]) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    link.append(element);
  }
  entry.append(link);
  return entry;
}

function turnTo(angle) {
  yaw = angle;
  room.style.setProperty('--yaw', yaw + 'deg');
  const side = ((Math.round(yaw / 90) % 4) + 4) % 4;
  compass.textContent = wallNames[side];
}

function wallFor(items, index) {
  const wall = document.createElement('section');
  wall.className = 'wall';
  wall.style.setProperty('--wall-angle', -90 * index + 'deg');
  wall.innerHTML = '<span class="sconce left" aria-hidden="true"></span><span class="sconce right" aria-hidden="true"></span><span class="pumpkin left" aria-hidden="true">🎃</span><span class="pumpkin right" aria-hidden="true">🎃</span>';
  const content = document.createElement('div');
  content.className = 'wall-content';
  const title = document.createElement('h2');
  title.textContent = wallNames[index];
  content.append(title);
  if (items.length) {
    const list = document.createElement('ul');
    list.className = 'exhibits';
    list.append(...items.map(exhibit));
    content.append(list);
  }
  content.addEventListener('focusin', event => {
    if (!event.target.matches(':focus-visible')) return;
    const target = index * 90;
    const delta = ((target - yaw) % 360 + 540) % 360 - 180;
    turnTo(yaw + delta);
  });
  wall.append(content);
  return wall;
}

function render(filter) {
  const visible = galleryItems.filter(item => filter === 'all' || item.category === filter);
  const wallCount = Math.ceil(visible.length / 4);
  walls.replaceChildren(...wallNames.map((_, index) => wallFor(visible.slice(index * 4, index * 4 + 4), index)));
  document.querySelector('#results').textContent = visible.length + ' exhibits across ' + wallCount + ' walls.';
  for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
  turnTo(Math.round(yaw / 360) * 360);
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

stage.addEventListener('wheel', event => {
  if (event.ctrlKey || event.metaKey) return;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (!delta) return;
  event.preventDefault();
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
  turnTo(yaw + Math.max(-80, Math.min(80, delta * unit * .24)));
}, {passive:false});

stage.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  turnTo(yaw + (event.key === 'ArrowLeft' ? -30 : 30));
});

stage.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? event.touches[0].clientX : undefined;
}, {passive:true});
stage.addEventListener('touchend', event => {
  if (touchStart === undefined) return;
  const distance = touchStart - event.changedTouches[0].clientX;
  touchStart = undefined;
  if (Math.abs(distance) >= 25) turnTo(yaw + Math.sign(distance) * 90);
}, {passive:true});
stage.addEventListener('touchcancel', () => { touchStart = undefined; });

for (const button of filters) button.addEventListener('click', () => render(button.dataset.filter));
for (const button of document.querySelectorAll('[data-turn]')) {
  button.addEventListener('click', () => {
    const delta = Number(button.dataset.turn);
    turnTo(delta ? Math.round(yaw / 90) * 90 + delta : Math.round(yaw / 360) * 360);
  });
}
render('all');

if (new URLSearchParams(location.search).get('enter') === '1') {
  const art = entrance.querySelector('img');
  const start = () => setTimeout(openDoor, 500);
  if (art.complete) start();
  else {
    art.addEventListener('load', start, {once:true});
    art.addEventListener('error', start, {once:true});
  }
}
