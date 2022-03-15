import Dataset from "./Dataset";

export default class ChartDataHandler{
    chartDatasets:Dataset[];
    options:{};
    constructor(chartDatasets:Dataset[],options:Object){
        this.chartDatasets = chartDatasets;
        this.options =options;
    }
}