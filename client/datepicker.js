import $ from 'jquery';
import 'jquery-ui/ui/widgets/datepicker';
import 'jquery-ui/ui/i18n/datepicker-ru';

$(() => {
  $.datepicker.setDefaults($.datepicker.regional.ru);

  $('input.datepicker').datepicker({
    dateFormat: 'dd.mm.yy',
    showOtherMonths: true,
    selectOtherMonths: true,
    minDate: 0, // добавить, если data-min-date = 'current'

    click() {
      $(this).datepicker('show');
    },
    // стрелки вверх вниз для смены даты, месяца и года
  });
});
