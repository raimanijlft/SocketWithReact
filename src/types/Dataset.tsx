import { ScatterDataPoint } from "chart.js";
import Plot from "./Plot";

export default class Dataset{
    id:string;
    label:string;
    data:Plot[];
    constructor(id:string,label:string,data:Plot[]){
        this.id = id;
        this.label = label;
        this.data = data;
    }
}