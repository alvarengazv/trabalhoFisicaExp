import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: space-evenly;

  padding: 20px;
  flex-direction: row;
  display: flex;
`;

export const Main = styled.div`
  place-items: center;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

export const Buttons = styled.div`
  width: 25vw;
  display: flex;
  justify-content: space-between;
  padding-top: 30px;
  padding-bottom: 40px;
`;

export const UniqueChart = styled.div`
  width: 45vw;
`;

export const ContainerTable = styled.div`
  width: 80vw;
  padding: 25px;
  font-size: 1.2em;
  font-size: larger;
  color: #000;
  background-color: white;
  margin-bottom: 20px;
`;
export const InputsContainer = styled.div`
h2{
  background-color: #3289FF;
  padding: 10px;
  color: #ffff;

}

p{
  color: #000;
  font-size: 1.2em;
}
  padding: 10px;
  background-color: #ffff;
  color: #000;
  text-align: center;
  width: 38%;
  flex-direction: column;
  display: flex;
  margin-top: 10px; /* Adicione o espaçamento desejado aqui */
  margin-bottom: 50px; /* Adicione o espaçamento desejado aqui */
`;
