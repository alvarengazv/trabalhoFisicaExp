import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Boost from "highcharts/modules/boost";
import { temperatureChart } from "./chart/temperature";
import { regressionChart } from "./chart/regression";

import { useContext, useEffect, useState } from "react";
import {
  Container,
  Main,
  Buttons,
  UniqueChart,
  ContainerTable,
  InputsContainer, // Adicionado novo componente para os inputs
} from "./styles";
import { addSeriesInChart } from "./controllers/firebaseRealtime";
import { Backdrop, Button, CircularProgress, TableContainer, TextField } from "@mui/material"; // Adicionado TextField para os inputs

import * as React from "react";
import { ModalContext } from "./context/modalContext";
import { ModalContextDTO } from "./entities/modalContextDTO";
import { ToastContainer } from "react-toastify";
import { min } from "moment";
import { FormComponent } from "./form";
import { TemperaturaEquilibrioRealtime } from "./controllers/temperaturaEquilibrioRealtime";

Boost(Highcharts);

export const Chart = () => {
  const [optionsTemp] = useState({
    ...temperatureChart(),
  });

  const [optionsReg] = useState({
    ...regressionChart(),
  });

  const {
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
    handleTempAmbiente,
    handleTempInicialObjeto,
    handleCapacidadeTermicaCalorimetro,
    handleIncertezaCapacidadeTermicaCalorimetro,
    calculaCalorEspecifico,
    calculaIncertezaCalorEspecifico,
    massaAgua,
    massaObjeto,
    tempInicialAgua,
    tempInicialObjeto,
    capacidadeTermicaCalorimetro,
    incertezaCapacidadeTermicaCalorimetro,
  } = addSeriesInChart();

  const {
    temperaturaFinal,
    isTemperatureRight,
    buscaTemperatura,
    setIsTemperatureRight
  } = TemperaturaEquilibrioRealtime();


  const [isFormSubmmited, setIsFormSubmmited] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  useContext(ModalContext) as ModalContextDTO;

  useEffect(() => {
    if(!isFormSubmmited){
      // Function to be executed every 30 seconds
      const checkTemperatureOnLoad = () => {
        buscaTemperatura().then(() => {
          if (isTemperatureRight) {
            console.log("Temperature is correct: ", temperaturaFinal);
          } else {
            console.log("Temperature is not correct: ", temperaturaFinal);
          }
        });
      };
      if(temperaturaFinal === -1000){
        checkTemperatureOnLoad();
      }

      // Call the function every 30 seconds until the temperature is right
      const interval = setInterval(() => {
        checkTemperatureOnLoad();
      }, 30000); // 30 seconds interval

      // If temperature is right, clear the interval to stop checking
      if (isTemperatureRight) {
        clearInterval(interval);
        if(!isReady && isFormSubmmited)
          handleTempAmbiente(temperaturaFinal);
      }

      // Cleanup the interval when the component unmounts or temperature becomes correct
      return () => clearInterval(interval);
    }
  }, [
    isTemperatureRight, 
    temperaturaFinal,
    ]);

  useEffect(() => {
    console.log("Massa da água: ", massaAgua);
    console.log("Massa do objeto: ", massaObjeto);
    console.log("Temperatura inicial da água: ", tempInicialAgua);
    console.log("Temperatura inicial do objeto: ", tempInicialObjeto);
    console.log("Capacidade térmica do calorímetro: ", capacidadeTermicaCalorimetro);
    console.log("Incerteza da capacidade térmica do calorímetro: ", incertezaCapacidadeTermicaCalorimetro);
  }, [
    massaAgua,
    massaObjeto,
    tempInicialAgua,
    tempInicialObjeto,
    capacidadeTermicaCalorimetro,
    incertezaCapacidadeTermicaCalorimetro,
  ]);

  // realTime();

  return (
    <Main>
      <ToastContainer
        position="top-right"
        autoClose={false}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="colored"
      />

      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open={!isTemperatureRight && !isReady}  // Open Backdrop if temperature is not right
      >
        <CircularProgress color="inherit" />
        <p>Atingindo a temperatura de equilíbrio</p>
      </Backdrop>

      <Container>
        {/* <UniqueChart>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              ...optionsTemp,
            }}
            ref={chartUseRefTemp as React.Ref<HighchartsReact.RefObject>}
          />
        </UniqueChart> */}

        <FormComponent 
          temperaturaFinal={temperaturaFinal}
          buscaTemperatura={buscaTemperatura}
          isTemperatureRight={isTemperatureRight}
          isReady={isReady}
          isFormSubmmited={isFormSubmmited}
          setIsReady={setIsReady}
          handleMassaAgua={handleMassaAgua}
          handleMassaObjeto={handleMassaObjeto}
          handleTempInicialObjeto={handleTempInicialObjeto}
          handleCapacidadeTermicaCalorimetro={handleCapacidadeTermicaCalorimetro}
          handleIncertezaCapacidadeTermicaCalorimetro={handleIncertezaCapacidadeTermicaCalorimetro}
          setIsFormSubmmited={setIsFormSubmmited}
          setIsTemperatureRight={setIsTemperatureRight}
        />

        {isTemperatureRight && isReady && (
          <InputsContainer>
            {/* tabela: */}
              <h2> Calor Específico Encontrado: {calculaCalorEspecifico()} ± {calculaIncertezaCalorEspecifico()} </h2>
              <TableContainer>
                <thead>
                </thead>
                <tbody>
                </tbody>
              </TableContainer>
          </InputsContainer>
        )}
      </Container>

      
    </Main>
  );
};
