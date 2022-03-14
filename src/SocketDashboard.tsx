import React from 'react';
import logo from './logo.svg';
import './SocketDashboard.css';
import {SOCKET_CONNECTION_URL} from './types/SocketConstants';
import { WebSocketHandler } from './services/WebSocketHandler';
import { SocketDashboardProps } from './types/SocketDashboardProps';
import { SocketDashboardState } from './types/SocketDashboardState';
import SocketData from './types/SocketData';
import { Line } from 'react-chartjs-2';
import MapData from './types/MapData';
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
} from 'chart.js'
import { Chart } from 'react-chartjs-2'


export class SocketDashboard extends React.Component<SocketDashboardProps, SocketDashboardState> {
  webSocketHandler?:WebSocketHandler;
  dataTimeout:number = 300000;
  connectionTimeout:number = 30000;
  constructor(props:SocketDashboardProps,state:SocketDashboardState) {
    super(props);
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
    state = {
      count: 0,
      webSocketHandler:undefined,
      socketData:undefined,
      currentSocketData:undefined,
      chartData:undefined
    };
  }

  reconnect = () => {
    var webSocketHandler = this.state.webSocketHandler;
      if (!webSocketHandler || webSocketHandler.getSocketState() == WebSocket.CLOSED) this.connectToSocketServer(SOCKET_CONNECTION_URL); 
  };

  prepareChartData(socketData:SocketData[]){
    let chartData = {};
    let dataMap = new Map();
    var dataset:any = [];
    var mapObject:MapData[] = [];
    for(var i = 0;i<socketData.length;i++){
      if(dataMap.has(socketData[i].id)){
        let mappetObj:MapData = dataMap.get(socketData[i].id);
        if(socketData[i].data<=100){
          mappetObj.addData({"x":socketData[i].temperature,"y":socketData[i].data}); 
        }
      }else{
        if(socketData[i].data<=100){
          let newMapObj:MapData = new MapData(socketData[i].id,[{"x":socketData[i].temperature,"y":socketData[i].data}]);
          dataMap.set(socketData[i].id,newMapObj);
        }
        
      }
    }

    dataMap.forEach((data,key) =>{
        var tempObj = {
          "label":key,
          "id":key,
          "data":data.data.sort((a:any, b:any) => a.x > b.x ? 1 : -1)
        };
        dataset.push(tempObj);
    });

    return {
      data:{datasets:dataset},
      options: {
        scales: {
          x: {
            display: true,
            type:'linear',
            title: {
              display: true,
              text: 'temp'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Data'
            }
           
          }
        }
      },
    }
  }

  filterOlddata(){
    var currentSocketList = this.state.socketData;
    var tempSocketList:SocketData[] = [];
    if(currentSocketList){
      var currentTimeStamp = new Date().getTime();
      for(var i=0;i<currentSocketList.length;i++){
        var currentSocketObj:SocketData = currentSocketList[i];
        if((currentTimeStamp - currentSocketObj.timestamp) < this.dataTimeout){
          tempSocketList.push(currentSocketObj);
        }
      }
    }
    return tempSocketList;
  }

  connectToSocketServer(url:string){
    let webSocketHandler = new WebSocketHandler(new WebSocket(url));
    webSocketHandler.onOpen((evt:Event) =>{
        console.log(evt);
        this.setState({webSocketHandler:webSocketHandler});
    });

    webSocketHandler.onError((evt:ErrorEvent) =>{
      console.log(evt);
      console.error(
        "Socket encountered error: ",
        evt.message,
        "Closing socket"
      );
      this.webSocketHandler?.close();
    });

    webSocketHandler.onMessage((evt:MessageEvent) =>{
      console.log(evt);
      let string = evt.data;
      let parsedDataArray = JSON.parse(string);
      let currentMessageData:SocketData[] = [];
      for(var p =0;p<parsedDataArray.length;p++){
        let parsedData = parsedDataArray[p];
        let currentSocketdata:SocketData = new SocketData(parsedData.id,parsedData.temperature,parsedData.timestamp,parsedData.data);
        currentMessageData.push(currentSocketdata);
      }
      let filteredSocketdata:SocketData[] = this.filterOlddata();
      filteredSocketdata = filteredSocketdata.concat(currentMessageData);
      var chartData = this.prepareChartData(filteredSocketdata);
      this.setState({socketData:filteredSocketdata,chartData:chartData,currentSocketData:currentMessageData});
    });

    webSocketHandler.onClose((evt:Event) =>{
      console.log(evt);
      setTimeout(()=>{
        this.reconnect();
      },this.connectionTimeout);
    });

  }

  componentDidMount(){
    this.connectToSocketServer(SOCKET_CONNECTION_URL);
  }

  render(){

    let chartData = {labels:["1,2"],datasets:[]};
    let options = {};
    if(this.state && this.state.chartData){
      chartData = this.state.chartData.data;
      options = this.state.chartData.options;
    }
    return (
      <div className="Web Socket Connection">
        {
          (this.state && this.state.currentSocketData && this.state.currentSocketData?.length > 0)?
          <div className='row'>
            <div className="child-div">
              <label><strong className='child-strong'>ID {this.state.currentSocketData[0].id} </strong></label>
              <label><small>Temp: {this.state.currentSocketData[0].temperature}</small></label>
            </div>
            <div className="child-div">
            <label><strong className='child-strong'>ID {this.state.currentSocketData[1].id} </strong></label>
              <label><small>Temp: {this.state.currentSocketData[1].temperature}</small></label>
            </div>
          </div>:<></>
        }
        
        <Line data={chartData} options={options}></Line>
      </div>
    );
  }
}
