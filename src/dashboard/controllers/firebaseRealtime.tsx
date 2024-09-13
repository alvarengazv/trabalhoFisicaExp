import { ref, onValue, set } from "firebase/database";
import { StartFireBase } from "../../authFirebase";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { TemperaturaEquilibrioRealtime } from "./temperaturaEquilibrioRealtime";
import { toast } from "react-toastify";

export const controllerResultados = () => {
  const db = StartFireBase();

  const [massaAgua, handleMassaAgua] = useState<number>(0);
  const [massaObjeto, handleMassaObjeto] = useState<number>(0);
  const [tempInicialAgua, handleTempAmbiente] = useState<number>(0);
  const [tempInicialObjeto, handleTempInicialObjeto] = useState<number>(0);
  const [capacidadeTermicaCalorimetro, handleCapacidadeTermicaCalorimetro] = useState<number>(15.07617);
  const [incertezaCapacidadeTermicaCalorimetro, handleIncertezaCapacidadeTermicaCalorimetro] = useState<number>(4.0967);
  const [calorEspecificoMaterial, setCalorEspecificoMaterial] = useState<string>("0");
  const [incertezaCalorEspecificoMaterial, setIncertezaCalorEspecificoMaterial] = useState<string>("0");
  const [calorEspecificoMaterialNumber, setCalorEspecificoMaterialNumber] = useState<number>(0);
  const [incertezaCalorEspecificoMaterialNumber, setIncertezaCalorEspecificoMaterialNumber] = useState<number>(0);
  const [provavelMaterial, setProvavelMaterial] = useState<string>("");
  const [diferencaPercentualProvavel, setDiferencaPercentual] = useState<number>(0);
  const [diferencaPercentualMedia, setDiferencaPercentualMedia] = useState<number>(0);
  const incertezaBalanca = 0.001
  const incertezaTermometro = 0.5
  const calorEspecificoAgua = 1
  const calorEspecificoAluminio = 0.214
  const calorEspecificoCobre = 0.092
  const calorEspecificoFerro = 0.107
  const calorEspecificoPrata = 0.0561
  const calorEspecificoOuro = 0.0308
  const calorEspecificoMadeira = 0.442
  const calorEspecificoBronze = 0.0884

  let latestTemperature: number = 0;

  const {
    isTemperatureRight,
  } = TemperaturaEquilibrioRealtime();


  const realTimeTemperature = () => {
    const dbRef = ref(db, "temperatura");

    onValue(dbRef, (snapshot) => {
      const result = snapshot.val();
      if (result) {
        latestTemperature = result;
      }
    });

    return latestTemperature;
  };

  const calculaCalorEspecifico = (temperaturaFinalExp: number) => {
    if(massaAgua !== 0 && massaObjeto !== 0 && tempInicialAgua !== 0 && tempInicialObjeto !== 0){
      const DeltaTempAgua = temperaturaFinalExp - tempInicialAgua;
      const DeltaTempObjeto = temperaturaFinalExp - tempInicialObjeto;

      if(DeltaTempAgua === 0 || DeltaTempObjeto === 0){
        return 0
      }

      let parcelaMassaAgua = (calorEspecificoAgua * ((DeltaTempAgua) / (massaObjeto * DeltaTempObjeto)))
      parcelaMassaAgua *= parcelaMassaAgua
      parcelaMassaAgua *= incertezaBalanca * incertezaBalanca

      let parcelaMassaObjeto = (- ( ((calorEspecificoAgua * massaAgua)*DeltaTempAgua) + (capacidadeTermicaCalorimetro * DeltaTempAgua) ) / ((massaObjeto * massaObjeto) * DeltaTempObjeto) )
      parcelaMassaObjeto *= parcelaMassaObjeto
      parcelaMassaObjeto *= incertezaBalanca * incertezaBalanca

      let parcelaTempFinal = ( ( ((calorEspecificoAgua * massaAgua) * (tempInicialAgua - tempInicialObjeto)) + ((capacidadeTermicaCalorimetro) * (tempInicialAgua - tempInicialObjeto)) ) / ((massaObjeto) * (DeltaTempObjeto * DeltaTempObjeto)) )
      parcelaTempFinal *= parcelaTempFinal
      parcelaTempFinal *= incertezaTermometro * incertezaTermometro

      let parcelaTempInicialAgua = (- ((calorEspecificoAgua * massaAgua) + capacidadeTermicaCalorimetro) / (massaObjeto * DeltaTempObjeto) )
      parcelaTempInicialAgua *= parcelaTempInicialAgua
      parcelaTempInicialAgua *= incertezaTermometro * incertezaTermometro

      let parcelaTempInicialObjeto = ( ( ((calorEspecificoAgua * massaAgua) * DeltaTempAgua) + (capacidadeTermicaCalorimetro * DeltaTempAgua) ) / ( (massaObjeto) * (DeltaTempObjeto * DeltaTempObjeto) ))
      parcelaTempInicialObjeto *= parcelaTempInicialObjeto
      parcelaTempInicialObjeto *= incertezaTermometro * incertezaTermometro

      let parcelaCapacidadeTermicaCalorimetro = ( DeltaTempAgua / (massaObjeto * DeltaTempObjeto) )
      parcelaCapacidadeTermicaCalorimetro *= parcelaCapacidadeTermicaCalorimetro
      parcelaCapacidadeTermicaCalorimetro *= incertezaCapacidadeTermicaCalorimetro * incertezaCapacidadeTermicaCalorimetro

      const somaAbsoluta = Math.abs(parcelaMassaAgua) + Math.abs(parcelaMassaObjeto) + Math.abs(parcelaTempFinal) + Math.abs(parcelaTempInicialAgua) + Math.abs(parcelaTempInicialObjeto) + Math.abs(parcelaCapacidadeTermicaCalorimetro)
      const incertezaCalorEspecificoMaterialCalc = Math.sqrt(somaAbsoluta)
    
      const stringCorreta = incertezaCalorEspecificoMaterialCalc.toPrecision(2).toString()

      setIncertezaCalorEspecificoMaterial(stringCorreta)
      setIncertezaCalorEspecificoMaterialNumber(incertezaCalorEspecificoMaterialCalc)

      const calorEspecificoMaterialCalc = Math.abs(- ( (massaAgua * calorEspecificoAgua * DeltaTempAgua) + (capacidadeTermicaCalorimetro * DeltaTempAgua) ) / (massaObjeto  * DeltaTempObjeto) )
      
      const digits = stringCorreta.split(".")[1]?.length || 2;
      setCalorEspecificoMaterial(calorEspecificoMaterialCalc.toFixed(digits).replace(".", ","));
      setCalorEspecificoMaterialNumber(calorEspecificoMaterialCalc);
      setIncertezaCalorEspecificoMaterial(stringCorreta.replace(".", ","));
    } else {
      setCalorEspecificoMaterial("0")
    }

    const diferencaPercentualAluminio = Math.abs((calorEspecificoMaterialNumber - calorEspecificoAluminio) / calorEspecificoAluminio)
    const diferencaPercentualCobre = Math.abs((calorEspecificoMaterialNumber - calorEspecificoCobre) / calorEspecificoCobre)
    const diferencaPercentualFerro = Math.abs((calorEspecificoMaterialNumber - calorEspecificoFerro) / calorEspecificoFerro)
    const diferencaPercentualPrata = Math.abs((calorEspecificoMaterialNumber - calorEspecificoPrata) / calorEspecificoPrata)
    const diferencaPercentualOuro = Math.abs((calorEspecificoMaterialNumber - calorEspecificoOuro) / calorEspecificoOuro)
    const diferencaPercentualMadeira = Math.abs((calorEspecificoMaterialNumber - calorEspecificoMadeira) / calorEspecificoMadeira)
    const diferencaPercentualBronze = Math.abs((calorEspecificoMaterialNumber - calorEspecificoBronze) / calorEspecificoBronze)

    const diferencaPercentual = [diferencaPercentualAluminio, diferencaPercentualCobre, diferencaPercentualFerro, diferencaPercentualPrata, diferencaPercentualOuro, diferencaPercentualMadeira, diferencaPercentualBronze]
    const materiais = ["Alumínio", "Cobre", "Ferro", "Prata", "Ouro", "Madeira", "Bronze"]

    const calorEspecificoMaterialSomado = calorEspecificoMaterialNumber + incertezaCalorEspecificoMaterialNumber
    const calorEspecificoMaterialSubtraido = calorEspecificoMaterialNumber - incertezaCalorEspecificoMaterialNumber

    const diferencaPercentualSomadoPercentual = [
      Math.abs((calorEspecificoMaterialSomado - calorEspecificoAluminio) / calorEspecificoAluminio), 
      Math.abs((calorEspecificoMaterialSomado - calorEspecificoCobre) / calorEspecificoCobre), 
      Math.abs((calorEspecificoMaterialSomado - calorEspecificoFerro) / calorEspecificoFerro), 
      Math.abs((calorEspecificoMaterialSomado - calorEspecificoPrata) / calorEspecificoPrata), 
      Math.abs((calorEspecificoMaterialSomado - calorEspecificoOuro) / calorEspecificoOuro),
      Math.abs((calorEspecificoMaterialSomado - calorEspecificoMadeira) / calorEspecificoMadeira),
      Math.abs((calorEspecificoMaterialSomado - calorEspecificoBronze) / calorEspecificoBronze)
    ]

    const diferencaPercentualSubtraidoPercentual = [
      Math.abs((calorEspecificoMaterialSubtraido - calorEspecificoAluminio) / calorEspecificoAluminio), 
      Math.abs((calorEspecificoMaterialSubtraido - calorEspecificoCobre) / calorEspecificoCobre), 
      Math.abs((calorEspecificoMaterialSubtraido - calorEspecificoFerro) / calorEspecificoFerro), 
      Math.abs((calorEspecificoMaterialSubtraido - calorEspecificoPrata) / calorEspecificoPrata), 
      Math.abs((calorEspecificoMaterialSubtraido - calorEspecificoOuro) / calorEspecificoOuro),
      Math.abs((calorEspecificoMaterialSubtraido - calorEspecificoMadeira) / calorEspecificoMadeira),
      Math.abs((calorEspecificoMaterialSubtraido - calorEspecificoBronze) / calorEspecificoBronze)
    ]

    const diferencasAluminio = [diferencaPercentualAluminio, diferencaPercentualSomadoPercentual[0], diferencaPercentualSubtraidoPercentual[0]]
    const diferencasCobre = [diferencaPercentualCobre, diferencaPercentualSomadoPercentual[1], diferencaPercentualSubtraidoPercentual[1]]
    const diferencasFerro = [diferencaPercentualFerro, diferencaPercentualSomadoPercentual[2], diferencaPercentualSubtraidoPercentual[2]]
    const diferencasPrata = [diferencaPercentualPrata, diferencaPercentualSomadoPercentual[3], diferencaPercentualSubtraidoPercentual[3]]
    const diferencasOuro = [diferencaPercentualOuro, diferencaPercentualSomadoPercentual[4], diferencaPercentualSubtraidoPercentual[4]]
    const diferencasMadeira = [diferencaPercentualMadeira, diferencaPercentualSomadoPercentual[5], diferencaPercentualSubtraidoPercentual[5]]
    const diferencasBronze = [diferencaPercentualBronze, diferencaPercentualSomadoPercentual[6], diferencaPercentualSubtraidoPercentual[6]]

    const mediaDiferencaAluminio = diferencasAluminio.reduce((a, b) => a + b) / diferencasAluminio.length
    const mediaDiferencaCobre = diferencasCobre.reduce((a, b) => a + b) / diferencasCobre.length
    const mediaDiferencaFerro = diferencasFerro.reduce((a, b) => a + b) / diferencasFerro.length
    const mediaDiferencaPrata = diferencasPrata.reduce((a, b) => a + b) / diferencasPrata.length
    const mediaDiferencaOuro = diferencasOuro.reduce((a, b) => a + b) / diferencasOuro.length
    const mediaDiferencaMadeira = diferencasMadeira.reduce((a, b) => a + b) / diferencasMadeira.length
    const mediaDiferencaBronze = diferencasBronze.reduce((a, b) => a + b) / diferencasBronze.length

    const mediaDiferencas = [mediaDiferencaAluminio, mediaDiferencaCobre, mediaDiferencaFerro, mediaDiferencaPrata, mediaDiferencaOuro, mediaDiferencaMadeira, mediaDiferencaBronze]
    const indexMenorMediaDiferenca = mediaDiferencas.indexOf(Math.min(...mediaDiferencas))
    setProvavelMaterial(materiais[indexMenorMediaDiferenca])
    setDiferencaPercentual(diferencaPercentual[indexMenorMediaDiferenca])
    setDiferencaPercentualMedia(mediaDiferencas[indexMenorMediaDiferenca])

    toast.success(
      `
        Material mais provável: ${materiais[indexMenorMediaDiferenca]} \n
        Diferença percentual: ${Number(diferencaPercentual[indexMenorMediaDiferenca].toPrecision(2)) * 100}% \n
        Diferença percentual média: ${Number(mediaDiferencas[indexMenorMediaDiferenca].toPrecision(2)) * 100}%
      `
    )
  }

  return {
    handleMassaAgua,
    handleMassaObjeto,
    handleTempAmbiente,
    handleTempInicialObjeto,
    handleCapacidadeTermicaCalorimetro,
    handleIncertezaCapacidadeTermicaCalorimetro,
    calculaCalorEspecifico,
    isTemperatureRight,
    massaAgua,
    massaObjeto,
    tempInicialAgua,
    tempInicialObjeto,
    capacidadeTermicaCalorimetro,
    incertezaCapacidadeTermicaCalorimetro,
    realTimeTemperature,
    calorEspecificoMaterial,
    incertezaCalorEspecificoMaterial,
    calorEspecificoMaterialNumber,
    incertezaCalorEspecificoMaterialNumber,
    provavelMaterial,
    diferencaPercentualProvavel,
    diferencaPercentualMedia,
  };
};
