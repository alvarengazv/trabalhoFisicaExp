import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import Boost from "highcharts/modules/boost";
import { temperatureChart } from "./chart/temperature";
import { regressionChart } from "./chart/regression";

import { useContext, useState } from "react";
import {
  Container,
  Main,
  Buttons,
  UniqueChart,
  ContainerTable,
  InputsContainer, // Adicionado novo componente para os inputs
} from "./styles";
import { addSeriesInChart } from "./controllers/firebaseRealtime";
import { Button, TextField } from "@mui/material"; // Adicionado TextField para os inputs

import * as React from "react";
import { ModalContext } from "./context/modalContext";
import { ModalContextDTO } from "./entities/modalContextDTO";
import { ToastContainer } from "react-toastify";

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
    handleOpenChart,
    chartUseRefReg,
    handleCleanChart,
    handleVariacaoTemperatura,
    handleVariacaoTempo,
    handleMassaAgua,
    handleMassaObjeto,
    handleTempInicialAgua,
    handleTempInicialObjeto,
  } = addSeriesInChart();
  useContext(ModalContext) as ModalContextDTO;

  const handleEquilibriumSubmit = () => {
    // Lógica para lidar com os dados de equilíbrio quando o usuário submete o formulário
    // Você pode acessar os valores usando equilibriumTime e equilibriumTemperature
  };

  realTime();

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

      <Container>
        <UniqueChart>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              ...optionsTemp,
            }}
            ref={chartUseRefTemp as React.Ref<HighchartsReact.RefObject>}
          />
        </UniqueChart>

        <UniqueChart>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              ...optionsReg,
            }}
            ref={chartUseRefReg as React.Ref<HighchartsReact.RefObject>}
          />
        </UniqueChart>
      </Container>

      <Buttons>
        <Button onClick={() => handleOpenChart()} variant="contained">
          Gerar Regressão Linear
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleCleanChart()}
        >
          Limpar Gráficos
        </Button>
      </Buttons>

      <InputsContainer>
        <h2> Insira os valores para achar a temperatura de equilíbrio</h2>
        <p>
          Será considerado a temperatura de equilíbrio quando a partir do
          tempo(em segundos) selecionado a temperatura variar o grau selecionado
        </p>
        <TextField
          label="Variação do tempo"
          type="number"
          variant="outlined"
          // value={equilibriumTime}
          margin="normal"
          onChange={(e) => handleVariacaoTempo(Number(e.target.value))}
        />
        <TextField
          label="Variação da temperatura (em °C)"
          type="number"
          variant="outlined"
          // value={equilibriumTemperature}
          color="primary"
          margin="normal"
          onChange={(e) => handleVariacaoTemperatura(Number(e.target.value))}
        />

        <h2>
          {" "}
          Insira os valores abaixo para achar o calor específico do objeto
          submerso
        </h2>
        <TextField
          label="Massa da água (em gramas)"
          type="number"
          variant="outlined"
          margin="normal"
          onChange={(e) => handleMassaAgua(Number(e.target.value))}
        />

        <TextField
          label="Temperatura inicial da água (em °C)"
          type="number"
          variant="outlined"
          margin="normal"
          onChange={(e) => handleTempInicialAgua(Number(e.target.value))}
        />

        <TextField
          label="Massa do objeto (em gramas)"
          type="number"
          variant="outlined"
          margin="normal"
          onChange={(e) => handleMassaObjeto(Number(e.target.value))}
        />

        <TextField
          label="Temperatura inicial do objeto (em °C)"
          type="number"
          variant="outlined"
          margin="normal"
          onChange={(e) => handleTempInicialObjeto(Number(e.target.value))}
        />
      </InputsContainer>

      <ContainerTable>
        <h2>Regressão Linear</h2>A regressão linear dos mínimos quadrados é uma
        técnica estatística utilizada para modelar a relação entre uma variável
        dependente e uma ou mais variáveis independentes. No caso da regressão
        linear simples, há apenas uma variável independente. Essa técnica é
        amplamente utilizada para análise e previsão de dados em diversos
        campos, incluindo ciências sociais, econômicas e científicas. A ideia
        por trás da regressão linear dos mínimos quadrados é encontrar a linha
        reta que melhor se ajusta aos dados observados, minimizando a soma dos
        quadrados dos erros entre os valores previstos pela linha de regressão e
        os valores reais. Essa linha de regressão é representada por uma equação
        na forma y = mx + b, onde "y" é a variável dependente (nesse caso, a
        temperatura), "x" é a variável independente (por exemplo, o tempo) e "m"
        e "b" são os coeficientes da regressão. Ao traçar o gráfico com a
        temperatura e a linha de regressão, você poderá observar visualmente a
        relação entre as variáveis e a qualidade do ajuste. Se a linha de
        regressão for uma boa representação dos dados, os pontos observados
        devem estar próximos a ela. Se houver uma dispersão significativa em
        torno da linha, pode indicar uma relação mais complexa ou outros fatores
        que não estão sendo considerados pelo modelo linear simples. É
        importante lembrar que a regressão linear dos mínimos quadrados
        pressupõe que a relação entre as variáveis seja linear e que os erros de
        medição sejam aleatórios e independentes. Além disso, é necessário
        analisar os resultados estatísticos, como o coeficiente de determinação
        (R²), para avaliar a qualidade do ajuste e a significância estatística
        dos coeficientes da regressão.
      </ContainerTable>

      <ContainerTable>
        <h2>Temperatura de Equilíbrio (Água-Objeto)</h2>A temperatura de
        equilíbrio é um fenômeno intrigante que se desenrola quando um objeto é
        imerso na água, culminando em um ponto de estabilidade térmica entre
        ambos. Este processo é governado pelos princípios fundamentais de
        condução térmica, convecção e radiação, conduzindo a uma troca de
        energia térmica até que as temperaturas do objeto e da água se igualem.
        Observável por meio de instrumentos sensíveis, esse equilíbrio térmico
        não apenas revela mudanças nas propriedades físicas da água e do objeto,
        mas também tem aplicações práticas significativas, desde o design de
        sistemas de resfriamento até estudos científicos aprofundados sobre as
        características térmicas de materiais específicos em ambientes
        aquáticos. Além disso, serve como uma ferramenta educacional envolvente,
        permitindo a exploração prática de conceitos de transferência de calor e
        termodinâmica. Compreender a temperatura de equilíbrio na interação
        água-objeto não apenas desvenda os mistérios térmicos do ambiente
        aquático, mas também oferece insights cruciais para diversas áreas
        científicas e tecnológicas.
      </ContainerTable>
    </Main>
  );
};
