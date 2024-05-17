int  freq = 10000;   
int  resolution = 8;                                                                      
int  dutyCycle = 128; 
int ledPin1 = 18;
int ledPin2 = 19;
int ledChannel = 0;
int led = 2;
bool ledStatus = false;

 
void ledcInit(){
  ledcSetup(ledChannel, freq, resolution);
  ledcAttachPin(ledPin1, ledChannel);
  ledcAttachPin(ledPin2, ledChannel);
  ledcWrite(ledChannel, dutyCycle);
  digitalWrite(led, ledStatus);
  delay(100);
  digitalWrite(led, !ledStatus);
  delay(100);
  digitalWrite(led, ledStatus);
}

void setup(){
  Serial.begin(115200);
  pinMode(led, OUTPUT);
  digitalWrite(led, HIGH);
  delay(100);
  digitalWrite(led, LOW);
  Serial.println("Ready ...");
}


void loop() {
  if (Serial.available() > 0) {
    String message = Serial.readStringUntil('\n');
    if (message.startsWith("freq:")) {
      freq = message.substring(5).toInt();
      digitalWrite(led, !ledStatus);
      delay(100);
      digitalWrite(led, ledStatus);
      Serial.println("Frequency changed: " + String(freq));
    }
    if (message.startsWith("duty:")) {
      dutyCycle = message.substring(5).toInt();
      digitalWrite(led, !ledStatus);
      delay(100);
      digitalWrite(led, ledStatus);
      Serial.println("Duty Cycle changed: " + String(dutyCycle));
    }
     if (message.startsWith("reso:")) {
      resolution = message.substring(5).toInt();
      digitalWrite(led, !ledStatus);
      delay(100);
      digitalWrite(led, ledStatus);
      Serial.println("Resolution changed: " + String(resolution));
    }
    if (message.startsWith("pin1:")) {
      ledcDetachPin(ledPin1);
      ledPin1 = message.substring(5).toInt();
      digitalWrite(led, !ledStatus);
      delay(100);
      digitalWrite(led, ledStatus);
      Serial.println("Led Pin 1: " + String(ledPin1) );
    }
    if (message.startsWith("pin2:")) {
      ledcDetachPin(ledPin2);
      ledPin2 = message.substring(5).toInt();
      digitalWrite(led, !ledStatus);
      delay(100);
      digitalWrite(led, ledStatus);
      Serial.println("Led Pin 2: " + String(ledPin2) );
    } 
    if (message.startsWith("stop")) {
      ledcDetachPin(ledPin1);
      ledcDetachPin(ledPin2);
      Serial.println("Led Pin 1 and Pin 2 detached" );
      digitalWrite(led, !ledStatus);
      delay(100);
      digitalWrite(led, ledStatus);
      ledStatus = false;
      digitalWrite(led, ledStatus);

    }   
    if (message.startsWith("start")) {
      ledcInit();
      Serial.println("Led Pin 1 and Pin 2 atached" );
      digitalWrite(led, !ledStatus);
      delay(100);
      digitalWrite(led, ledStatus);
      ledStatus = true;
      digitalWrite(led, ledStatus);
    }  
  }
}
