import { get, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { StartFireBase } from '../../authFirebase';

export const TemperaturaEquilibrioRealtime = () => {
    let [temperaturaFinal, setTemperatura] = useState<number>(-1000);
    let [isTemperatureRight, setIsTemperatureRight] = useState<boolean>(false);
    const db = StartFireBase();

    useEffect(() => {
        if (temperaturaFinal !== null && temperaturaFinal !== -1000) { 
            console.log("Updated temperaturaFinal: ", temperaturaFinal);
            
            // Now perform the check here
            // if (checkTemperature(temperaturaFinal)) {
            //     setIsTemperatureRight(true);
            // } else {
            //     setIsTemperatureRight(false);
            // }
        }
    }, [temperaturaFinal]);

    // function to do the same as above

    const buscaTemperatura = () => {
        return new Promise<boolean>((resolve, reject) => {
            let fetchedTemperature = 0;
            const dbRef = ref(db, "temperatura");
            get(dbRef).then((snapshot) => {
                if (snapshot.exists()) {
                    var r = false
                    fetchedTemperature = snapshot.val();
                    console.log("Fetched temperature: ", fetchedTemperature);
                    console.log("temperaturaFinal: ", temperaturaFinal);

                    if (checkTemperature(fetchedTemperature)) {
                        setIsTemperatureRight(true);
                        r = true;
                    } else {
                        setIsTemperatureRight(false);
                    }

                    setTemperatura(fetchedTemperature);
                    resolve(r);
                }
            }).catch((error) => {
                console.error("Error fetching temperature from Firebase: ", error);
                reject(error);
            });
        });
    }

    const checkTemperature = (fetchedTemperature: number): boolean => {
        console.log("Checking temperature: ", fetchedTemperature, temperaturaFinal);
        return Math.abs(fetchedTemperature - temperaturaFinal) < 0.1;
    };

    return {
        temperaturaFinal,
        isTemperatureRight,
        buscaTemperatura,
        setIsTemperatureRight
    };
};