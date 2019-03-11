import $ from 'jquery';
import axios from 'axios';
import 'dm-file-uploader/dist/js/jquery.dm-uploader.min';

// https://github.com/danielm/uploader

const showUploadError = (self, msg) => {
  self.addClass('error');
  // show error message
  console.log(msg);
  setTimeout(() => self.removeClass('error'), 500);
};

const makeLoadingElement = (id) => {
  const elem = document.createElement('div');
  elem.id = id;
  elem.setAttribute('class', 'pl-4 pb-2');

  const icon = document.createElement('span');
  icon.setAttribute('class', 'text-muted pr-2');
  icon.innerHTML = '<i class="fas fa-file-download"></i>';

  const text = document.createElement('span');
  text.innerText = 'Загружается..'; // filename

  const progress = document.createElement('div');
  progress.setAttribute('class', 'progress');
  progress.setAttribute('style', 'height: 1px');
  progress.innerHTML = '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>';

  elem.append(icon);
  elem.append(text);
  elem.append(progress);
  return elem;
};

const makeFileElement = (data) => {
  const elem = document.createElement('div');
  elem.id = `attachment_${data.id}`;
  elem.setAttribute('class', 'pl-4 pb-2 d-flex justify-content-between border-bottom');
  elem.style.display = 'none'; // for fadeIn

  const span = document.createElement('span');
  span.setAttribute('class', 'pt-1');

  const icon = document.createElement('big');
  icon.setAttribute('class', 'text-muted pr-2');
  icon.innerHTML = `<i class="far fa-file-${data.type}"></i>`;

  const link = document.createElement('a');
  link.setAttribute('href', data.fileUrl);
  link.innerText = data.originalName;

  const size = document.createElement('small');
  size.setAttribute('class', 'text-muted pl-3');
  size.innerText = data.size;

  span.append(icon);
  span.append(link);
  span.append(size);

  const btn = document.createElement('span');
  btn.setAttribute('class', 'text-success pt-1 pr-2');
  btn.innerHTML = '<i class="fas fa-check"></i>';

  elem.append(span);
  elem.append(btn);
  return elem;
};

$(() => {
  $('#drop-area').dmUploader({
    url: '/attachments',
    dataType: 'json',
    /* extraData() {
      console.log('extraData', this.data('attachTo'));
      return { attachTo: this.data('attachTo') };
    }, */
    maxFileSize: 10000000, // 10 MB
    // allowedTypes: 'image/*',
    extFilter: ['jpg', 'png', 'gif', 'pdf', 'txt'],

    onDragEnter() {
      this.addClass('active');
    },
    onDragLeave() {
      this.removeClass('active');
    },

    onBeforeUpload(id) {
      const target = this.data('target');
      const elem = makeLoadingElement(id);
      document.getElementById(target).append(elem);
    },

    onUploadProgress(id, percent) {
      const progress = document.getElementById(id).getElementsByClassName('progress-bar')[0];
      progress.style.width = `${percent}%`;
    },

    onUploadSuccess(id, data) {
      console.log('upload success: ', data);
      if (data.error) {
        console.log('upload error: ', data.error);
        // show error message
        // setTimeout document.getElementById(id).remove();
        return;
      }
      axios.post(this.data('attachTo'), {
        AttachmentId: data.id,
      })
        .then((response) => {
          console.log('response2', response.data);
        });
      const elem = makeFileElement(data);
      document.getElementById(id).replaceWith(elem);
      $(elem).fadeIn();
    },

    onUploadError(id, xhr, status, errorThrown) {
      console.log('upload error: ', errorThrown);
    },

    onFileSizeError() {
      showUploadError(this, 'Размер файла превышает допустимый размер');
    },
    onFileTypeError() {
      showUploadError(this, 'Неверный тип файла');
    },
    onFileExtError() {
      showUploadError(this, 'Файл с таким расширением нельзя загрузить');
    },
  });
});
