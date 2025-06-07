#include <WiFi.h>
#include <HTTPClient.h>
#include <FastLED.h>
#include <Button2.h>

// Wi-Fi設定
const char *ssid = "YOUR_WIFI_SSID";         // ここをあなたのWi-Fi SSIDに置き換えてください
const char *password = "YOUR_WIFI_PASSWORD"; // ここをあなたのWi-Fi パスワードに置き換えてください

// サーバー設定
const char *serverUrl = "http://YOUR_SERVER_IP_OR_DOMAIN/get_max_n"; // ここをサーバーのエンドポイントURLに置き換えてください
const unsigned long POLLING_INTERVAL = 10000;                        // max_nをポーリングする間隔 (ミリ秒, 例: 10秒)
unsigned long lastPollingTime = 0;

// LEDの設定
#define LED_PIN 27
#define NUM_LEDS 1
CRGB leds[NUM_LEDS];

// ボタンの設定
#define BUTTON_PIN 39
Button2 btn;

// 選択肢の色定義 (最大6択まで対応できるように定義。必要に応じて増減可能)
// ここを資料の色に合わせてください
const CRGB ALL_CHOICES[] = {
    CRGB::Red,    // 選択肢1
    CRGB::Green,  // 選択肢2
    CRGB::Blue,   // 選択肢3
    CRGB::Yellow, // 選択肢4
    CRGB::Purple, // 選択肢5 (必要なら利用)
    CRGB::Cyan    // 選択肢6 (必要なら利用)
};

int max_n = 0; // サーバーから受け取る現在の最大選択肢数 (初期値: 0で無効)

// 状態変数
int currentChoiceIndex = 0;                        // 現在選択中の選択肢のインデックス
bool choiceConfirmed = false;                      // 選択が確定されたかどうかのフラグ
unsigned long confirmBlinkStartTime = 0;           // 確定後の点滅開始時刻
const unsigned long CONFIRM_PRESS_DURATION = 1000; // 確定するための長押し時間 (ミリ秒)
const unsigned long CONFIRM_BLINK_DURATION = 2000; // 確定後の点滅表示時間 (ミリ秒)
const unsigned long ERROR_BLINK_DURATION = 3000;   // エラー時の点滅表示時間 (ミリ秒)

// --- 関数プロトタイプ宣言 ---
void connectWiFi();
void get_max_n_from_server();
void button_clicked(Button2 &btn);
void button_longclick(Button2 &btn);
void updateLED();
void resetState();
void displayError(const char *message);
void indicateNoOperation(); // max_n=0の時のLED表示

void setup()
{
  Serial.begin(115200);
  Serial.println("ATOM Lite 1 Button Selector with Server Control Start!");

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS); // ATOM LiteはGRBオーダー
  FastLED.setBrightness(30);                              // LEDの明るさ調整 (0-255)

  btn.begin(BUTTON_PIN, INPUT_PULLUP);          // ATOM Liteのボタンは内部プルアップを使用
  btn.setLongClickTime(CONFIRM_PRESS_DURATION); // 長押しと判定する時間を設定

  // Wi-Fi接続
  connectWiFi();

  // 初回max_n取得
  get_max_n_from_server();

  // 初期状態のLED表示
  resetState();
}

void loop()
{
  // Wi-Fi接続が切れたら再接続を試みる
  if (WiFi.status() != WL_CONNECTED)
  {
    connectWiFi();
  }

  // 定期的にmax_nをポーリング
  if (millis() - lastPollingTime >= POLLING_INTERVAL)
  {
    get_max_n_from_server();
    lastPollingTime = millis();
  }

  // max_nが0の場合、ボタンイベントを無効化し、特別な表示をする
  if (max_n == 0)
  {
    btn.setClickHandler(nullptr);     // 短押しハンドラを無効化
    btn.setLongClickHandler(nullptr); // 長押しハンドラを無効化
    indicateNoOperation();            // 無効時のLED表示
  }
  else
  {
    // max_nが0でない場合のみ、ボタンハンドラを有効にする
    btn.setClickHandler(button_clicked);
    btn.setLongClickHandler(button_longclick);
  }

  btn.loop(); // Button2ライブラリのループ関数を呼び出す (ボタン状態の更新)

  // 確定後の点滅処理
  if (choiceConfirmed)
  {
    if (millis() - confirmBlinkStartTime < CONFIRM_BLINK_DURATION)
    {
      // 一定時間点滅させる
      if ((millis() - confirmBlinkStartTime) % 400 < 200)
      {                                            // 200ms点灯, 200ms消灯
        leds[0] = ALL_CHOICES[currentChoiceIndex]; // 確定した色で点滅
      }
      else
      {
        leds[0] = CRGB::Black; // 消灯
      }
    }
    else
    {
      resetState(); // 点滅表示時間が終了したらリセット
    }
    FastLED.show();
  }
  else if (max_n > 0)
  {
    // 通常モード時のLED更新は、ボタンイベントでトリガーされるため、ここでは明示的な表示は不要。
    // resetState()で初期化されるか、button_clicked()で更新される。
  }
}

// Wi-Fi接続
void connectWiFi()
{
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 30000)
  { // 30秒タイムアウト
    delay(500);
    Serial.print(".");
    leds[0] = CRGB::Blue; // 接続中は青く点滅
    FastLED.show();
    delay(500);
    leds[0] = CRGB::Black;
    FastLED.show();
  }
  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  }
  else
  {
    Serial.println("\nFailed to connect to WiFi. Retrying...");
    displayError("WiFi Error"); // Wi-Fi接続失敗をLEDで示す
    // 必要に応じて、再起動などの処理を追加
  }
}

