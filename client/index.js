import './css/main.scss';
import 'bootstrap';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

import $ from 'jquery';
import 'jquery-ujs';

import 'bootstrap-multiselect';

import attachEventHandlers from './eventhandler';

// console.log('init');

$('[data-toggle="tooltip"]').tooltip();

$('.toast').toast('show');

// $('.animation-slide-down').slideDown();
$('.animation-slide-down').collapse('show');

$('select[multiple="multiple"]').multiselect({
  buttonClass: 'form-control',
  buttonWidth: '100%',
  nonSelectedText: 'Выберите ',
  selectedClass: 'multiselect-selected',
});

attachEventHandlers(document);
