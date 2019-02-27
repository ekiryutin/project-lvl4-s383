import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/menu.css';
import 'jquery-ui/themes/base/datepicker.css';
// import 'jquery-ui/themes/base/theme.css'; // ошибка при подключении, потом разобраться

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
