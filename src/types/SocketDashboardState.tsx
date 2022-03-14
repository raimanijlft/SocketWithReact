import { WebSocketHandler } from '../services/WebSocketHandler';
import SocketData from '../types/SocketData';


export type SocketDashboardState = {
    count?: number; // like this
    webSocketHandler?:WebSocketHandler,
    socketData?:SocketData[],
    currentSocketData?:SocketData[],
    chartData?:any
  };