import HighchartsReact from "highcharts-react-official";

export interface ModalContextDTO {
  chartUseRefTemp: React.RefObject<HighchartsReact.RefObject>;
  chartUseRefReg: React.RefObject<HighchartsReact.RefObject>;
  firstDataTimestamp: number;
  setFirstDataTimestamp: React.Dispatch<React.SetStateAction<number>>;
  chartRGOpen: boolean;
  setChartRGOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
