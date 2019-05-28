import './css/main.scss';
import 'bootstrap';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

import $ from 'jquery';
import 'jquery-ujs';

import './autocomplete';
import './datepicker';
import './fileuploader';
import './loader';

// console.log('init');

$('[data-toggle="tooltip"]').tooltip();

$('.toast').toast('show');


// attachDeleteButton
document.querySelectorAll('button.btn-delete')
  .forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('confirmDeleteButton').href = btn.dataset.deleteUrl; // getAttribute('data-delete-name')
      document.getElementById('confirmDeleteMsg').innerText = `Вы уверены, что хотите удалить ${btn.dataset.deleteName}?`;
    });
  });
