// import $ from 'jquery';
import attachAutocomplete from './autocomplete';
import attachDatepicker from './datepicker';
import attachFileUploader from './fileuploader';
import attachLoader from './loader';
import attachCharts from './charts';

const attachDeleteButton = (element) => {
  element.querySelectorAll('button.btn-delete')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('confirmDeleteButton').href = btn.dataset.deleteUrl; // getAttribute('data-delete-name')
        document.getElementById('confirmDeleteMsg').innerText = `Вы уверены, что хотите удалить ${btn.dataset.deleteName}?`;
      });
    });
};

export default (element) => { // attachEventHandlers
  attachDeleteButton(element);
  attachLoader(element);
  attachAutocomplete(element);
  attachDatepicker(element);
  attachFileUploader(element);
  attachCharts(element);
};
