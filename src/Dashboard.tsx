import { useEffect, useState, useRef } from "react";
import "./Dashboard.css";
import { WebSocketHandler } from "./services/WebSocketHandler";
import DailyTemperature from "./types/DailyTemperature";
import InfoBlockProps from "./types/InfoBlockProps";
import "react-notifications-component/dist/theme.css";
import { ReactNotifications } from "react-notifications-component";
import { Store } from "react-notifications-component";
import { Line } from "react-chartjs-2";
import {
  prepareChartData,
  filterOlddata,
  processMessageResponse,
  displayNotification,
  SOCKET_CONNECTION_MESSAGE,
  SOCKET_CONNECTION_ERROR_MESSAGE,
  SOCKET_CONNECTION_CLOSE_MESSAGE,
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

function InfoBlock(props: InfoBlockProps) {
  return (
    <div className="child-div">
      <label>
        <strong className="child-label"> ID {props.infoData.id} </strong>
      </label>
      <label>
        <small className="child-label">
          Temp: {props.infoData.temperature} C
        </small>
      </label>
    </div>
  );
}

function Dashboard() {
  const [webSocketHandler, setWebSocketHandler] = useState<WebSocketHandler>(
    {} as WebSocketHandler
  );
  const dataTimeout = 5 * 60 * 1000;
  const connectionTimeout = 30 * 1000;
  const [temperatureData, setTemperatureData] = useState<DailyTemperature[]>(
    [] as DailyTemperature[]
  );
  const [temperatureChartdata, setTemperatureChartData] =
    useState<ChartDataHandler>({} as ChartDataHandler);
  const [currentTemperatureData, setCurrentTemperatureData] = useState<
    DailyTemperature[]
  >([] as DailyTemperature[]);
  const [hasChartData, setHasChartData] = useState(false);
  const stateRef = useRef(temperatureData);
  stateRef.current = temperatureData;
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
      displayNotification(SOCKET_CONNECTION_MESSAGE!, "Info", "success", Store);
    });

    currentWebSocketHandler.onError((evt: ErrorEvent) => {
      displayNotification(
        SOCKET_CONNECTION_ERROR_MESSAGE!,
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
        SOCKET_CONNECTION_CLOSE_MESSAGE,
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
          <InfoBlock infoData={currentTemperatureData[0]}></InfoBlock>
          <InfoBlock infoData={currentTemperatureData[1]}></InfoBlock>
        </div>
      );
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
