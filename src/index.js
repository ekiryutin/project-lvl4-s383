import '../scss/main.scss';
import 'bootstrap';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

import $ from 'jquery';
import 'jquery-ujs';

import './autocomplete';
import './datepicker';

// console.log('init');

$('[data-toggle="tooltip"]').tooltip();

$('.toast').toast('show');
