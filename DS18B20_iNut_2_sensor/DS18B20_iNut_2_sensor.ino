#include <avr/wdt.h>
#include <EEPROM.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <iNut.h>
#include <DFR_LCD_Keypad.h>

// Include the library code:
#include <LiquidCrystal.h>



#define ON  LOW
#define OFF HIGH


// Data wire is plugged into port 2 on the Arduino
#define ONE_WIRE_BUS A1
#define TEMPERATURE_PRECISION 9

const int relayPin1 = 2;
const int relayPin2 = 3;


// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);

// arrays to hold device addresses
DeviceAddress insideThermometer, outsideThermometer;

iNut sensor;


// Initialize the library with the numbers of the interface pins
LiquidCrystal lcd(8, 9, 4, 5, 6, 7);

DFR_LCD_Keypad keypad(A0, &lcd);
#define LOW_THRESHOLD_ADDRESS   0
#define HIGH_THRESHOLD_ADDRESS  1
#define TEMP_THRESHOLD
int low_threshold = 0;
int high_threshold = 0;

// Define constants for reading buttons on analog input
const int BTN_NONE = 1023;
const int BTN_SELECT = 723;
const int BTN_LEFT = 481;
const int BTN_DOWN = 308;
const int BTN_UP = 132;
const int BTN_RIGHT = 0;

#define resetFunc()        \
do                          \
{                           \
    wdt_enable(WDTO_15MS);  \
    for(;;)                 \
    {                       \
    }                       \
} while(0)

void setup() {
  // at the very begining time
  wdt_disable();

  wdt_enable(WDTO_8S); // boot process must complete with in 8 seconds!
  

  sensors.begin();

  // Set up the LCD's number of columns and rows:
  lcd.begin(16, 2);
  Serial.begin(115200);
  Serial.println("let start");

  
  sensor.setup(2); //Sẽ có 08 luồn cảm biến
  lcd.clear();
  lcd.print(F("Do an mon hoc"));
  lcd.setCursor(0, 1);
  lcd.print(F("IUH - DHCN"));
  pinMode(relayPin1, OUTPUT);
  pinMode(relayPin2, OUTPUT);
  digitalWrite(relayPin1, OFF);
  digitalWrite(relayPin2, OFF);

  sensors.begin();

  // locate devices on the bus
  Serial.print("Locating devices...");
  Serial.print("Found ");
  Serial.print(sensors.getDeviceCount(), DEC);
  Serial.println(" devices.");

  // report parasite power requirements
  Serial.print("Parasite power is: "); 
  if (sensors.isParasitePowerMode()) Serial.println("ON");
  else Serial.println("OFF");

  if (!sensors.getAddress(insideThermometer, 0)) Serial.println("Unable to find address for Device 0"); 
  if (!sensors.getAddress(outsideThermometer, 1)) Serial.println("Unable to find address for Device 1"); 

  delay(1000);

  

  EEPROM.begin();

  low_threshold = EEPROM.read(LOW_THRESHOLD_ADDRESS); 
  if (low_threshold < 40)
    low_threshold = 40;
  high_threshold = EEPROM.read(HIGH_THRESHOLD_ADDRESS); 
  if (high_threshold > 95)
    high_threshold = 95;
  
  wdt_reset();
  wdt_enable(WDTO_4S);


  
}

// function to print a device address
void printAddress(DeviceAddress deviceAddress)
{
  for (uint8_t i = 0; i < 8; i++)
  {
    // zero pad the address if necessary
    if (deviceAddress[i] < 16) Serial.print("0");
    Serial.print(deviceAddress[i], HEX);
  }
}
// function to print the temperature for a device
float printTemperature(DeviceAddress deviceAddress)
{
  float tempC = sensors.getTempC(deviceAddress);
  Serial.print("Temp C: ");
  Serial.print(tempC);
  Serial.print(" Temp F: ");
  Serial.print(DallasTemperature::toFahrenheit(tempC));
  return tempC;
}


// function to print a device's resolution
void printResolution(DeviceAddress deviceAddress)
{
  Serial.print("Resolution: ");
  Serial.print(sensors.getResolution(deviceAddress));
  Serial.println();    
}

// main function to print information about a device
void printData(DeviceAddress deviceAddress)
{
  Serial.print("Device Address: ");
  printAddress(deviceAddress);
  Serial.print(" ");
  printTemperature(deviceAddress);
  Serial.println();
}

void readDS() {
  sensors.requestTemperatures();
  float t1 = printTemperature(insideThermometer);
  float t2 = printTemperature(outsideThermometer);
  sensor.setValue(0, t1);
  sensor.setValue(1, t2);
  printData(insideThermometer);
  printData(outsideThermometer);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Nhiet do 1: ");
  lcd.print(t1);
  lcd.setCursor(0, 1);
  lcd.print("Nhiet do 2: ");
  lcd.print(t2);
    

#ifdef TEMP_THRESHOLD
  if (t1 > high_threshold) {
    digitalWrite(relayPin1, ON);
    Serial.println("Relay 1 ON");
  } else if (t1 < low_threshold) {
    digitalWrite(relayPin2, ON);
    digitalWrite(relayPin1, ON);
    Serial.println("Relay1, 2 ON");
  } else {
    digitalWrite(relayPin1, OFF);
    digitalWrite(relayPin2, OFF);
    Serial.println("Relay1, 2 OFF");
  }
#endif
}

void loop() {
  // put your main code here, to run repeatedly:
  static unsigned long timerWatchDog = 0UL;
  if (millis() - timerWatchDog > 900UL) {
    wdt_reset();
    timerWatchDog = millis();
  }

  static unsigned long timer = 0UL;
  if (millis() - timer > 2500UL) {
    readDS();
    timer = millis();
  }
  static int last_key, key;
  last_key = keypad.get_last_key();
  key      = keypad.read_key();
  
  // only clear and update the LCD if they key state has changed
  if (key != last_key) {
    // key has changed
    
    lcd.clear();
    lcd.setCursor(0,0);
    
    // print the key selection to the LCD
    switch (key) {
      case KEY_RIGHT:
        Serial.println("RIGHT");
        low_threshold++;
        lcd.print("Nguong thap: ");
        lcd.setCursor(0, 1);
        lcd.print(low_threshold);
        EEPROM.write(LOW_THRESHOLD_ADDRESS, low_threshold);
        break;
        
      case KEY_UP:
        Serial.println("UP");
        high_threshold++;
        lcd.print("Nguong cao: ");
        lcd.setCursor(0, 1);
        lcd.print(high_threshold);
        EEPROM.write(HIGH_THRESHOLD_ADDRESS, high_threshold);
        break;
        
      case KEY_DOWN:
        Serial.println("DOWN");
        high_threshold--;
        lcd.print("Nguong cao: ");
        lcd.setCursor(0, 1);
        lcd.print(high_threshold);
        EEPROM.write(HIGH_THRESHOLD_ADDRESS, high_threshold);
        break;
        
      case KEY_LEFT:
        Serial.println("LEFT");
        low_threshold--;
        lcd.print("Nguong thap: ");
        lcd.setCursor(0, 1);
        lcd.print(low_threshold);
        EEPROM.write(LOW_THRESHOLD_ADDRESS, low_threshold);
        break;

      case KEY_SELECT:
        Serial.println("SELECT");
        break;
        
      case KEY_NONE:
      default:
        //Serial.println("NONE");
        break;
    }
  }
  

  sensor.loop();
 
  
}
