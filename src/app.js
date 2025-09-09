import Chart from 'chart.js/auto'

var statusText = document.querySelector('#statusText');
var numBuzzerVolume = document.querySelector('#numBuzzerVolume');
var btBuzzerVolume = document.querySelector('#btBuzzerVolume');

(async function() {
  let now = new Date();
  var data = [{time: now, offset: 0, level: 0}];
  window.timeOrigin = now;
  window.chartCO2 = new Chart(
    document.getElementById('co2chart'),
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.offset),
        datasets: [
          {
            label: 'CO2 level by time',
            data: data.map(row => row.level)
          }
        ]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true, // Set to true to display the label
              text: 'sec' // The text content of the X-axis label
            }
          },
          y: {
            title: {
              display: true,
              text: 'ppm' // The text content of the Y-axis label
            }
          }
        }
      }
    }
  );
  window.chartTVOC = new Chart(
    document.getElementById('tvocchart'),
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.offset),
        datasets: [
          {
            label: 'TVOC level by time',
            data: data.map(row => row.level)
          }
        ]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true, // Set to true to display the label
              text: 'sec' // The text content of the X-axis label
            }
          },
          y: {
            title: {
              display: true,
              text: 'µg/m³' // The text content of the Y-axis label
            }
          }
        }
      }
    }
  );
})();

async function updateChart(chart, value) {
  let now = new Date();
  let offset = 0;
  offset = Math.floor((now.getTime() - timeOrigin.getTime()) / 1000);
  chart.data.labels.push(offset);
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
  }
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(value);
    if (dataset.data.length > 10) {
      dataset.data.shift();
    }
  });
  await chart.update();
}

statusText.addEventListener('click', async ()  => {
  try {
    statusText.textContent = 'Connecting...';
    console.log('connecting...');
    await airQualityMonitoring.connect()
    statusText.textContent = 'Connected';
    let handleCharCO2Level = await airQualityMonitoring.startNotificationsCO2Level();
    handleCharCO2Level.addEventListener('characteristicvaluechanged', async (event) => {
      let value = event.target.value;
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let levelCO2 =  value.getUint16(0, true);
      await updateChart(chartCO2, levelCO2);
      console.log('CO2 level: ' + levelCO2);
    });
    let handleCharTVOC = await airQualityMonitoring.startNotificationsTVOC();
    handleCharTVOC.addEventListener('characteristicvaluechanged', async (event) => {
      let value = event.target.value;
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let valueTVOC =  value.getUint16(0, true);
      await updateChart(chartTVOC, valueTVOC);
      console.log('TVOC: ' + valueTVOC);
    });

    let handleCharAQI = await airQualityMonitoring.startNotificationsAQI();
    handleCharAQI.addEventListener('characteristicvaluechanged', async (event) => {
      let value = event.target.value;
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let aqi = value.getUint8(0);
      console.log('AQI: ' + aqi);
    });

    numBuzzerVolume.disabled = false;
    btBuzzerVolume.disabled = false;
    numBuzzerVolume.value = await airQualityMonitoring.readBuzzerVolume();
    btBuzzerVolume.addEventListener('click', async ()  => {
      let value = new Uint8Array([numBuzzerVolume.value]);
      await airQualityMonitoring.writeBuzzerVolume(value.buffer);
      numBuzzerVolume.value = await airQualityMonitoring.readBuzzerVolume();
    });

  } catch(error) {
    console.error(error);
    statusText.textContent = error;
  }
});

// function loop()
// {
//   requestAnimationFrame(loop);
// }
// loop();