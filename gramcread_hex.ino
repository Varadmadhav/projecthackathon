#define BLYNK_TEMPLATE_ID "TMPL3UUXw9cZ6"
#define BLYNK_TEMPLATE_NAME "GramCread"
#define BLYNK_AUTH_TOKEN "LvEidE9NNfWenio4fmb2GufIjCQMxT_G"

#define BLYNK_PRINT Serial

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "Prathamesh";
char pass[] = "12345678900";

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define SOIL_PIN 34 
#define LDR_PIN 35  
#define ONE_WIRE_BUS 5
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

BlynkTimer timer;

void sendSensor() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int soil = map(analogRead(SOIL_PIN), 0, 4095, 0, 100);
  int light = map(analogRead(LDR_PIN), 0, 4095, 0, 100);

  sensors.requestTemperatures();
  float soilTemp = sensors.getTempCByIndex(0);  

  if (isnan(t) || isnan(h)) {
    Serial.println("DHT22 Failed");
    return;
  }

  Serial.print("Temp: "); Serial.print(t);
  Serial.print(" | Hum: "); Serial.print(h);
  Serial.print(" | Soil Moisture: "); Serial.print(soil);
  Serial.print(" | Light: "); Serial.print(light);
  Serial.print(" | Soil Temp: "); Serial.println(soilTemp);

  Blynk.virtualWrite(V0, (double)t);        // DHT Temp
  Blynk.virtualWrite(V1, (double)h);        // DHT Humidity
  Blynk.virtualWrite(V2, soil);             // Soil moisture
  Blynk.virtualWrite(V3, light);            // LDR
  Blynk.virtualWrite(V4, (double)soilTemp); // DS18B20
}

void setup() {
  Serial.begin(115200);
  Blynk.begin(auth, ssid, pass);
  dht.begin();
  sensors.begin();

  timer.setInterval(2000L, sendSensor);
}

void loop() {
  Blynk.run();
  timer.run();
}
