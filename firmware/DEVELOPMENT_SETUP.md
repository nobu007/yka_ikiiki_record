# ATOM Lite ファームウェア開発環境セットアップガイド (PlatformIO IDE)

このドキュメントは、M5Stack ATOM Lite のファームウェア開発を Visual Studio Code (VS Code) と PlatformIO IDE 拡張機能を使用して行うためのセットアップ手順を説明します。

---

## 目次

1.  [必要なもの](#1-必要なもの)
2.  [VS Code のインストール](#2-vs-code-のインストール)
3.  [PlatformIO IDE 拡張機能のインストール](#3-platformio-ide-拡張機能のインストール)
4.  [PlatformIO プロジェクトの作成](#4-platformio-プロジェクトの作成)
5.  [既存のスケッチのインポートと設定](#5-既存のスケッチのインポートと設定)
6.  [Wi-Fi およびサーバー設定の更新](#6-wi-fi-およびサーバー設定の更新)
7.  [ATOM Lite への書き込み](#7-atom-lite-への書き込み)
8.  [シリアルモニターの使用](#8-シリアルモニターの使用)
9.  [トラブルシューティング](#9-トラブルシューティング)

---

### 1. 必要なもの

- **M5Stack ATOM Lite 本体**
- **USB-C ケーブル:** データ転送に対応したもの
- **PC:** Windows, macOS, Linux いずれも可
- **インターネット接続:** Wi-Fi 接続とサーバーへのアクセス用

---

### 2. VS Code のインストール

まだ VS Code をインストールしていない場合は、公式ウェブサイトからダウンロードしてインストールしてください。

- [Visual Studio Code 公式サイト](https://code.visualstudio.com/)

---

### 3. PlatformIO IDE 拡張機能のインストール

VS Code を開いたら、以下の手順で PlatformIO IDE 拡張機能をインストールします。

1.  VS Code の左側のアクティビティバーにある「**拡張機能**」アイコン (四角が 3 つと斜めの四角 1 つ) をクリックします。
2.  検索バーに `PlatformIO IDE` と入力します。
3.  検索結果に表示される `PlatformIO IDE` (PlatformIO Org. 製) をクリックし、「**インストール**」ボタンをクリックします。
4.  インストールが完了すると、VS Code の左側のアクティビティバーに **PlatformIO のアイコン** (アリの頭のようなマーク) が表示されます。

---

### 4. PlatformIO プロジェクトの作成

通常、PlatformIO は新しいプロジェクトを作成することを推奨していますが、今回は既存の Arduino スケッチ (`atom_lite_selector.ino`) を使用するため、少し特殊な手順を踏みます。

今回は、既存の `.ino` ファイルを PlatformIO プロジェクトとして扱うための手順に焦点を当てます。

---

### 5. 既存のスケッチのインポートと設定

`atom_lite_selector.ino` は Arduino IDE 形式のスケッチですが、PlatformIO でも適切に設定すれば利用可能です。

1.  VS Code で、この Git リポジトリのルートフォルダ (`nobu007-yka_ikiiki_record/`) を開きます。
2.  左側のアクティビティバーにある **PlatformIO のアイコン**をクリックします。
3.  PlatformIO のホーム画面が表示されたら、「**Open Project**」をクリックし、`firmware/atom_lite/atom_lite_selector/` ディレクトリを選択して開きます。

    - PlatformIO はこのディレクトリを認識し、必要な設定ファイルの作成を提案する場合があります。その指示に従ってください。
    - もし自動で `platformio.ini` が生成されない場合、`firmware/atom_lite/atom_lite_selector/` ディレクトリ直下に以下の内容で `platformio.ini` ファイルを**手動で作成**します。

    **`platformio.ini` の内容:**

    ```ini
    [env:m5stack-atom]
    platform = espressif32
    board = m5stack-atom
    framework = arduino
    upload_speed = 921600 ; ESP32の高速書き込み速度 (必要に応じて調整)
    monitor_speed = 115200 ; シリアルモニターの速度
    lib_deps =
        fastled/FastLED@^3.6.0 ; FastLED ライブラリ
        lennarthennigs/Button2@^2.2.3 ; Button2 ライブラリ
    ```

    - `platform = espressif32`: ESP32 ボードを使用することを指定します。
    - `board = m5stack-atom`: M5Stack ATOM Lite のボード定義を指定します。
    - `framework = arduino`: Arduino フレームワークを使用することを指定します。
    - `lib_deps`: この行で、使用するライブラリとそのバージョンを指定します。PlatformIO はビルド時にこれらのライブラリを自動的にダウンロードしてくれます。
      - `fastled/FastLED@^3.6.0`: FastLED ライブラリ
      - `lennarthennigs/Button2@^2.2.3`: Button2 ライブラリ

4.  `platformio.ini` を保存します。PlatformIO は自動的に依存関係のダウンロードを開始する場合があります。

---

### 6. Wi-Fi およびサーバー設定の更新

`atom_lite_selector.ino` ファイルを開き、以下の箇所をあなたの環境に合わせて編集します。

```cpp
// Wi-Fi設定
const char* ssid = "YOUR_WIFI_SSID";         // ここをあなたのWi-Fi SSIDに置き換えてください
const char* password = "YOUR_WIFI_PASSWORD"; // ここをあなたのWi-Fi パスワードに置き換えてください

// サーバー設定
const char* serverUrl = "http://YOUR_SERVER_IP_OR_DOMAIN/get_max_n"; // ここをサーバーのエンドポイントURLに置き換えてください
```

- `ssid` と `password` は、ATOM Lite が接続する Wi-Fi ネットワークの認証情報です。
- `serverUrl` は、`max_n` を取得するためのサーバーのエンドポイント URL です。

---

### 7. ATOM Lite への書き込み

1. **ATOM Lite の接続:** ATOM Lite を USB-C ケーブルで PC に接続します。
2. VS Code の下部にある**ステータスバー**を確認します。PlatformIO のアイコンの横に、M5Stack ATOM Lite のボード名とポート名が表示されていることを確認してください。もし表示されていない場合や間違っている場合は、クリックして正しいボード (`m5stack-atom`) とシリアルポートを選択します。
3. **ビルド:**
   - 下部ステータスバーの「**✔**」マーク (**PlatformIO: Build**) をクリックするか、
   - `Ctrl+Alt+B` (Windows/Linux) / `Cmd+Option+B` (macOS) を押します。
   - これにより、コードがコンパイルされ、必要なライブラリがダウンロードされます。
4. **書き込み:**
   - ビルドが成功したら、下部ステータスバーの**右矢印アイコン** (**PlatformIO: Upload**) をクリックするか、
   - `Ctrl+Alt+U` (Windows/Linux) / `Cmd+Option+U` (macOS) を押します。
   - 書き込みが開始されます。ATOM Lite の LED が点滅し、書き込みが進行していることを示します。
   - もし書き込み中にエラーが発生する場合、一度 ATOM Lite を PC から外し、再度接続し直してから書き込みを試す、または ATOM Lite のリセットボタンを押しながら書き込みを開始すると改善する場合があります。

---

### 8. シリアルモニターの使用

ATOM Lite が起動し、デバッグメッセージを出力しているのを確認するために、シリアルモニターを使用します。

1. 下部ステータスバーの**プラグアイコン** (**PlatformIO: Serial Monitor**) をクリックするか、
2. `Ctrl+Alt+S` (Windows/Linux) / `Cmd+Option+S` (macOS) を押します。
3. シリアルモニターが開き、ATOM Lite からの出力が表示されます。Wi-Fi 接続状況やサーバーからの `max_n` 取得、ボタン操作のログなどが確認できます。

---

### 9. トラブルシューティング

- **COM ポートが見つからない/書き込みができない:**
  - USB ケーブルがデータ転送対応か確認してください。充電専用ケーブルでは書き込みできません。
  - ATOM Lite を PC の別の USB ポートに接続してみてください。
  - PC に適切な USB ドライバがインストールされているか確認してください。M5Stack や ESP32 の場合、CP2104 または CH9102F ドライバが必要です。M5Stack の公式ドキュメントで確認できます。
- **`platformio.ini` のボードまたはフレームワークが間違っている:**
  - `platformio.ini` の `board` と `framework` の設定が正しいか再確認してください。
- **ライブラリが見つからないエラー:**
  - `platformio.ini` の `lib_deps` に必要なライブラリがすべて正しく記述されているか確認してください。バージョン指定も重要です。
- **Wi-Fi に接続できない:**
  - `ssid` と `password` が正しいか再度確認してください（大文字・小文字も含む）。
  - Wi-Fi ルーターと ATOM Lite の距離が離れすぎていないか確認してください。
  - Wi-Fi ルーターが 2.4GHz 帯に対応しているか確認してください（ESP32 は通常 2.4GHz のみ対応）。
