#include <Arduino.h>
#include <DallasTemperature.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <OneWire.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID ""      // Adicionar o nome da rede
#define WIFI_PASSWORD ""  // Adicionar a senha da rede

// Insert Firebase project API Key
#define API_KEY "AIzaSyA2mTxwMKCvXAsxaHDawDhlf-_4oFBPdZs"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "fisica-calor-especifico-2024-default-rtdb.asia-southeast1.firebasedatabase.app"

// Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
int count = 0;
bool signupOK = false;  // since we are doing an anonymous sign in

OneWire barramento(D4);
DallasTemperature sensors(&barramento);

void setup() {
    Serial.begin(115200);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    Serial.println();

    /* Assign the api key (required) */
    config.api_key = API_KEY;

    /* Assign the RTDB URL (required) */
    config.database_url = DATABASE_URL;

    /* Sign up */
    if (Firebase.signUp(&config, &auth, "", "")) {
        Serial.println("ok");
        signupOK = true;
    } else {
        Serial.printf("%s\n", config.signer.signupError.message.c_str());
    }

    /* Assign the callback function for the long running token generation task */
    config.token_status_callback = tokenStatusCallback;  // see addons/TokenHelper.h

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Inicializa o sensor DS18B20
    sensors.begin();
}

void loop() {
    if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 1000 || sendDataPrevMillis == 0)) {
        sendDataPrevMillis = millis();

        sensors.requestTemperatures();                   // Solicita a leitura do sensor
        float temperature = sensors.getTempCByIndex(0);  // Lê a temperatura
        // Write an Int number on the database path test/int
        if (Firebase.RTDB.setFloat(&fbdo, "temperatura", temperature)) {
            Serial.println("PASSED");
            Serial.println("PATH: " + fbdo.dataPath());
            Serial.println("TYPE: " + fbdo.dataType());
            Serial.println(temperature);  // Imprime a temperatura no monitor serial
        } else {
            Serial.println("FAILED");
            Serial.println("REASON: " + fbdo.errorReason());
        }
    }

    delay(500);  // Aguarda 1 segundo antes de ler novamente
}