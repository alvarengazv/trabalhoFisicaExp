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
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

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
    diferencaPercentualMedia,
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
        calculaCalorEspecifico(temperaturaFinal);
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
        <p>{currentTemperature} °C</p>
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
              <Box sx={{ backgroundColor: '#f7f7f7', p: 3, borderRadius: 2, boxShadow: 3, maxWidth: 800, mx: 'auto' }}>
              <h2> Calor Específico Encontrado: {calorEspecificoMaterial} ± {incertezaCalorEspecificoMaterial} cal/g°C </h2>

              <TableContainer component={Paper} sx={{ mt: 4 }}>
                  <h2>Tabela de Calor Específico</h2>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ backgroundColor: 'gray', color: 'white', fontWeight: 'bold' }}>Material</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: 'gray', color: 'white', fontWeight: 'bold' }}>Calor Específico (cal/g°C)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: 'gray', color: 'white', fontWeight: 'bold' }}>Similaridade</TableCell>
                    </TableRow>
                  </TableHead>
                    <TableBody>
                    {[
                      { material: 'Água', calor: 1.0000, similaridade: '-' },
                      { material: 'Alumínio', calor: 0.2140, similaridade: `${(Number((1 - diferencaPercentualMedia[0]).toPrecision(2)) * 100).toString()}%` },
                      { material: 'Cobre', calor: 0.0920, similaridade: `${(Number((1 - diferencaPercentualMedia[1]).toPrecision(2)) * 100).toString()}%` },
                      { material: 'Ferro', calor: 0.1070, similaridade: `${(Number((1 - diferencaPercentualMedia[2]).toPrecision(2)) * 100).toString()}%` },
                      { material: 'Prata', calor: 0.0561, similaridade: `${(Number((1 - diferencaPercentualMedia[3]).toPrecision(2)) * 100).toString()}%` },
                      { material: 'Ouro', calor: 0.0308, similaridade: `${(Number((1 - diferencaPercentualMedia[4]).toPrecision(2)) * 100).toString()}%` },
                      { material: 'Madeira', calor: 0.4420, similaridade: `${(Number((1 - diferencaPercentualMedia[5]).toPrecision(2)) * 100).toString()}%` },
                      { material: 'Bronze', calor: 0.0884, similaridade: `${(Number((1 - diferencaPercentualMedia[6]).toPrecision(2)) * 100).toString()}%` }
                    ].map((row) => (
                      <TableRow key={row.material} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f2f2f2' } }}>
                      <TableCell align="center">{row.material}</TableCell>
                      <TableCell align="center">{row.calor}</TableCell>
                      <TableCell align="center">{row.similaridade}</TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </TableContainer>
            </Box>
            
          </InputsContainer>
        )}
      </Container>

      
    </Main>
  );
};
