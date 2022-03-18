import ChartDataHandler from "./ChartDataHandler";
import DailyTemperature from "./DailyTemperature";
import Dataset from "./Dataset";

export function prepareChartData(
  temperatureDataArray: DailyTemperature[]
): ChartDataHandler {
  let dataMap = new Map();
  let dataset: Dataset[] = [];

  for (var i = 0; i < temperatureDataArray.length; i++) {
    if (dataMap.has(temperatureDataArray[i].id)) {
      let datasetObj: Dataset = dataMap.get(temperatureDataArray[i].id);
      if (temperatureDataArray[i].data <= 100) {
        datasetObj.addData({
          x: new Date(temperatureDataArray[i].timestamp).toLocaleTimeString(),
          y: temperatureDataArray[i].data,
        });
      }
    } else {
      if (temperatureDataArray[i].data <= 100) {
        let color = "red";
        if (temperatureDataArray[i].id == 2) {
          color = "orange";
        }
        let datasetObj: Dataset = new Dataset(
          temperatureDataArray[i].id.toString(),
          temperatureDataArray[i].id.toString(),
          [
            {
              x: new Date(
                temperatureDataArray[i].timestamp
              ).toLocaleTimeString(),
              y: temperatureDataArray[i].data,
            },
          ],
          color
        );
        dataMap.set(temperatureDataArray[i].id, datasetObj);
      }
    }
  }

  dataMap.forEach((data) => {
    dataset.push(data);
  });

  let chartOptions = {
    scales: {
      x: {
        display: false,
        title: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Data",
        },
      },
    },
  };

  return new ChartDataHandler(
    dataset.sort((a: Dataset, b: Dataset) => (a.id > b.id ? 1 : -1)),
    chartOptions
  );
}

export function filterOlddata(
  dataList: DailyTemperature[],
  dataTimeout: number
) {
  var currentTemperatureData = dataList;
  var tempTemperatureData: DailyTemperature[] = [];
  if (currentTemperatureData) {
    var currentTimeStamp = new Date().getTime();
    for (var i = 0; i < currentTemperatureData.length; i++) {
      var currentTemoeratureObj: DailyTemperature = currentTemperatureData[i];
      if (currentTimeStamp - currentTemoeratureObj.timestamp < dataTimeout) {
        tempTemperatureData.push(currentTemoeratureObj);
      }
    }
  }
  return tempTemperatureData;
}

export function processMessageResponse(
  messageDataArray: string
): DailyTemperature[] {
  try {
    let parsedDataArray: DailyTemperature[] = JSON.parse(messageDataArray);
    return parsedDataArray;
  } catch (e) {
    return [];
  }
}

export function displayNotification(
  message: string,
  title: string,
  type: string,
  store: any
) {
  store.addNotification({
    title: title,
    message: message,
    type: type,
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated", "animate__fadeIn"],
    animationOut: ["animate__animated", "animate__fadeOut"],
    dismiss: {
      duration: 5000,
      onScreen: true,
    },
  });
}
