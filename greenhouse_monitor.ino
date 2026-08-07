/*
 * GreenGo greenhouse monitor — ESP32 firmware
 * KNUST CS Year 3, Group 5
 *
 * Hardware: DHT11 + capacitive soil + LDR + 20x4 I2C LCD
 *           + relay (irrigation) + active buzzer
 *
 * Cloud loop (GreenGo app):
 *   Every ~10s POST /api/telemetry with MAC + API key headers.
 *   Body: soilRaw, relayOn, mode, tempC, humidityPct, lightLux, signalDbm, batteryV
 *   Response may include { command: { action: "PUMP_ON"|"PUMP_OFF", maxRunSeconds } }
 *
 * FIRST RUN:
 *   1. Set CALIBRATION_MODE = true, upload, read raw values off the LCD,
 *      fill in the four *_RAW constants.
 *   2. Set CALIBRATION_MODE = false.
 *   3. Flash, open Serial (115200). Copy the printed MAC.
 *   4. In GreenGo admin → provision that MAC → paste the one-time API key
 *      into DEVICE_API_KEY below → flash again.
 *   5. On boot the buzzer chirps twice. LCD shows Wi‑Fi / cloud status.
 *
 * NOTE ON THE CAPACITIVE SENSOR: HIGH when dry, LOW when wet — opposite of a
 * resistive board. That is why SOIL_DRY_RAW is the larger number. map()
 * handles descending ranges on its own.
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ========================= MODE =========================
// true  -> LCD shows raw ADC values with running lo/hi (for calibrating)
// false -> normal greenhouse display + cloud telemetry
const bool CALIBRATION_MODE = false;

// ===================== WIFI / CLOUD =====================
// PC Wi‑Fi address from `ipconfig` / Next.js "Network:" line.
// Must be the same LAN as this ESP32 (not a VirtualBox host-only IP).
const char *WIFI_SSID     = "b6g";
const char *WIFI_PASSWORD = "ukch8599";
const char *SERVER_HOST   = "172.17.230.163";
const uint16_t SERVER_PORT = 3000;

// Paste the one-time key from Admin → Provision device (starts with ggk_).
// Leave empty to run sensors/LCD offline (no HTTP posts).
const char *DEVICE_API_KEY = "";

// MAC is taken from the chip at runtime (WiFi.macAddress()).
// Provision THAT MAC in the admin UI — do not invent one.

const unsigned long TELEMETRY_PERIOD_MS = 10000;
const unsigned long WIFI_RETRY_MS       = 15000;
const float         BATTERY_V_FIXED     = 3.7f;  // no battery ADC on this board
const unsigned long REMOTE_OFF_HOLD_MS  = 15000; // keep PUMP_OFF long enough to confirm

// ========================= PINS =========================
#define DHTPIN      4
#define DHTTYPE     DHT11
#define SOIL_PIN    34      // ADC1, input-only. Capacitive AOUT here.
#define LDR_PIN     35      // ADC1, input-only
#define BUZZER_PIN  25
#define RELAY_PIN   26

// =================== SENSOR SCALING =====================
// Our DHT library/sensor pair reports temperature in TENTHS of a
// degree (2.8 when the room is 28 C), so we scale by 10. Humidity
// already comes back in whole percent.
const float TEMP_SCALE = 10.0;

// LDR % → provisional lux for the app (no calibrated lux sensor).
const float LIGHT_PCT_TO_LUX = 100.0f;  // 100% → 10000 lx

// ==================== CALIBRATION =======================
// Capacitive sensor: DRY reads HIGH, WET reads LOW.
const int SOIL_DRY_RAW   = 3300;   // probe in open air
const int SOIL_WET_RAW   = 2400;   // probe in water, up to the mark
const int LDR_DARK_RAW   = 2150;   // LDR covered with your thumb
const int LDR_BRIGHT_RAW = 4095;   // LDR under your demo lighting

// ====================== BEHAVIOUR =======================
const int DRY_ON  = 30;   // soil % below this -> ALARM + pump ON (local AUTO)
const int DRY_OFF = 38;   // soil % above this -> alarm off, pump OFF

const bool BEEP_CONTINUOUS = true;

// Most 1-channel relay modules are active LOW. If the pump runs when
// it should be idle, flip this to false.
const bool RELAY_ACTIVE_LOW = false;

// ======================= TIMING =========================
const unsigned long DHT_PERIOD     = 2000;   // DHT11 needs >= 1s
const unsigned long ANALOG_PERIOD  = 400;
const unsigned long DISPLAY_PERIOD = 500;
const unsigned long BEEP_ON_MS     = 150;
const unsigned long BEEP_OFF_MS    = 850;

// ======================== STATE =========================
LiquidCrystal_I2C lcd(0x27, 20, 4);
DHT dht(DHTPIN, DHTTYPE);

float temperatureC = NAN;
float humidity     = NAN;
int   dhtFailCount = 0;

int  soilRaw = 0,  lightRaw = 0;
int  soilPercent = 0, lightPercent = 0;
bool filtersPrimed = false;

int soilLo = 4095, soilHi = 0, lightLo = 4095, lightHi = 0;

bool soilDry   = false;
bool beepState = false;
bool relayOn   = false;   // actual commanded relay state (reported to cloud)

// Remote command override (dashboard pump control). When active it wins over
// local soil AUTO until the hold expires.
bool          remoteOverrideActive = false;
bool          remoteOverrideOn     = false;
unsigned long remoteOverrideUntil  = 0;

String deviceMac;
bool   wifiReady      = false;
bool   lastPostOk     = false;
unsigned long tDht = 0, tAnalog = 0, tDisplay = 0, tBeep = 0;
unsigned long tTelemetry = 0, tWifiRetry = 0;

uint8_t screen[4][20];

// ============== CUSTOM BAR-GRAPH GLYPHS =================
void createBarChars() {
  for (int n = 1; n <= 5; n++) {
    byte glyph[8];
    byte pattern = (0b11111 << (5 - n)) & 0b11111;
    for (int row = 0; row < 8; row++) glyph[row] = pattern;
    lcd.createChar(n, glyph);
  }
}

// =================== SENSOR HELPERS =====================
int readAveraged(uint8_t pin, uint8_t samples = 16) {
  uint32_t sum = 0;
  for (uint8_t i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(300);
  }
  return sum / samples;
}

int rawToPercent(int raw, int rawAtZero, int rawAtHundred) {
  long pct = map(raw, rawAtZero, rawAtHundred, 0, 100);
  return constrain(pct, 0, 100);
}

int smooth(int oldVal, int newVal) {
  if (abs(newVal - oldVal) <= 2) return newVal;
  return (oldVal * 3 + newVal + 2) / 4;
}

void setRelay(bool on) {
  relayOn = on;
  digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? !on : on);
}

// =================== DISPLAY HELPERS ====================
void putText(uint8_t *buf, uint8_t start, const char *text) {
  for (uint8_t i = 0; start + i < 20 && text[i] != '\0'; i++)
    buf[start + i] = (uint8_t)text[i];
}

void putBar(uint8_t *buf, uint8_t start, uint8_t width, int percent) {
  int totalCols = width * 5;
  int filled    = ((long)percent * totalCols) / 100;
  for (uint8_t i = 0; i < width; i++) {
    int inThisChar = filled - (i * 5);
    if (inThisChar >= 5)      buf[start + i] = 5;
    else if (inThisChar <= 0) buf[start + i] = ' ';
    else                      buf[start + i] = inThisChar;
  }
}

void renderLine(uint8_t row, const uint8_t *buf) {
  bool cursorSet = false;
  for (uint8_t c = 0; c < 20; c++) {
    if (buf[c] == screen[row][c]) { cursorSet = false; continue; }
    if (!cursorSet) { lcd.setCursor(c, row); cursorSet = true; }
    lcd.write(buf[c]);
    screen[row][c] = buf[c];
  }
}

// ===================== WIFI / HTTP ======================
bool apiKeyConfigured() {
  return DEVICE_API_KEY != nullptr && DEVICE_API_KEY[0] != '\0';
}

void ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    return;
  }

  wifiReady = false;
  unsigned long now = millis();
  if (now - tWifiRetry < WIFI_RETRY_MS && tWifiRetry != 0) return;
  tWifiRetry = now;

  Serial.printf("WiFi: connecting to %s ...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Short blocking wait so we don't starve the sensor loop forever.
  for (int i = 0; i < 20 && WiFi.status() != WL_CONNECTED; i++) {
    delay(250);
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    deviceMac = WiFi.macAddress();
    deviceMac.toUpperCase();
    Serial.printf("WiFi: OK  ip=%s  mac=%s  rssi=%d\n",
                  WiFi.localIP().toString().c_str(),
                  deviceMac.c_str(),
                  WiFi.RSSI());
  } else {
    Serial.println("WiFi: not connected yet");
  }
}

void applyRemoteCommand(const String &action, unsigned long maxRunSeconds) {
  unsigned long now = millis();
  if (action == "PUMP_ON") {
    remoteOverrideActive = true;
    remoteOverrideOn     = true;
    remoteOverrideUntil  = now + maxRunSeconds * 1000UL;
    setRelay(true);
    Serial.printf("CMD: PUMP_ON for %lu s\n", maxRunSeconds);
  } else if (action == "PUMP_OFF") {
    remoteOverrideActive = true;
    remoteOverrideOn     = false;
    remoteOverrideUntil  = now + REMOTE_OFF_HOLD_MS;
    setRelay(false);
    Serial.println("CMD: PUMP_OFF (hold for confirm)");
  }
}

// Minimal JSON scrape — avoids an ArduinoJson dependency.
bool extractJsonString(const String &body, const char *key, String &out) {
  String needle = String("\"") + key + "\":\"";
  int start = body.indexOf(needle);
  if (start < 0) return false;
  start += needle.length();
  int end = body.indexOf('"', start);
  if (end < 0) return false;
  out = body.substring(start, end);
  return true;
}

bool extractJsonNumber(const String &body, const char *key, long &out) {
  String needle = String("\"") + key + "\":";
  int start = body.indexOf(needle);
  if (start < 0) return false;
  start += needle.length();
  while (start < (int)body.length() && (body[start] == ' ')) start++;
  out = body.substring(start).toInt();
  return true;
}

void postTelemetry() {
  if (!apiKeyConfigured()) {
    lastPostOk = false;
    return;
  }
  if (WiFi.status() != WL_CONNECTED) {
    lastPostOk = false;
    return;
  }

  if (deviceMac.length() == 0) {
    deviceMac = WiFi.macAddress();
    deviceMac.toUpperCase();
  }

  float tempOut = isnan(temperatureC) ? 0.0f : temperatureC;
  float humOut  = isnan(humidity)     ? 0.0f : humidity;
  long  luxOut  = (long)(lightPercent * LIGHT_PCT_TO_LUX);
  int   rssi    = WiFi.RSSI();

  // Always AUTO for this demo build (no physical mode switch yet).
  char payload[320];
  snprintf(payload, sizeof(payload),
           "{\"soilRaw\":%d,\"tempC\":%.1f,\"humidityPct\":%.0f,"
           "\"lightLux\":%ld,\"relayOn\":%s,\"mode\":\"AUTO\","
           "\"signalDbm\":%d,\"batteryV\":%.1f}",
           soilRaw,
           tempOut,
           humOut,
           luxOut,
           relayOn ? "true" : "false",
           rssi,
           BATTERY_V_FIXED);

  String url = String("http://") + SERVER_HOST + ":" + SERVER_PORT + "/api/telemetry";

  HTTPClient http;
  http.setTimeout(5000);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Mac", deviceMac);
  http.addHeader("X-Device-Api-Key", DEVICE_API_KEY);

  int code = http.POST((uint8_t *)payload, strlen(payload));
  String body = http.getString();
  http.end();

  if (code == 200) {
    lastPostOk = true;
    Serial.printf("Telemetry OK (%d): %s\n", code, body.c_str());

    // Only act when command is a non-null object (has "action").
    if (body.indexOf("\"command\":null") < 0 && body.indexOf("\"action\"") >= 0) {
      String action;
      long maxRun = 600;
      if (extractJsonString(body, "action", action)) {
        extractJsonNumber(body, "maxRunSeconds", maxRun);
        if (maxRun <= 0) maxRun = 600;
        applyRemoteCommand(action, (unsigned long)maxRun);
      }
    }
  } else {
    lastPostOk = false;
    Serial.printf("Telemetry FAIL HTTP %d: %s\n", code, body.c_str());
  }
}

void updateRelayFromLogic() {
  unsigned long now = millis();

  if (remoteOverrideActive) {
    if ((long)(now - remoteOverrideUntil) >= 0) {
      remoteOverrideActive = false;
      Serial.println("CMD: remote override expired → local AUTO");
    } else {
      setRelay(remoteOverrideOn);
      return;
    }
  }

  // Local AUTO irrigation: soil hysteresis drives the pump.
  setRelay(soilDry);
}

// ========================= SETUP ========================
void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  pinMode(RELAY_PIN, OUTPUT);
  setRelay(false);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  dht.begin();

  lcd.init();
  lcd.backlight();
  createBarChars();
  memset(screen, 0xFF, sizeof(screen));

  // ---- BUZZER SELF-TEST ----
  Serial.println("Buzzer self-test: two chirps on GPIO " + String(BUZZER_PIN));
  for (int i = 0; i < 2; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(120);
    digitalWrite(BUZZER_PIN, LOW);
    delay(180);
  }

  lcd.setCursor(0, 0);
  lcd.print(CALIBRATION_MODE ? "CALIBRATION MODE" : "GreenGo Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Group 5 - boot...");
  delay(800);

  if (!CALIBRATION_MODE) {
    ensureWifi();
    deviceMac = WiFi.macAddress();
    deviceMac.toUpperCase();

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("MAC (provision):");
    lcd.setCursor(0, 1);
    lcd.print(deviceMac);
    lcd.setCursor(0, 2);
    if (!apiKeyConfigured()) {
      lcd.print("Set DEVICE_API_KEY");
      lcd.setCursor(0, 3);
      lcd.print("then re-flash");
    } else if (wifiReady) {
      lcd.print("WiFi OK");
      lcd.setCursor(0, 3);
      lcd.print(WiFi.localIP());
    } else {
      lcd.print("WiFi connecting...");
    }

    Serial.println("======== GreenGo device identity ========");
    Serial.println("Provision this MAC in Admin, then paste the API key into DEVICE_API_KEY:");
    Serial.println(deviceMac);
    if (!apiKeyConfigured()) {
      Serial.println("DEVICE_API_KEY is empty — local sensors/LCD only until you set it.");
    }
    Serial.printf("Telemetry URL: http://%s:%u/api/telemetry\n", SERVER_HOST, SERVER_PORT);
    Serial.println("=========================================");
    delay(3500);
  }

  lcd.clear();
  memset(screen, 0xFF, sizeof(screen));
  tTelemetry = millis();
}

// ========================= LOOP =========================
void loop() {
  unsigned long now = millis();

  // ---------- 1. DHT11 ----------
  if (now - tDht >= DHT_PERIOD) {
    tDht = now;
    float rawT = dht.readTemperature();
    float rawH = dht.readHumidity();
    if (isnan(rawT) || isnan(rawH)) {
      dhtFailCount++;
    } else {
      temperatureC = rawT * TEMP_SCALE;
      humidity     = rawH;
      dhtFailCount = 0;
    }
  }

  // ---------- 2. Analog sensors ----------
  if (now - tAnalog >= ANALOG_PERIOD) {
    tAnalog = now;

    soilRaw  = readAveraged(SOIL_PIN);
    lightRaw = readAveraged(LDR_PIN);

    if (soilRaw  < soilLo)  soilLo  = soilRaw;
    if (soilRaw  > soilHi)  soilHi  = soilRaw;
    if (lightRaw < lightLo) lightLo = lightRaw;
    if (lightRaw > lightHi) lightHi = lightRaw;

    int soilNew  = rawToPercent(soilRaw,  SOIL_DRY_RAW, SOIL_WET_RAW);
    int lightNew = rawToPercent(lightRaw, LDR_DARK_RAW, LDR_BRIGHT_RAW);

    if (!filtersPrimed) {
      soilPercent   = soilNew;
      lightPercent  = lightNew;
      filtersPrimed = true;
    } else {
      soilPercent  = smooth(soilPercent,  soilNew);
      lightPercent = smooth(lightPercent, lightNew);
    }

    Serial.printf("soil raw=%4d (%3d%%)  ldr raw=%4d (%3d%%)  T=%.0fC  H=%.0f%%  dry=%s  relay=%s\n",
                  soilRaw, soilPercent, lightRaw, lightPercent,
                  temperatureC, humidity,
                  soilDry ? "YES" : "no",
                  relayOn ? "ON" : "OFF");
  }

  // ---------- 3. Local dry decision ----------
  if (!soilDry && soilPercent < DRY_ON)  soilDry = true;
  if ( soilDry && soilPercent > DRY_OFF) soilDry = false;

  updateRelayFromLogic();

  // ---------- 4. Buzzer (still follows soilDry, not remote override) ----------
  if (soilDry) {
    if (BEEP_CONTINUOUS) {
      digitalWrite(BUZZER_PIN, HIGH);
      beepState = true;
    } else {
      unsigned long interval = beepState ? BEEP_ON_MS : BEEP_OFF_MS;
      if (now - tBeep >= interval) {
        tBeep = now;
        beepState = !beepState;
        digitalWrite(BUZZER_PIN, beepState ? HIGH : LOW);
      }
    }
  } else if (beepState) {
    beepState = false;
    digitalWrite(BUZZER_PIN, LOW);
  }

  // ---------- 5. Wi‑Fi + telemetry ----------
  if (!CALIBRATION_MODE) {
    ensureWifi();
    if (now - tTelemetry >= TELEMETRY_PERIOD_MS) {
      tTelemetry = now;
      postTelemetry();
    }
  }

  // ---------- 6. Display ----------
  if (now - tDisplay >= DISPLAY_PERIOD) {
    tDisplay = now;

    uint8_t line[20];
    char    text[24];

    if (CALIBRATION_MODE) {
      memset(line, ' ', 20);
      putText(line, 0, "CALIB   SOIL  LGHT");
      renderLine(0, line);

      memset(line, ' ', 20);
      snprintf(text, sizeof(text), "now     %4d  %4d", soilRaw, lightRaw);
      putText(line, 0, text);
      renderLine(1, line);

      memset(line, ' ', 20);
      snprintf(text, sizeof(text), "lo      %4d  %4d", soilLo, lightLo);
      putText(line, 0, text);
      renderLine(2, line);

      memset(line, ' ', 20);
      snprintf(text, sizeof(text), "hi      %4d  %4d", soilHi, lightHi);
      putText(line, 0, text);
      renderLine(3, line);
      return;
    }

    // Row 0: temperature + humidity
    memset(line, ' ', 20);
    if (dhtFailCount >= 3) {
      putText(line, 0, "DHT11 read error");
    } else {
      snprintf(text, sizeof(text), "Temp %2.0fC   Hum %2.0f%%",
               temperatureC, humidity);
      putText(line, 0, text);
    }
    renderLine(0, line);

    // Row 1: soil + bar
    memset(line, ' ', 20);
    snprintf(text, sizeof(text), "Soil %3d%%", soilPercent);
    putText(line, 0, text);
    putBar(line, 10, 10, soilPercent);
    renderLine(1, line);

    // Row 2: light + bar
    memset(line, ' ', 20);
    snprintf(text, sizeof(text), "Lght %3d%%", lightPercent);
    putText(line, 0, text);
    putBar(line, 10, 10, lightPercent);
    renderLine(2, line);

    // Row 3: pump + cloud link
    memset(line, ' ', 20);
    const char *net =
        !apiKeyConfigured() ? "NO KEY" :
        !wifiReady          ? "NO WIFI" :
        lastPostOk          ? "CLOUD OK" : "CLOUD--";
    snprintf(text, sizeof(text), "Pump:%-3s %s",
             relayOn ? "ON" : "OFF", net);
    putText(line, 0, text);
    renderLine(3, line);
  }
}
