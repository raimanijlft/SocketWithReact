export class WebSocketHandler{
    ws:WebSocket;
    constructor(ws:WebSocket){
        this.ws = ws;
    }

    onOpen(callback:Function) {
        this.ws.onopen = evt =>{
            console.log("Websocket connection opened...");
            callback(evt);
        }
    }

    getSocketState(){
        return this.ws.readyState;
    }
    
    onMessage(callback:Function) {
        this.ws.onmessage = evt =>{
            console.log("Websocket message received...");
            callback(evt);
        }
    }

    onClose(callback:Function){
        this.ws.onclose = evt =>{
            console.log("Websocket connection closed...");
            callback(evt);
        }
    }

    close(){
        this.ws.close();
    }

    onError(callback:Function) {
        this.ws.onerror = evt =>{
            console.log("Websocket connection error...");
            callback(evt);
        }
    }

    send(message:string,callback:Function){
        this.ws.send(message);
    }
} 