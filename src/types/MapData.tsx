import { ScatterDataPoint } from "chart.js";
import Plot from "./Plot";

export default class MapData{
    id:number;
    data:Plot[];
    
    constructor(id:number,data:Plot[]){
        this.id = id;
        this.data = data;
    }

    public addData(plot:Plot){
        this.data.push(plot);
    }
}