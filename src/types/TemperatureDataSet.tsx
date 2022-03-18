import Plot from "./DataPlot";

export default class TemperatureDataSet {
  id: string;
  label: string;
  data: Plot[];
  backgroundColor: string = "";
  borderColor: string = "";
  constructor(id: string, label: string, data: Plot[]) {
    this.id = id;
    this.label = label;
    this.data = data;
  }

  public setColor(color: string) {
    this.backgroundColor = color;
    this.borderColor = color;
  }

  public addData(plot: Plot) {
    this.data.push(plot);
  }
}
