import DailyTemperature from "./DailyTemperature";

export default class InfoBlockProps {
  infoData: DailyTemperature;
  constructor(infoData: DailyTemperature) {
    this.infoData = infoData;
  }
}
