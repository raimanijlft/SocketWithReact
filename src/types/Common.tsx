import ChartDataHandler from "./ChartDataHandler";
import DailyTemperature from "./DailyTemperature";
import Dataset from "./TemperatureDataSet";

export const SOCKET_CONNECTION_MESSAGE = "Web socket connected.";
export const SOCKET_CONNECTION_ERROR_MESSAGE = "Web socket disconnected.";
export const SOCKET_CONNECTION_CLOSE_MESSAGE =
  "Error during web socket connection.";

export function prepareChartData(
  temperatureDataArray: DailyTemperature[]
): ChartDataHandler {
  let dataMap = new Map();
  let dataset: Dataset[] = [];

  for (var i = 0; i < temperatureDataArray.length; i++) {
    let currentTemperatureObj = temperatureDataArray[i];
    if (dataMap.has(currentTemperatureObj.id)) {
      let datasetObj: Dataset = dataMap.get(currentTemperatureObj.id);
      if (currentTemperatureObj.data <= 100) {
        datasetObj.addData({
          x: new Date(currentTemperatureObj.timestamp).toLocaleTimeString(),
          y: currentTemperatureObj.data,
        });
      }
    } else {
      if (currentTemperatureObj.data <= 100) {
        let color = "red";
        if (currentTemperatureObj.id == 2) {
          color = "orange";
        }
        let datasetObj: Dataset = new Dataset(
          currentTemperatureObj.id.toString(),
          currentTemperatureObj.id.toString(),
          [
            {
              x: new Date(currentTemperatureObj.timestamp).toLocaleTimeString(),
              y: currentTemperatureObj.data,
            },
          ]
        );
        datasetObj.setColor(color);
        dataMap.set(currentTemperatureObj.id, datasetObj);
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
