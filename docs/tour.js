'use strict';

const room = document.querySelector('#room');
const notice = document.querySelector('#notice');
const meter = document.querySelector('#meter');
const seals = new Set();
let telescope = 0;
const sights = ['rooftops', 'cloud bank', 'blue moon'];

function enter(name) {
  const template = document.getElementById(name);
  room.replaceChildren(template.content.cloneNode(true));
  room.hidden = false;
  for (const button of document.querySelectorAll('nav [data-room]')) {
    button.setAttribute('aria-current', String(button.dataset.room === name));
  }
  if (name === 'tower') {
    room.querySelector('#sight').textContent = 'Sightline · ' + sights[telescope];
  }
  if (name === 'mine' && seals.has('mine')) {
    room.querySelector('#mine-chart').hidden = false;
  }
  room.querySelector('h2').focus({preventScroll:true});
  room.scrollIntoView({block:'nearest'});
}

function collect(seal, message) {
  const alreadyFound = seals.has(seal);
  seals.add(seal);
  meter.textContent = seals.size + ' / 3 seals';
  notice.textContent = alreadyFound ? 'You already have this seal.' : message;
  if (!alreadyFound && seals.size === 3) {
    notice.textContent += ' The foyer vault is ready to open.';
  }
}

const actions = {
  garage() {
    collect('garage', 'You found the brass seal in the drawer.');
  },
  tower() {
    telescope = (telescope + 1) % sights.length;
    room.querySelector('#sight').textContent = 'Sightline · ' + sights[telescope];
    if (telescope === 2) collect('tower', 'The blue moon revealed the silver seal.');
    else notice.textContent = 'Keep turning. The moon is close.';
  },
  mine() {
    room.querySelector('#mine-chart').hidden = false;
    collect('mine', 'The lantern revealed the amber seal.');
  },
  wrong() {
    notice.textContent = 'The headstone stays quiet. Try another answer.';
  },
  stash() {
    notice.textContent = 'Correct. Even ghosts use git stash.';
  },
  vault() {
    if (seals.size < 3) {
      notice.textContent = 'The vault is locked. Collect the three seals first.';
      return;
    }
    enter('opened');
    notice.textContent = 'You opened the vault.';
  },
  reset() {
    seals.clear();
    telescope = 0;
    meter.textContent = '0 / 3 seals';
    notice.textContent = 'Explore the rooms. Find three seals to open the vault.';
    enter('foyer');
  }
};

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.room) {
    enter(button.dataset.room);
  } else if (button.dataset.action) {
    actions[button.dataset.action]();
    notice.scrollIntoView({block:'nearest'});
  }
});
