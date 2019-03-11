import $ from 'jquery';
import axios from 'axios';
import 'jquery-ui/ui/widgets/autocomplete';

const setSelected = (input, id) => {
  const propertyId = input.data('target');
  $(`input[name="${propertyId}"`).val(id);
  if (id === '') {
    input.removeClass('is-valid');
  } else {
    input.addClass('is-valid').removeClass('is-invalid');
  }
};

$(() => {
  $('input.autocomplete').autocomplete({
    source(request, response) {
      // const dataUrl = $(this).attr('data-source');
      const dataUrl = this.element[0].getAttribute('data-source');
      axios.get(dataUrl, {
        params: { name: request.term },
      })
        .then(({ data }) => {
          const name = Object.keys(data)[0];
          const result = data[name].length > 0
            ? data[name].map(item => ({ code: item.id, label: item.name }))
            : [{ code: '', label: 'Ничего не найдено' }];
          response(result);
        })
        .catch(err => console.log(err)); // show error under field
    },
    minLength: 1, // вынести в data-min-length

    create() {
      const propertyId = $(this).data('target');
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
      if (ui.item === null) { // не выбрано
        setSelected($(this), '');
        // $(this).addClass('is-invalid');
      }
    },
  });
  // fix dropdown width
  $.ui.autocomplete.prototype._resizeMenu = function () { // eslint-disable-line
    this.menu.element.outerWidth(this.element.outerWidth());
  };
});
