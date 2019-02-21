import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/menu.css';
import 'jquery-ui/themes/base/autocomplete.css';
// import 'jquery-ui/themes/base/theme.css'; // ошибка при подключении, потом разобраться

import $ from 'jquery';
import autocomplete from 'jquery-ui/ui/widgets/autocomplete'; // eslint-disable-line

const setSelected = (input, id) => {
  const propertyId = input.attr('data-target');
  $(`input[name="${propertyId}"`).val(id);
  if (id === '') {
    input.removeClass('is-valid');
  } else {
    input.addClass('is-valid');
  }
};

$(() => {
  $('input.autocomplete').autocomplete({
    source(request, response) {
      // const dataUrl = $(this).attr('data-source');
      const dataUrl = this.element[0].getAttribute('data-source');
      $.ajax({
        url: dataUrl,
        dataType: 'json',
        data: {
          name: request.term,
        },
        success(data) {
          const name = Object.keys(data)[0];
          const result = $.map(data[name], item => ({ code: item.id, label: item.name }));
          response(result);
        },
      });
    },
    minLength: 1, // вынести в data-min-length

    create() {
      const propertyId = $(this).attr('data-target');
      if ($(`input[name="${propertyId}"`).val()) {
        $(this).addClass('is-valid');
      }
    },

    select(event, ui) {
      setSelected($(this), ui.item.code);
    },

    search() {
      setSelected($(this), '');
    },

    change(event, ui) {
      console.log('change', ui);
      if (ui.item === null) { // не выбрано
        setSelected($(this), '');
        // $(this).addClass('is-invalid');
      }
    },

  });
});
