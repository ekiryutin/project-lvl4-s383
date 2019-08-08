import axios from 'axios';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/datepicker';
import 'jquery-ui/ui/i18n/datepicker-ru';

$.datepicker.setDefaults($.datepicker.regional.ru);

export default (element) => {
  // календарь для выбора даты в поле
  $('input.datepicker', element).datepicker({
    dateFormat: 'dd.mm.yy',
    showOtherMonths: true,
    selectOtherMonths: true,
    minDate: 0, // добавить, если data-min-date = 'current'

    click() {
      $(this).datepicker('show');
    },
    // стрелки вверх вниз для смены даты, месяца и года
  });

  element.querySelectorAll('.Calendar')
    .forEach((elem) => {
      console.log(`Calendar request '${elem.dataset.source}'`);
      axios({
        method: elem.dataset.method || 'get',
        url: elem.dataset.source,
        // data: requestData,
      })
        .then((response) => {
          console.log('Calendar response');
          const { data } = response;
          $(elem).datepicker({
            dateFormat: 'dd.mm.yy',
            showOtherMonths: true,
            selectOtherMonths: true,

            beforeShowDay(date) {
              // при сравнении date напрямую - разные GMT на клиенте и сервере
              const info = data[date.toDateString()];
              return info ? [true, info, 'Что-то есть'] : [true, '', ''];
            },
            onSelect(sDate) { // dd.mm.yyyy
              console.log(`Calendar select ${sDate}`);
            },
          });
        })
        .catch(e => console.log(`Calendar request error: ${e}`));
    });
};
