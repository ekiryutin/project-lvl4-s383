import '../scss/main.scss';
import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

import $ from 'jquery';
import 'jquery-ujs';

// import './mystyle.css';
import './autocomplete';
import './datepicker';

$(() => {
  console.log('init');
  // enable toolips
  $('[data-toggle="tooltip"]').tooltip();

  $('.toast').toast('show');
});