// サーバーからmax_nを取得
void get_max_n_from_server()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("Not connected to WiFi, skipping max_n fetch.");
    displayError("WiFi Req"); // Wi-Fi未接続エラー
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  Serial.print("Fetching max_n from: ");
  Serial.println(serverUrl);

  int httpResponseCode = http.GET();

  if (httpResponseCode > 0)
  {
    String payload = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.print("Payload: ");
    Serial.println(payload);

    // JSONパース (簡単なJSON形式を想定): 例: {"max_n": 4}
    int startIndex = payload.indexOf("\"max_n\":") + 9; // "\"max_n\":" の長さ + 1 (コロンの後ろのスペース)
    int endIndex = payload.indexOf("}", startIndex);
    if (startIndex != -1 && endIndex != -1)
    {
      String max_n_str = payload.substring(startIndex, endIndex).trim();
      int new_max_n = max_n_str.toInt();
      // 有効な範囲かチェック: 0 <= new_max_n <= ALL_CHOICESの要素数
      if (new_max_n >= 0 && new_max_n <= (sizeof(ALL_CHOICES) / sizeof(ALL_CHOICES[0])))
      {
        max_n = new_max_n;
        Serial.print("Updated max_n: ");
        Serial.println(max_n);
        resetState(); // max_nが変更されたら状態をリセット
      }
      else
      {
        Serial.println("Invalid max_n value received.");
        displayError("MaxN Invalid");
      }
    }
    else
    {
      Serial.println("Failed to parse max_n from JSON.");
      displayError("JSON Parse");
    }
  }
  else
  {
    Serial.print("Error on HTTP request: ");
    Serial.println(httpResponseCode);
    displayError("HTTP Error"); // HTTPリクエストエラー
  }
  http.end();
}

// 短押し時の処理 (選択肢の切り替え)
void button_clicked(Button2 &b)
{
  if (!choiceConfirmed && max_n > 0)
  {                                                        // 確定中でなく、かつ操作が有効な場合のみ
    currentChoiceIndex = (currentChoiceIndex + 1) % max_n; // max_nの範囲内でループ
    Serial.print("Current Choice: ");
    Serial.println(currentChoiceIndex + 1); // 1-indexed表示
    updateLED();                            // LEDを更新
  }
}

// 長押し時の処理 (選択肢の確定)
void button_longclick(Button2 &b)
{
  if (!choiceConfirmed && max_n > 0)
  { // 確定中でなく、かつ操作が有効な場合のみ
    choiceConfirmed = true;
    confirmBlinkStartTime = millis();
    Serial.print("Choice Confirmed: ");
    Serial.println(currentChoiceIndex + 1); // 1-indexed表示
    // 確定したことを示す色で点灯させる (点滅はloop()で処理)
    leds[0] = ALL_CHOICES[currentChoiceIndex];
    FastLED.show();

    // ここで、確定した選択肢（currentChoiceIndex）に対応するアクションを実行します
    // 例: Webhookをトリガー、内部状態を更新など
    Serial.print("--- Executing action for Choice ");
    Serial.println(currentChoiceIndex + 1);
    // 例: if (currentChoiceIndex == 0) { /* アクション1 (選択肢1) */ }
    //     else if (currentChoiceIndex == 1) { /* アクション2 (選択肢2) */ }
    //     ...
    // 実際のアクションの後にサーバーに送信する処理などを追加することも可能です。
  }
}

// LED表示の更新
void updateLED()
{
  if (max_n > 0)
  { // max_nが0より大きい場合のみ表示
    leds[0] = ALL_CHOICES[currentChoiceIndex];
    FastLED.show();
  }
  else
  {
    indicateNoOperation(); // max_n=0の場合は無効表示
  }
}

// 状態をリセットし、初期表示に戻す
void resetState()
{
  currentChoiceIndex = 0;  // 最初の選択肢に戻す
  choiceConfirmed = false; // 確定フラグをリセット
  if (max_n == 0)
  {
    indicateNoOperation(); // max_n=0の場合は無効表示
  }
  else
  {
    leds[0] = CRGB::Black; // 選択可能時は初期LED消灯
    FastLED.show();
  }
  Serial.println("State Reset. Waiting for input.");
}

// エラー発生時にLEDを赤く点滅させる
void displayError(const char *message)
{
  Serial.print("ERROR: ");
  Serial.println(message);
  unsigned long startTime = millis();
  while (millis() - startTime < ERROR_BLINK_DURATION)
  {
    if ((millis() - startTime) % 200 < 100)
    { // 短い間隔で点滅
      leds[0] = CRGB::Red;
    }
    else
    {
      leds[0] = CRGB::Black;
    }
    FastLED.show();
    delay(10); // 少し待つ
  }
  // エラー表示後、通常モードに戻る (Wi-Fi再接続など試行)
  resetState();
}

// max_n=0 (操作不可) の場合のLED表示
void indicateNoOperation()
{
  // 例: ゆっくりと薄い白で点滅し、操作不可であることを示す
  if ((millis() % 2000) < 1000)
  {                       // 1秒点灯、1秒消灯
    leds[0] = CRGB::Grey; // 薄い白（灰色）
  }
  else
  {
    leds[0] = CRGB::Black;
  }
  FastLED.show();
}