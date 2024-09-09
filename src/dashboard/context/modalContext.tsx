/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useRef, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import { ModalContextDTO } from "../entities/modalContextDTO";

export const ModalContext = createContext<ModalContextDTO | null>(null);

export const ModalContextProvider = ({ children }: any) => {
  const chartUseRefTemp = useRef<HighchartsReact.RefObject>(null);
  const chartUseRefReg = useRef<HighchartsReact.RefObject>(null);

  const [chartRGOpen, setChartRGOpen] = useState<boolean>(false);
  const [firstDataTimestamp, setFirstDataTimestamp] = useState<number>(0);
  const defaultContext = {
    chartUseRefTemp,
    chartUseRefReg,
    firstDataTimestamp,
    setFirstDataTimestamp,
    chartRGOpen,
    setChartRGOpen,
  };

  return (
    <ModalContext.Provider value={defaultContext as ModalContextDTO}>
      {children}
    </ModalContext.Provider>
  );
};
