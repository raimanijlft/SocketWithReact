import Dashboard from "./Dashboard";
import { unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import {
  prepareChartData,
  filterOlddata,
  processMessageResponse,
} from "./types/Common";
import { waitFor, render } from "@testing-library/react";

let container: any = null;

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  document = {
    ...document,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});
const renderComponent = () => render(<Dashboard />, container);
it("verify TimeStamp value from Socket", () => {
  const message =
    '[{"id":1,"timestamp":1647317351301,"temperature":0,"data":117},{"id":2,"timestamp":1647317351301,"temperature":33,"data":63}]';
  let processData = processMessageResponse(message);
  let filteredData = filterOlddata(processData, 5 * 60 * 1000);
  expect(filteredData.length).toEqual(0);
});

it("verify Socket Data with Chart", () => {
  const message =
    '[{"id":1,"timestamp":1647317351301,"temperature":0,"data":117},{"id":2,"timestamp":1647317351301,"temperature":33,"data":63}]';
  let processData = processMessageResponse(message);
  const chartData = prepareChartData(processData);
  expect(chartData.chartDatasets.length).toEqual(1);
});

describe("useFetch", () => {
  it("Render Dashboard component", async () => {
    const { rerender } = render(<Dashboard />);
    rerender(<Dashboard />);
    await waitFor(
      () => {
        var strongChild = document.getElementsByClassName("child-strong");
        expect(strongChild.length).toEqual(2);
      },
      { timeout: 3000 }
    );
  });
});
