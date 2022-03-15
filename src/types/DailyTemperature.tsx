export default class DailyTemperature{
    id:number;
    temperature:number;
    timestamp:number;
    data:number;
    constructor(id:number,temperature:number,timestamp:number,data:number){
        this.id = id;
        this.temperature = temperature;
        this.timestamp = timestamp
        this.data = data;
    }

    
}