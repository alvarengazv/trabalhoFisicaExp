/* eslint-disable react-hooks/rules-of-hooks */
import { ref, onValue, push } from "firebase/database";
import { StartFireBase } from "../../authFirebase";
import { useContext, useState } from "react";
import { ModalContext } from "../context/modalContext";
import { ModalContextDTO } from "../entities/modalContextDTO";
import regression from "regression";
import "react-toastify/dist/ReactToastify.css";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { TableComponents, TableVirtuoso } from "react-virtuoso";
import React from "react";
import { Paper } from "@mui/material";
import { ColumnData, Data } from "../entities/columnDataDTO";
import { toast } from "react-toastify";

export const addSeriesInChart = () => {
  const {
    chartUseRefTemp,
    chartUseRefReg,
    chartRGOpen,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useContext(ModalContext) as ModalContextDTO;

  let temperaturaEncontrada = false;

  let temps: any = [];
  // eslint-disable-next-line prefer-const
  let TempToTable: any = [];
  const rows = [] as any;
  const db = StartFireBase();

  let variacaoTemperatura_ = 0;
  let variacaoTempo_ = 0;
  let massaAgua = 0;
  let massaObjeto = 0;
  let tempInicialAgua = 0
  let tempInicialObjeto = 0
  const incertezaBalanca = 0.001
  const incertezaTermometro = 0.5
  const incertezaCalorimetro = 4.0967

  let tempEquilibrio = 0

  const handleTempInicialAgua = (event: any) => {
    tempInicialAgua = event;
  };

  const handleTempInicialObjeto = (event: any) => {
    tempInicialObjeto = event;
  };

  const handleVariacaoTemperatura = (event: any) => {
    variacaoTemperatura_ = event;
  };

  const handleVariacaoTempo = (event: any) => {
    variacaoTempo_ = event;
  };

  const handleMassaAgua = (event: any) => {
    massaAgua = event;
  };

  const handleMassaObjeto = (event: any) => {
    massaObjeto = event;
  };


  let firstDataTimestamp = 0;

  const verificaVariacaoTemperatura = () => {
    // Obtém o comprimento do array temps
    const tempsLength = temps.length;
  
    // Verifica se há dados suficientes e se as variáveis do usuário são configuradas corretamente
    if (tempsLength > 1 && variacaoTempo_ !== 0 && variacaoTemperatura_ !== 0) {
      // Inicializa os acumuladores
      let acumuladoTempo = 0;
      let acumuladoVariacaoTemperatura = 0;
  
      // Itera sobre os dados em temps
      for (let i = 1; i < tempsLength; i++) {
        // Obtém os valores de tempo e temperatura para os pontos atual e anterior
        const [tempoAtual, temperaturaAtual] = temps[i];
        const [tempoAnterior, temperaturaAnterior] = temps[i - 1];
  
        // Calcula a variação de temperatura e o intervalo de tempo entre os pontos
        const variacaoTemperatura = Math.abs(temperaturaAtual - temperaturaAnterior);
        const tempo = tempoAtual - tempoAnterior;
  
        // Acumula os valores de variação de temperatura e tempo
        acumuladoTempo += tempo;
        acumuladoVariacaoTemperatura += variacaoTemperatura;
  
        // Verifica se o tempo acumulado é maior ou igual ao tempo definido pelo usuário
        if (acumuladoTempo >= variacaoTempo_ && !temperaturaEncontrada) {
          temperaturaEncontrada = true
          // Verifica se a variação de temperatura acumulada é menor ou igual à variação definida pelo usuário
          if (acumuladoVariacaoTemperatura <= variacaoTemperatura_) {
            const [tempoFinal, temperaturaFinal] = temps[i];
  
            // Exibe mensagens de toast indicando a temperatura de equilíbrio e a variação de temperatura detectada
            toast.success(
              <div>
                <strong>Temperatura de equilíbrio:</strong> {temperaturaFinal} graus.
              </div>
            );
            tempEquilibrio = temperaturaFinal;
            toast.success(
              `Variação de temperatura de ${acumuladoVariacaoTemperatura.toFixed(2)} graus detectada no intervalo de ${acumuladoTempo.toFixed(2)} segundos.`
            );

            const calorEspecificoMaterial = calculaCalorEspecifico();
            const incertezaCalorEspecificoMaterial = calculaIncertezaCalorEspecifico();
            if(calorEspecificoMaterial !== null && incertezaCalorEspecificoMaterial !== null){
              toast.info(
                `Calor específico do objeto: (${(Math.abs(calorEspecificoMaterial)).toFixed(5)} +- ${(Math.abs(incertezaCalorEspecificoMaterial)).toFixed(5)}) cal/g°C`
              );
            }
          }
  
          // Reinicia os acumuladores para preparar a análise do próximo intervalo
          acumuladoTempo = 0;
          acumuladoVariacaoTemperatura = 0;
        }
      }
    }
  };
  
  
  
  const calculatorReg = () => {
    chartUseRefReg?.current?.chart.series[1]?.remove();
    chartUseRefReg?.current?.chart.series[0]?.remove();

    const slope = regression.linear(temps, {
      precision: 5,
    });
    const xs = [] as any;
    const ys = [];

    temps?.forEach(function (d: any) {
      xs.push(d[0]);
      ys.push(d[1]);
    });
    const r = slope.r2;
    const m = slope.equation[0];
    const b = slope.equation[1];
    const eq = slope.string;
    const x0 = Math.min.apply(null, xs),
      y0 = m * x0 + b;
    const xf = Math.max.apply(null, xs),
      yf = m * xf + b;

    chartUseRefReg?.current?.chart.addSeries({
      type: "scatter",
      name: "Temperature (°C)",
      data: temps,
      marker: {
        radius: 4,
      },
    });

    chartUseRefReg?.current?.chart.addSeries({
      color: "red",
      type: "line",
      name: `Regression Line | ${eq} | r²: ${r}`,
      data: [
        [x0, y0],
        [xf, yf],
      ],
      marker: {
        enabled: true,
      },
      states: {
        hover: {
          lineWidth: 1,
        },
      },
      enableMouseTracking: false,
    });
    chartUseRefReg?.current?.chart.redraw();
    rows.push(rowsAux);
  };

  const handleOpenChart = (): void => {
    TempToTable.forEach((element: any[]) => {
      rowsAux.push(
        createData(element[0] as string, element[1] as any, element[2] as any)
      );
    });
    temps.length && calculatorReg();
    TempToTable = [];
  };

  const calculaCalorEspecifico = () => {
    console.log(massaAgua, massaObjeto, tempInicialAgua, tempInicialObjeto)
    if(massaAgua !== 0 && massaObjeto !== 0 && tempInicialAgua !== 0 && tempInicialObjeto !== 0){
      
      const DeltaTempAgua = tempEquilibrio - tempInicialAgua;
      const DeltaTempObjeto = tempEquilibrio - tempInicialObjeto;
      const calorEspecificoAgua = 1 // 1 cal/g°C
      const capacidadeTermicaCalorimetro = 15.07617 // 15 cal/°C


      const calorEspecificoMaterial = (massaAgua * calorEspecificoAgua * DeltaTempAgua) + (capacidadeTermicaCalorimetro * DeltaTempAgua) / (massaObjeto  * DeltaTempObjeto)
      console.log(calorEspecificoMaterial)
      return calorEspecificoMaterial
   
    } else{
      return null
    }
  }

  const calculaIncertezaCalorEspecifico = () => {
    console.log(massaAgua, massaObjeto, tempInicialAgua, tempInicialObjeto)
    if(massaAgua !== 0 && massaObjeto !== 0 && tempInicialAgua !== 0 && tempInicialObjeto !== 0){
      
      const DeltaTempAgua = tempEquilibrio - tempInicialAgua;
      const DeltaTempObjeto = tempEquilibrio - tempInicialObjeto;
      const calorEspecificoAgua = 1 // 1 cal/g°C
      const capacidadeTermicaCalorimetro = 15.07617 // 15 cal/°C

      let parcelaMassaAgua = (calorEspecificoAgua * ((DeltaTempAgua) / (massaObjeto * DeltaTempObjeto)))
      parcelaMassaAgua *= parcelaMassaAgua
      parcelaMassaAgua *= incertezaBalanca * incertezaBalanca

      let parcelaMassaObjeto = (- ( ((calorEspecificoAgua * massaAgua)*DeltaTempAgua) + capacidadeTermicaCalorimetro * DeltaTempAgua) / ((massaObjeto * massaObjeto) * DeltaTempObjeto) )
      parcelaMassaObjeto *= parcelaMassaObjeto
      parcelaMassaObjeto *= incertezaBalanca * incertezaBalanca

      let parcelaTempFinal = ( (((calorEspecificoAgua * massaAgua) * (tempInicialAgua - tempInicialObjeto)) + ((capacidadeTermicaCalorimetro) * (tempInicialAgua - tempInicialObjeto)) ) / ((massaObjeto) * (DeltaTempObjeto * DeltaTempObjeto)) )
      parcelaTempFinal *= parcelaTempFinal
      parcelaTempFinal *= incertezaTermometro * incertezaTermometro

      let parcelaTempInicialAgua = (- ((calorEspecificoAgua * massaAgua) + capacidadeTermicaCalorimetro) / (massaObjeto * DeltaTempObjeto) )
      parcelaTempInicialAgua *= parcelaTempInicialAgua
      parcelaTempInicialAgua *= incertezaTermometro * incertezaTermometro

      let parcelaTempInicialObjeto = ( (((calorEspecificoAgua * massaAgua) * DeltaTempAgua) + (capacidadeTermicaCalorimetro * DeltaTempAgua)) / ((massaObjeto) * (DeltaTempObjeto * DeltaTempObjeto)))
      parcelaTempInicialObjeto *= parcelaTempInicialObjeto
      parcelaTempInicialObjeto *= incertezaTermometro * incertezaTermometro

      let parcelaCapacidadeTermicaCalorimetro = (DeltaTempAgua / massaObjeto * DeltaTempObjeto)
      parcelaCapacidadeTermicaCalorimetro *= parcelaCapacidadeTermicaCalorimetro
      parcelaCapacidadeTermicaCalorimetro *= incertezaCalorimetro * incertezaCalorimetro

      const incertezaCalorEspecificoMaterial = Math.sqrt(parcelaMassaAgua + parcelaMassaObjeto + parcelaTempFinal + parcelaTempInicialAgua + parcelaTempInicialObjeto + parcelaCapacidadeTermicaCalorimetro)

      console.log(incertezaCalorEspecificoMaterial)
      return incertezaCalorEspecificoMaterial
   
    } else{
      return null
    }
  }

  const handleCleanChart = (): void => {
    temperaturaEncontrada = false;
    temps = [];
    temps.clear;
    chartUseRefReg?.current?.chart.series[1]?.remove();
    chartUseRefReg?.current?.chart.series[0]?.remove();
    chartUseRefTemp?.current?.chart.series[0]?.remove();
  };

  function processTemperatureData(newData: any, temps: any): any {
    const processedDataItem = [0, newData[1]];
    if (temps.length === 0 && newData[1])
      firstDataTimestamp = newData[0] / 1000;

    if (temps.length === 1) {
      processedDataItem[0] = newData[0] / 1000 - firstDataTimestamp;
    } else if (temps.length > 0) {
      processedDataItem[0] = newData[0] / 1000 - firstDataTimestamp;
    }

    TempToTable.push([
      new Date(newData[0]).toLocaleString(),
      newData[1],
      processedDataItem[0],
    ]);
    temps.push(processedDataItem);
  }

  const realTime = () => {
    const dbRef = ref(db, "temperatura");
    onValue(dbRef, (snapshot) => {
      let data;
      const result = snapshot.val();
      if (typeof result === "number") {
        const date = new Date().getTime();
        data = [date, result];
      } else {
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.key) {
            data = [new Date().getTime(), childSnapshot.val()];
          }
        });
      }

      if (data) {
        processTemperatureData(data, temps);
        const hasSerie = chartUseRefTemp?.current?.chart.getOptions() as any;
        if (hasSerie.series.length === 0) {
          chartUseRefTemp?.current?.chart.addSeries({
            type: "line",
            name: "Temperature (°C)",
            data: [],
          });
        }
        verificaVariacaoTemperatura();

        chartUseRefTemp?.current?.chart.series[0].addPoint({
          x: temps[temps.length - 1][0],
          y: temps[temps.length - 1][1],
        });
        chartUseRefReg?.current?.chart.redraw();
      }
    });
  };

  // Tabela

  const columns: ColumnData[] = [
    {
      width: 150,
      label: "Date",
      dataKey: "date",
    },
    {
      width: 120,
      label: "Temperature",
      dataKey: "temperature",
      numeric: true,
    },
    {
      width: 120,
      label: "Time Difference",
      dataKey: "timeDifference",
      numeric: true,
    },
  ];

  function createData(
    date: string,
    temperature: number,
    timeDifference: number
  ): Data {
    return { date, temperature, timeDifference };
  }

  const rowsAux: Data[] = [];

  const VirtuosoTableComponents: TableComponents<Data> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
      <Table
        {...props}
        sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
      />
    ),
    TableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
  };

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.numeric || false ? "right" : "left"}
            style={{ width: column.width }}
            sx={{
              backgroundColor: "background.paper",
            }}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function rowContent(_index: number, row: Data) {
    return (
      <React.Fragment>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.numeric || false ? "right" : "left"}
          >
            {row[column.dataKey]}
          </TableCell>
        ))}
      </React.Fragment>
    );
  }

  const returnTable = () => {
    return (
      <Paper style={{ height: 300, width: "100%" }}>
        <TableVirtuoso
          data={rows}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Paper>
    );
  };

  return {
    realTime,
    chartUseRefTemp,
    chartUseRefReg,
    handleOpenChart,
    chartRGOpen,
    handleCleanChart,
    VirtuosoTableComponents,
    fixedHeaderContent,
    rowContent,
    returnTable,
    handleVariacaoTemperatura,
    handleVariacaoTempo,
    handleMassaAgua,
    handleMassaObjeto,
    handleTempInicialAgua,
    handleTempInicialObjeto
  };
};
