import { ScatterDataPoint } from "chart.js";
import Plot from "./Plot";

export default class Dataset {
  id: string;
  label: string;
  data: Plot[];
  backgroundColor: string;
  borderColor: string;
  constructor(id: string, label: string, data: Plot[], color: string) {
    this.id = id;
    this.label = label;
    this.data = data;
    this.backgroundColor = color;
    this.borderColor = color;
  }

  public addData(plot: Plot) {
    this.data.push(plot);
  }

  public sortPlot() {
    this.data = this.data.sort((a: Plot, b: Plot) => (a.x > b.x ? 1 : -1));
  }
}
