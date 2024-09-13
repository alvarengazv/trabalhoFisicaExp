import { get, ref } from 'firebase/database';
import { useState } from 'react';
import { StartFireBase } from '../../authFirebase';

export const TemperaturaEquilibrioRealtime = () => {
    let [temperaturaFinal, setTemperatura] = useState<number>(-1000);
    let [isTemperatureRight, setIsTemperatureRight] = useState<boolean>(false);
    const db = StartFireBase();

    const buscaTemperatura = () => {
        return new Promise<{ success: boolean, temperature: number }>((resolve, reject) => {
            let fetchedTemperature = 0;
            const dbRef = ref(db, "temperatura");
            get(dbRef).then((snapshot) => {
                if (snapshot.exists()) {
                    fetchedTemperature = snapshot.val();
                    let success = false;
                    
                    setTemperatura((prevTemperaturaFinal) => {                        
                        success = checkTemperature(fetchedTemperature, prevTemperaturaFinal);
                        setIsTemperatureRight(success);                        
    
                        return fetchedTemperature;
                    });
    
                    resolve({ success: success, temperature: fetchedTemperature });
                }
            }).catch((error) => {
                console.error("Error fetching temperature from Firebase: ", error);
                reject(error);
            });
        });
    }

    const checkTemperature = (fetchedTemperature: number, prevTemperaturaFinal: number): boolean => {
        return Math.abs(fetchedTemperature - prevTemperaturaFinal) <= 0.0625;
    };

    return {
        temperaturaFinal,
        isTemperatureRight,
        buscaTemperatura,
        setIsTemperatureRight,
        setTemperatura,
    };
};