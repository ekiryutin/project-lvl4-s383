import axios from 'axios';
import attachEventHandlers from './eventhandler';

const getParentElement = (elem, tag) => {
  const parent = elem.parentElement;
  if (parent === null) {
    return null;
  }
  return parent.tagName === tag ? parent : getParentElement(parent, tag);
};

const getFormParams = (elem) => {
  const form = getParentElement(elem, 'FORM');
  if (form === null) {
    return null;
  }
  const data = {};
  [...form.elements]
    .filter(item => item.name !== '' && item.name.startsWith('_') === false)
    .forEach((item) => { data[item.name] = item.value; });
  return data;
};

// Обработчик выполняет запрос и загружает полученный блок html в указанный элемент
// data-source - url
// data-target - element
// data-method - get / post / patch
// ~ data-data - form
// ~ data-action - replace (default) / append

export default (element) => { // attachLoader
  element.querySelectorAll('button.btn-load')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const requestData = btn.dataset.method === 'get' ? null : getFormParams(btn);

        axios({
          method: btn.dataset.method || 'get',
          url: btn.dataset.source,
          data: requestData,
        })
          .then((response) => {
            const replaceContent = (data) => {
              const target = document.getElementById(btn.dataset.target);
              const elem = document.createElement('div');
              elem.innerHTML = data;
              target.replaceWith(elem.firstElementChild);
              // target.append(elem.firstElementChild);

              attachEventHandlers(document.getElementById(btn.dataset.target));
            };

            // axios не поддерживает http redirect, поэтому используется json { redirect }
            if (response.data.redirect) {
              axios.get(response.data.redirect)
                .then((response2) => {
                  replaceContent(response2.data);
                })
                .catch((error) => {
                  console.log('axios redirect: ', error);
                });
            } else {
              replaceContent(response.data);
            }
          });
      });
    });
};
