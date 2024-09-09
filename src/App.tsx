import { useState } from "react";
import "./App.css";
import { Chart } from "./dashboard";
import ResponsiveAppBar from "./dashboard/components/navbar";
import { ModalContextProvider } from "./dashboard/context/modalContext";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ModalContextProvider>
        <ToastContainer />

        <ResponsiveAppBar />
        <Chart />
      </ModalContextProvider>
    </>
  );
}

export default App;
