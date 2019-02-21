import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

import $ from 'jquery';

import './mystyle.css';
import './autocomplete';

$(() => {
  console.log('init');
  // enable toolips
  $('[data-toggle="tooltip"]').tooltip();
});
