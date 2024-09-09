import Highcharts from "highcharts";

export const regressionChart = () => ({
  title: {
    text: "Regressão Linear (°C x s)",
  },
  legend: {
    //acrescente a linha abaixo
    labelFormat: '{name}', 
    //acrescente a linha acima
    layout: 'vertical',
    backgroundColor: '#FFFFFF',
    align: 'left',
    verticalAlign: 'top',
    x: 50,
    y: 35,
    floating: true,
    shadow: true
},

  plotOptions: {
    scatter: {
      tooltip: {
        pointFormat: "{yAxis} cm, Temp: {point.y} °C ",
      },
    },
  },
  tooltip: {
    headerFormat: "Temp: <b>{point.y}</b> °C ",
    pointFormatter: function (): string {
      return `| Segundos: <b>${this.x}</b>`;
    },
  },
  yAxis: {
    title: {
      text: "Temperature °C",
    },
  },
  xAxis: {
    title: {
      text: "Time(s)",
    },
  },

  exporting: {
    buttons: {
      contextButton: {
        menuItems: [
          "viewFullscreen",
          "printChart",
          "separator",
          "downloadCSV",
          "downloadXLS",
        ],
      },
    },
  },

  series: [
  
  ],
});
