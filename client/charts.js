import Highcharts from 'highcharts';

export default (element) => {
  element.querySelectorAll('.diagram')
    .forEach((container) => {
      const chartInfo = JSON.parse(document.getElementById(container.dataset.target).innerText);
      Highcharts.chart(container, chartInfo);
    });
};
