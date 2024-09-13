import { useState } from "react";
import "./App.css";
import { Home } from "./dashboard";
import ResponsiveAppBar from "./dashboard/components/navbar";
import { ModalContextProvider } from "./dashboard/context/modalContext";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ModalContextProvider>
        <ToastContainer />

        <ResponsiveAppBar />
        <Home />
      </ModalContextProvider>
    </>
  );
}

export default App;
