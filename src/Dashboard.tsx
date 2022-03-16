import React, { useEffect } from "react";
import "./Dashboard.css";
import { WebSocketHandler } from "./services/WebSocketHandler";
import DailyTemperature from "./types/DailyTemperature";
import "react-notifications-component/dist/theme.css";
import { ReactNotifications } from "react-notifications-component";
import { Store } from "react-notifications-component";
import { Line } from "react-chartjs-2";
import {
  prepareChartData,
  filterOlddata,
  processMessageResponse,
  displayNotification,
} from "./types/Common";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-moment";
import ChartDataHandler from "./types/ChartDataHandler";

function Dashboard() {
  const [webSocketHandler, setWebSocketHandler] =
    React.useState<WebSocketHandler>({} as WebSocketHandler);
  const [dataTimeout, setDataTimeout] = React.useState(5 * 60 * 1000);
  const [connectionTimeout, setConnectionTimeout] = React.useState(30 * 1000);
  const [temperatureData, setTemperatureData] = React.useState<
    DailyTemperature[]
  >([] as DailyTemperature[]);
  const [temperatureChartdata, setTemperatureChartData] =
    React.useState<ChartDataHandler>({} as ChartDataHandler);
  const [currentTemperatureData, setCurrentTemperatureData] = React.useState<
    DailyTemperature[]
  >([] as DailyTemperature[]);
  const [hasChartData, setHasChartData] = React.useState(false);
  const stateRef = React.useRef(temperatureData);
  stateRef.current = temperatureData;
  console.log(temperatureData.length);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  function reconnect() {
    if (
      !webSocketHandler ||
      webSocketHandler.getSocketState() == WebSocket.CLOSED
    )
      connectToSocketServer(process.env.REACT_APP_SOCKET_CONNECTION_URL!);
  }

  function updateChartDataFlag(chartOptionsData: ChartDataHandler) {
    if (
      chartOptionsData.chartDatasets &&
      chartOptionsData.chartDatasets.length > 0
    ) {
      setHasChartData(true);
    } else {
      setHasChartData(false);
    }
  }

  function handleMessageResponse(
    message: string,
    temperatureData: DailyTemperature[]
  ) {
    let processTemperatureData = processMessageResponse(message);
    let filteredTempertureData: DailyTemperature[] = filterOlddata(
      temperatureData,
      dataTimeout
    );
    filteredTempertureData = filteredTempertureData.concat(
      processTemperatureData
    );
    var chartOptionsData = prepareChartData(filteredTempertureData);
    setTemperatureData(filteredTempertureData);
    setTemperatureChartData(chartOptionsData);
    setCurrentTemperatureData(processTemperatureData);
    updateChartDataFlag(chartOptionsData);
  }

  function connectToSocketServer(url: string) {
    let currentWebSocketHandler = new WebSocketHandler(new WebSocket(url));
    setWebSocketHandler(currentWebSocketHandler);
    currentWebSocketHandler.onOpen((evt: Event) => {
      displayNotification(
        process.env.REACT_APP_SOCKET_CONNECTION_MESSAGE!,
        "Info",
        "success",
        Store
      );
    });

    currentWebSocketHandler.onError((evt: ErrorEvent) => {
      displayNotification(
        process.env.REACT_APP_SOCKET_CONNECTION_ERROR_MESSAGE!,
        "Error",
        "danger",
        Store
      );
      webSocketHandler.close();
    });

    currentWebSocketHandler.onMessage((evt: MessageEvent) => {
      let string = evt.data;
      handleMessageResponse(string, stateRef.current);
    });

    currentWebSocketHandler.onClose((evt: Event) => {
      displayNotification(
        process.env.REACT_APP_SOCKET_CONNECTION_CLOSE_MESSAGE!,
        "Info",
        "success",
        Store
      );
      setTimeout(() => {
        reconnect();
      }, connectionTimeout);
    });
  }

  function renderCurrentInfoBlock() {
    if (currentTemperatureData && currentTemperatureData.length > 0) {
      return (
        <div className="row">
          <div className="child-div">
            <label>
              <strong className="child-strong">
                ID {currentTemperatureData[0].id}{" "}
              </strong>
            </label>
            <label>
              <small>Temp: {currentTemperatureData[0].temperature}</small>
            </label>
          </div>
          <div className="child-div">
            <label>
              <strong className="child-strong">
                ID {currentTemperatureData[1].id}{" "}
              </strong>
            </label>
            <label>
              <small>Temp: {currentTemperatureData[1].temperature}</small>
            </label>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  }

  function renderChartBlock(chartOptionHandler: ChartDataHandler) {
    if (hasChartData) {
      return (
        <Line
          className="chart-scroll"
          data={{ datasets: chartOptionHandler.chartDatasets }}
          options={chartOptionHandler.options}
        ></Line>
      );
    } else {
      return <label> No chart data available currently</label>;
    }
  }

  useEffect(() => {
    connectToSocketServer(process.env.REACT_APP_SOCKET_CONNECTION_URL!);
    return () => {};
  }, []);

  return (
    <div className="Web Socket Connection">
      <ReactNotifications />
      {renderCurrentInfoBlock()}
      {renderChartBlock(temperatureChartdata)}
    </div>
  );
}

export default Dashboard;
