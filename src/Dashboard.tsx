import React,{useEffect} from 'react';
import './Dashboard.css';
import { WebSocketHandler } from './services/WebSocketHandler';
import { DashboardProps } from './types/DashboardProps';
import DailyTemperature from './types/DailyTemperature';
import { Line } from 'react-chartjs-2';
import MapData from './types/MapData';
import Dataset from './types/Dataset';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-moment'
import ChartDataHandler from './types/ChartDataHandler';



function Dashboard(props:DashboardProps){
  
  const [webSocketHandler, setWebSocketHandler] = React.useState<WebSocketHandler>({} as WebSocketHandler);
  const [dataTimeout,setDataTimeout] = React.useState(5 * 60 * 1000);
  const [connectionTimeout,setConnectionTimeout] = React.useState(30 * 1000); 
  const [temperatureData,setTemperatureData] = React.useState<DailyTemperature[]>([] as DailyTemperature[]);
  const [temperatureChartdata,setTemperatureChartData] = React.useState<ChartDataHandler>({} as ChartDataHandler);
  const [currentTemperatureData,setCurrentTemperatureData] = React.useState<DailyTemperature[]>([] as DailyTemperature[]);
  const [hasChartData,setHasChartData] = React.useState(false);
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
  
  function reconnect(){
    if (!webSocketHandler || webSocketHandler.getSocketState() == WebSocket.CLOSED) connectToSocketServer(process.env.REACT_APP_SOCKET_CONNECTION_URL!); 
  };

  function prepareChartData(temperatureDataArray:DailyTemperature[]):ChartDataHandler{
    let dataMap = new Map();
    let dataset:Dataset[] = [];
    let  mapObject:MapData[] = [];
    for(var i = 0;i<temperatureDataArray.length;i++){
      if(dataMap.has(temperatureDataArray[i].id)){
        let mappetObj:MapData = dataMap.get(temperatureDataArray[i].id);
        if(temperatureDataArray[i].data<=100){
          
          mappetObj.addData({"x":new Date(temperatureDataArray[i].timestamp).toISOString(),"y":temperatureDataArray[i].temperature}); 
        }
      }else{
        if(temperatureDataArray[i].data<=100){
          let newMapObj:MapData = new MapData(temperatureDataArray[i].id,[{"x":new Date(temperatureDataArray[i].timestamp).toISOString(),"y":temperatureDataArray[i].temperature}]);
          dataMap.set(temperatureDataArray[i].id,newMapObj);
        }
        
      }
    }
    dataMap.forEach((data,key) =>{
        var tempDatasetObj = new Dataset(
          key,
          key,
          data.data.sort((a:any, b:any) => a.x > b.x ? 1 : -1));
        dataset.push(tempDatasetObj);
    });
    let chartOptions= {
      scales: {
        x: {
          display: true,
          type: 'time',
          title: {
            display: true,
            text: 'Temp'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Temp'
          }
         
        }
      }
    }
    return new ChartDataHandler(
      dataset,
      chartOptions,
    )
  }

  function filterOlddata(dataList:DailyTemperature[]){
    var currentTemperatureData = dataList;
    var tempTemperatureData:DailyTemperature[] = [];
    if(currentTemperatureData){
      var currentTimeStamp = new Date().getTime();
      for(var i=0;i<currentTemperatureData.length;i++){
        var currentTemoeratureObj:DailyTemperature = currentTemperatureData[i];
        if((currentTimeStamp - currentTemoeratureObj.timestamp) < dataTimeout){
          tempTemperatureData.push(currentTemoeratureObj);
        }
      }
    }
    return tempTemperatureData;
  }

  function processMessageResponse(messageDataArray:string):DailyTemperature[]{
    try{
      let parsedDataArray:DailyTemperature[] = JSON.parse(messageDataArray);
      return parsedDataArray;
    }catch(e){
      return [];
    }
    
  }

  function updateChartDataFlag(chartOptionsData:ChartDataHandler){
    if(chartOptionsData.chartDatasets && chartOptionsData.chartDatasets.length >0){
      setHasChartData(true);
    }else{
      setHasChartData(false);
    }
  }

  function handleMessageResponse(message:string,temperatureData:DailyTemperature[]){
    let processTemperatureData = processMessageResponse(message);
    let filteredTempertureData:DailyTemperature[] = filterOlddata(temperatureData);
    filteredTempertureData = filteredTempertureData.concat(processTemperatureData);
    var chartOptionsData = prepareChartData(filteredTempertureData);
    setTemperatureData(filteredTempertureData);
    setTemperatureChartData(chartOptionsData);
    setCurrentTemperatureData(processTemperatureData);
    updateChartDataFlag(chartOptionsData);
  
  }

  function connectToSocketServer(url:string){
    let currentWebSocketHandler = new WebSocketHandler(new WebSocket(url));
    setWebSocketHandler(currentWebSocketHandler);
    currentWebSocketHandler.onOpen((evt:Event) =>{
        console.log(evt);
       
    });

    currentWebSocketHandler.onError((evt:ErrorEvent) =>{
      console.log(evt);
      console.error(
        "Socket encountered error: ",
        evt.message,
        "Closing socket"
      );
      webSocketHandler.close();
    });

    currentWebSocketHandler.onMessage((evt:MessageEvent) =>{
      console.log(evt);
      let string = evt.data;
      handleMessageResponse(string,stateRef.current);
    });

    currentWebSocketHandler.onClose((evt:Event) =>{
      console.log(evt);
      setTimeout(()=>{
        reconnect();
      },connectionTimeout);
    });

  }

  function renderCurrentInfoBlock(){
    if(currentTemperatureData && currentTemperatureData.length >0){
        return <div className='row'>
          <div className="child-div">
            <label><strong className='child-strong'>ID {currentTemperatureData[0].id} </strong></label>
            <label><small>Temp: {currentTemperatureData[0].temperature}</small></label>
          </div>
          <div className="child-div">
          <label><strong className='child-strong'>ID {currentTemperatureData[1].id} </strong></label>
            <label><small>Temp: {currentTemperatureData[1].temperature}</small></label>
          </div>
        </div>
    }else{
      return <></>;
    }
  }

  function convertDatasetIntoMapPoints(chartDatasets:Dataset[]){
    if(!chartDatasets){
      return [];
    }
    var plotDataset = [];
    for(var d = 0;d<chartDatasets.length;d++){
        let color:string = "red";
        if(d != 0){
          color ="Orange";
        }
        var chartObj = {"label":chartDatasets[d].label,"backgroundColor":color,borderColor: color,"id":chartDatasets[d].label,data:chartDatasets[d].data};
        plotDataset.push(chartObj);
      }

    return plotDataset;
  }

  function renderChartBlock(chartOptionHandler:ChartDataHandler){
    if(hasChartData){

      let chartDatasetOptions = {datasets:convertDatasetIntoMapPoints(chartOptionHandler.chartDatasets)};
      return <Line className = 'chart-scroll' data={chartDatasetOptions} options={chartOptionHandler.options}></Line>;
    }else{
      return <label> No chart data available currently</label>;
    }
    
  }

  useEffect(
    () => {
      connectToSocketServer(process.env.REACT_APP_SOCKET_CONNECTION_URL!);
      
      return () => {
        
      };
    },
    []
  );
  //

  return (
    <div className="Web Socket Connection">
     
      {
        renderCurrentInfoBlock()
      }
     {
        renderChartBlock(temperatureChartdata)
     }
     
    </div>
  );

}

export default Dashboard;