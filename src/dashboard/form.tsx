import { useEffect, useRef, useState } from "react";
import { Button, TextField } from "@mui/material";
import { InputsContainer } from "./styles";

    export const FormComponent = (
      {
            temperaturaFinal,
            buscaTemperatura,
            isTemperatureRight,
            isReady,
            isFormSubmmited,
            setIsReady,
            handleMassaAgua,
            handleMassaObjeto,
            handleTempInicialObjeto,
            handleCapacidadeTermicaCalorimetro,
            handleIncertezaCapacidadeTermicaCalorimetro,
            setIsFormSubmmited,
            setIsTemperatureRight
      }: {
            temperaturaFinal: number,
            buscaTemperatura: () => Promise<boolean>,
            isTemperatureRight: boolean,
            isReady: boolean,
            isFormSubmmited: boolean
            setIsReady: React.Dispatch<React.SetStateAction<boolean>>,
            handleMassaAgua: React.Dispatch<React.SetStateAction<number>>,
            handleMassaObjeto: React.Dispatch<React.SetStateAction<number>>,
            handleTempInicialObjeto: React.Dispatch<React.SetStateAction<number>>,
            handleCapacidadeTermicaCalorimetro: React.Dispatch<React.SetStateAction<number>>,
            handleIncertezaCapacidadeTermicaCalorimetro: React.Dispatch<React.SetStateAction<number>>,
            setIsFormSubmmited: React.Dispatch<React.SetStateAction<boolean>>,
            setIsTemperatureRight: React.Dispatch<React.SetStateAction<boolean>>
      }
    ) => {
        const [massaAgua, setMassaAgua] = useState<string>("0");
        const [massaObjeto, setMassaObjeto] = useState<string>("0");
        const [incertezaBalanca, setIncertezaBalanca] = useState<string>("0.001");
        const [tempInicialObjeto, setTempInicialObjeto] = useState<string>("0");
        const [incertezaTermometro, setIncertezaTermometro] = useState<string>("0.5");
        const [capacidadeTermicaCalorimetro, setCapacidadeTermicaCalorimetro] = useState<string>("15.07617907");
        const [incertezaCapacidadeTermicaCalorimetro, setIncertezaCapacidadeTermicaCalorimetro] = useState<string>("4.096795514");
        const [errors, setErrors] = useState<any>({});
        const [submitEnabled, setSubmitEnabled] = useState<boolean>(!isReady);

        const intervalRef = useRef<NodeJS.Timeout | null>(null);
        const isTemperatureRightRef = useRef(isTemperatureRight);
        const temperaturaFinalRef = useRef(temperaturaFinal);

        // useEffect(() => {
        //     handleIncertezaCapacidadeTermicaCalorimetro(Number(incertezaCapacidadeTermicaCalorimetro));
        //     handleCapacidadeTermicaCalorimetro(Number(capacidadeTermicaCalorimetro));
        //     handleTempInicialObjeto(Number(tempInicialObjeto));
        //     handleMassaObjeto(Number(massaObjeto));
        //     handleMassaAgua(Number(massaAgua));
        // }, [isReady]);

        useEffect(() => {
            isTemperatureRightRef.current = isTemperatureRight;
            temperaturaFinalRef.current = temperaturaFinal;

            if (isTemperatureRight && isFormSubmmited ) {
                if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                }
                setIsReady(true);
            }
          }, [isTemperatureRight, temperaturaFinal]);
          
          useEffect(() => {
            return () => {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            };
          }, []);

        // const { isTemperatureRight, temperaturaFinal, buscaTemperatura } = TemperaturaEquilibrioRealtime();

        const handleSubmit = () => {
            setSubmitEnabled(false);
            setIsFormSubmmited(true);
            setCapacidadeTermicaCalorimetro(capacidadeTermicaCalorimetro);

            const newErrors: { [key: string]: string } = {};
            
            if (Number(massaAgua) <= 0) {
                newErrors["massaAgua"] = "A massa da água deve ser maior que 0";
            }

            if (Number(massaObjeto) <= 0) {
                newErrors["massaObjeto"] = "A massa do objeto deve ser maior que 0 g";
            }

            if (Number(incertezaBalanca) <= 0) {
                newErrors["incertezaBalanca"] = "A incerteza da balança deve ser maior que 0 g";
            }

            if (Number(tempInicialObjeto) <= 0) {
                newErrors["tempInicialObjeto"] = "A temperatura inicial do objeto deve ser maior que 0 °C";
            }

            if(Number(incertezaTermometro) <= 0){
                newErrors["incertezaTermometro"] = "A incerteza do termômetro deve ser maior que 0 °C";
            }

            if (Number(capacidadeTermicaCalorimetro) <= 0) {
                newErrors["capacidadeTermicaCalorimetro"] = "A capacidade térmica do calorímetro deve ser maior que 0 g/°C";
            }

            if (Number(incertezaCapacidadeTermicaCalorimetro) <= 0) {
                newErrors["incertezaCapacidadeTermicaCalorimetro"] = "A incerteza da capacidade térmica do calorímetro deve ser maior que 0 g/°C";
            }
        
            setErrors(newErrors);

            if (Object.keys(newErrors).length === 0) {
                setIsTemperatureRight(false);
                console.log("Formulário preenchido corretamente");
                console.log("Massa da água: ", massaAgua);
                console.log("Massa do objeto: ", massaObjeto);
                console.log("Temperatura inicial do objeto: ", tempInicialObjeto);
                console.log("Capacidade térmica do calorímetro: ", capacidadeTermicaCalorimetro);
                console.log("Incerteza da capacidade térmica do calorímetro: ", incertezaCapacidadeTermicaCalorimetro);

                // Lógica para aguardar a temperatura 
                triggerTemperatureCheck();
            } else{
                setSubmitEnabled(true);
            }
        };

        const triggerTemperatureCheck = () => {
            intervalRef.current = setInterval(() => {
              buscaTemperatura().then((r) => {
                    if (r) {
                        handleIncertezaCapacidadeTermicaCalorimetro(Number(incertezaCapacidadeTermicaCalorimetro));
                        handleCapacidadeTermicaCalorimetro(Number(capacidadeTermicaCalorimetro));
                        handleTempInicialObjeto(Number(tempInicialObjeto));
                        handleMassaObjeto(Number(massaObjeto));
                        handleMassaAgua(Number(massaAgua));
                        console.log("Temperature is correct: ", temperaturaFinal);
                        setIsReady(true);
                    } else {
                        setIsReady(false);
                        console.log("Temperature is not correct yet: ", temperaturaFinal);
                    }
                });
            }, 30000);
          };

        const replaceDotWithComma = (str: string) => {
            return str.replace(/\./g, ',');
        }

        const replaceCommaWithDot = (str: string) => {
            return str.replace(/,/g, '.');
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setValue: React.Dispatch<React.SetStateAction<string>>) => {
            const re = /^-?[0-9]*([,][0-9]*)?$/;

            if (e.target.value === '') {
                setValue("0");
            } 
            if(re.test(e.target.value)) {
                setValue(replaceCommaWithDot(e.target.value))
            }
        }

        return (
        <InputsContainer>
            <h2> Insira os Valores Constantes do Experimento: </h2>
            <h4> Massas </h4>
            <TextField
            error={errors["massaAgua"] ? true : false}
            helperText={errors["massaAgua"]}
            label="Massa de Água (g)"
            type="text"
            variant="outlined"
            margin="normal"
            onChange={(e) => handleChange(e, setMassaAgua)}
            value={replaceDotWithComma(massaAgua.toString())}
            />
            <TextField
            error={errors["massaObjeto"] ? true : false}
            helperText={errors["massaObjeto"]}
            label="Massa do Objeto Submerso (g)"
            type="text"
            variant="outlined"
            margin="normal"
            onChange={(e) => handleChange(e, setMassaObjeto)}
            value={replaceDotWithComma(massaObjeto.toString())}
            />
            <TextField
            label="Incerteza da Balança (g)"
            error={errors["incertezaBalanca"] ? true : false}
            helperText={errors["incertezaBalanca"]}
            type="text"
            variant="outlined"
            margin="normal"
            onChange={(e) => handleChange(e, setIncertezaBalanca)}
            value={replaceDotWithComma(incertezaBalanca.toString())}
            />
            <h4> Temperatura </h4>
            <TextField
            label="Temperatura Inicial do Objeto (°C)"
            error={errors["tempInicialObjeto"] ? true : false}
            helperText={errors["tempInicialObjeto"]}
            type="text"
            variant="outlined"
            margin="normal"
            onChange={(e) => handleChange(e, setTempInicialObjeto)}
            value={replaceDotWithComma(tempInicialObjeto.toString())}
            />
            <TextField
            label="Incerteza do Termômetro (°C)"
            error={errors["incertezaTermometro"] ? true : false}
            helperText={errors["incertezaTermometro"]}
            type="text"
            variant="outlined"
            margin="normal"
            onChange={(e) => handleChange(e, setIncertezaTermometro)}
            value={replaceDotWithComma(incertezaTermometro.toString())}
            />
            <h4> Capacidade Térmica do Calorímetro - Padrão Utilizado: 15,1 ± 4,1 g/°C </h4>
            <TextField
            label="Capacidade Térmica do Calorímetro (g/°C)"
            error={errors["capacidadeTermicaCalorimetro"] ? true : false}
            helperText={errors["capacidadeTermicaCalorimetro"]}
            type="text"
            variant="outlined"
            margin="normal"
            onChange={(e) => handleChange(e, setCapacidadeTermicaCalorimetro)}            
            value={replaceDotWithComma(capacidadeTermicaCalorimetro.toString())}
            />
            <TextField
            label="Incerteza da Capacidade Térmica do Calorímetro (g/°C)"
            error={errors["incertezaCapacidadeTermicaCalorimetro"] ? true : false}
            helperText={errors["incertezaCapacidadeTermicaCalorimetro"]}
            type="text"
            variant="outlined"
            margin="normal"
            onChange={(e) => handleChange(e, setIncertezaCapacidadeTermicaCalorimetro)}            
            value={replaceDotWithComma(incertezaCapacidadeTermicaCalorimetro.toString())}
            />
            <Button
            variant="contained"
            color="success"
            onClick={() => handleSubmit()}
            disabled={!submitEnabled}
            >
            Confirmar
            </Button>
        </InputsContainer>
        );
      };