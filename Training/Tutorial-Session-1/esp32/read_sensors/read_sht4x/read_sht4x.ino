#include "Adafruit_SHT4x.h"

Adafruit_SHT4x sht4 = Adafruit_SHT4x();

void setup() {
  Serial.begin(115200);
  Wire.begin(41, 40);
  while (!Serial)
    delay(10);     // will pause Zero, Leonardo, etc until serial console opens

  Serial.println("Adafruit SHT4x test");
  if (! sht4.begin()) {
    Serial.println("Couldn't find SHT4x");
    while (1) delay(1);
  }
  Serial.println("Found SHT4x sensor");
  Serial.print("Serial number 0x");
  Serial.println(sht4.readSerial(), HEX);

  // You can have 3 different precisions, higher precision takes longer
  sht4.setPrecision(SHT4X_HIGH_PRECISION);

  // You can have 6 different heater settings
  // higher heat and longer times uses more power
  // and reads will take longer too!
  sht4.setHeater(SHT4X_NO_HEATER);
  
}

void loop() {
  sensors_event_t humidity, temp;
  sht4.getEvent(&humidity, &temp);// populate temp and humidity objects with fresh data
  float temperature = temp.temperature;
  float rel_humidity = humidity.relative_humidity;

  Serial.print("\t\tTemperature: "); 
  Serial.print(temperature); 
  Serial.println(" degrees C");
  
  Serial.print("\t\tHumidity: "); 
  Serial.print(rel_humidity); 
  Serial.println("% rH");

  delay(100);

  // //   serial plotter friendly format
  // Serial.print(temperature);
  // Serial.print(",");

  // Serial.print(rel_humidity);

  // Serial.println();
  // delay(100);
  
}