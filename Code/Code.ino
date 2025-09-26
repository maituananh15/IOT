#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>

// ================= WiFi =================
const char* ssid = "Neb Neee";         
const char* password = "012345678"; 

// ================= MQTT (Mosquitto local) =================
const char* mqtt_server = "192.168.231.228";  
const int mqtt_port = 1883;                


const char* mqtt_user = "admin123";        
const char* mqtt_pass = "12345678Az";      

WiFiClient espClient;
PubSubClient client(espClient);

// ================= DHT + IO =================
#define DHTPIN 25
#define DIEUHOA 4
#define QUAT 18
#define DEN 23
// #define Tivi 19
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

long lastMsg = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  dht.begin();

  pinMode(DIEUHOA, OUTPUT);
  pinMode(QUAT, OUTPUT);
  pinMode(DEN, OUTPUT);
  // pinMode(Tivi, OUTPUT);

  digitalWrite(DIEUHOA, HIGH);
  digitalWrite(QUAT, HIGH);
  digitalWrite(DEN, HIGH);
  // digitalWrite(Tivi, HIGH);

  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Đang kết nối WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.print("IP Address ESP32: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Đang kết nối MQTT... ");

    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {  
      Serial.println("thành công!");
      client.subscribe("esp32/dieuhoa");
      client.subscribe("esp32/quat");
      client.subscribe("esp32/den");
      // client.subscribe("esp32/tivi");
      client.subscribe("esp32/turnall");
    } else {
      Serial.print("Thất bại, rc=");
      Serial.print(client.state());
      Serial.println(" thử lại sau 5s...");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  if (String(topic) == "esp32/dieuhoa") {
    digitalWrite(DIEUHOA, (message == "ON") ? LOW : HIGH);
    client.publish("esp32/dieuhoaStatus", (message == "ON") ? "ON" : "OFF");
  }

  if (String(topic) == "esp32/quat") {
    digitalWrite(QUAT, (message == "ON") ? LOW : HIGH);
    client.publish("esp32/quatStatus", (message == "ON") ? "ON" : "OFF");
  }

  if (String(topic) == "esp32/den") {
    digitalWrite(DEN, (message == "ON") ? LOW : HIGH);
    client.publish("esp32/denStatus", (message == "ON") ? "ON" : "OFF");
  }

  // if (String(topic) == "esp32/tivi") {
  //   digitalWrite(Tivi, (message == "ON") ? LOW : HIGH);
  //   client.publish("esp32/tiviStatus", (message == "ON") ? "ON" : "OFF");
  // }

  if (String(topic) == "esp32/turnall") {
    if (message == "ON") {
      digitalWrite(DEN, LOW);
      digitalWrite(DIEUHOA, LOW);
      digitalWrite(QUAT, LOW);
      // digitalWrite(Tivi, LOW);
    } else {
      digitalWrite(DEN, HIGH);
      digitalWrite(DIEUHOA, HIGH);
      digitalWrite(QUAT, HIGH);
      // digitalWrite(Tivi, HIGH);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 2000) {
    lastMsg = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    float temF = dht.readTemperature(true);

    if (isnan(h) || isnan(t)) {
      Serial.println("Lỗi đọc DHT!");
      return;
    }

    int lightValue = analogRead(36);
    int lux = map(lightValue, 0, 4095, 1000, 0);  
    lux = lux / 2;

    String dataString = "Temperature: " + String(t) + " *C, " +
                        "Humidity: " + String(h) + " %, " +
                        "Light: " + String(lux) + " LUX.";

    client.publish("esp32/datasensor", dataString.c_str());
    Serial.println("Gửi dữ liệu: " + dataString);
  }
}
