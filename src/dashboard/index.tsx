import Highcharts from "highcharts/highstock";
import Boost from "highcharts/modules/boost";

import { useContext, useEffect, useState } from "react";
import {
  Container,
  Main,
  InputsContainer,
} from "./styles";
import { controllerResultados } from "./controllers/firebaseRealtime";
import { Backdrop, CircularProgress, TableContainer } from "@mui/material";

import { ModalContext } from "./context/modalContext";
import { ModalContextDTO } from "./entities/modalContextDTO";
import { ToastContainer } from "react-toastify";
import { FormComponent } from "./form";
import { TemperaturaEquilibrioRealtime } from "./controllers/temperaturaEquilibrioRealtime";

Boost(Highcharts);

export const Home = () => {
  const {
    handleMassaAgua,
    handleMassaObjeto,
    handleTempAmbiente,
    handleTempInicialObjeto,
    handleCapacidadeTermicaCalorimetro,
    handleIncertezaCapacidadeTermicaCalorimetro,
    calculaCalorEspecifico,
    realTimeTemperature,
    calorEspecificoMaterial,
    incertezaCalorEspecificoMaterial,
  } = controllerResultados();

  const {
    temperaturaFinal,
    isTemperatureRight,
    buscaTemperatura,
    setIsTemperatureRight,
    setTemperatura,
  } = TemperaturaEquilibrioRealtime();

  const [isFormSubmmited, setIsFormSubmmited] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  useContext(ModalContext) as ModalContextDTO;

  const [currentTemperature, setCurrentTemperature] = useState<number | undefined>();

  useEffect(() => {
    const updateTemperature = () => {
      setCurrentTemperature(realTimeTemperature());
    };

    updateTemperature();
    const intervalId = setInterval(updateTemperature, 10);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if(!isFormSubmmited){
      const checkTemperatureOnLoad = () => {
        buscaTemperatura();
      };
      if(temperaturaFinal === -1000){
        checkTemperatureOnLoad();
      }

      const interval = setInterval(() => {
        checkTemperatureOnLoad();
      }, 30000);

      if (isTemperatureRight) {
        clearInterval(interval);
        if(!isReady && temperaturaFinal !== -1000)
          handleTempAmbiente(temperaturaFinal);
      }

      return () => clearInterval(interval);
    }
  }, [
    isTemperatureRight, 
    temperaturaFinal,
    ]);

    useEffect(() => {
      if(isReady){
        // calculaIncertezaCalorEspecifico(temperaturaFinal);
        calculaCalorEspecifico(temperaturaFinal);
        // encontraMaterial(calorEspecificoMaterialNumber, incertezaCalorEspecificoMaterialNumber);
      }
    }, [isReady])

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
        open={!isTemperatureRight && !isReady}
      >
        <CircularProgress color="inherit" />
        <p>Atingindo a temperatura de equilíbrio</p>
        <p>{currentTemperature}</p>
      </Backdrop>

      <Container>
        <FormComponent 
          buscaTemperatura={buscaTemperatura}
          isReady={isReady}
          setIsReady={setIsReady}
          handleMassaAgua={handleMassaAgua}
          handleMassaObjeto={handleMassaObjeto}
          handleTempInicialObjeto={handleTempInicialObjeto}
          handleCapacidadeTermicaCalorimetro={handleCapacidadeTermicaCalorimetro}
          handleIncertezaCapacidadeTermicaCalorimetro={handleIncertezaCapacidadeTermicaCalorimetro}
          setIsFormSubmmited={setIsFormSubmmited}
          setIsTemperatureRight={setIsTemperatureRight}
          setTemperatura={setTemperatura}
        />

        {isTemperatureRight && isReady && (
          <InputsContainer>
            {/* tabela: */}
              <h2> Calor Específico Encontrado: {calorEspecificoMaterial} ± {incertezaCalorEspecificoMaterial} </h2>
              <TableContainer>
              </TableContainer>
          </InputsContainer>
        )}
      </Container>

      
    </Main>
  );
};
