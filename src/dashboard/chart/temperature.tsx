export const temperatureChart = () => ({
  chart: {
    type: 'line',
  },
  title: {
    text: 'Temperatura (°C x t)'
  },
  xAxis:{
    // type:'datetime',
    title: {
      text: 'Variação do tempo (s)'
    }
  },
  time: {
    useUTC: false,
  },
  yAxis: {
    title: {
      text: 'Temperatura °C'
    }
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
  series: []
});
