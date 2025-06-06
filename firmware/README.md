# アンケートシステム設計 - README.md

このドキュメントは、電子黒板を活用したリアルタイム参加型アンケートシステムの、ファームウェアに依存しない上位レイヤーの設計概要を記述します。

---

## 1. システム概要

本システムは、**先生が電子黒板に設問を投影しながら説明するだけで、生徒が手元のデバイスから回答し、その結果がリアルタイムで電子黒板に集計・表示される**ことを目的としたインタラクティブなアンケートシステムです。先生・生徒双方の手間を最小限に抑え、スムーズな授業進行と生徒の積極的な参加を促します。

### 主要な構成要素

1. **プレゼン・表示インターフェース (`Frontend: Display`)**: 電子黒板に投影され、設問内容とリアルタイム集計結果を表示します。
2. **先生用操作インターフェース (`Frontend: Control Panel`)**: 先生の PC で操作し、設問の切り替えやアンケートの開始・終了を制御します。
3. **バックエンド API & データベース (`Backend API & Database`)**: 全てのデータの管理、設問の状態管理、リアルタイム集計、各種インターフェースへのデータ提供を担います。
4. **回答デバイス (`Answering Device`)**: 生徒が手元で操作し、回答をシステムに送信します。
5. **ネットワークハブ (`Network Hub`)**: 回答デバイスがインターネットに接続するための Wi-Fi アクセスポイントを提供します。

---

## 2. システム要件

### 2.1. 先生の PC 側

- **操作の簡素化**: 先生は、Web ブラウザで開いた専用の操作画面で、直感的なボタン操作（「次の設問へ」「回答受付終了」など）のみでアンケートを進行できる。
- **リアルタイムフィードバック**: 先生の操作画面には、電子黒板に表示されている内容（設問とリアルタイム集計結果）がプレビュー表示され、回答状況を即座に把握できる。
- **専用プレゼンツールの採用**: 既存のプレゼンソフトではなく、本システムの一部である Web ベースのプレゼンツールを使用する。これにより、スライド切り替えと設問状態の同期が自動化される。

### 2.2. 電子黒板側

- **自動切り替え**: 先生の操作（「次の設問へ」など）に連動し、設問内容と集計グラフが自動的に切り替わる。
- **リアルタイム表示**: 生徒の回答が送信されるたびに、集計グラフがリアルタイムで更新される。
- **視覚的明瞭性**: 絵、問題文、選択肢が大きく表示され、生徒が容易に視認できる。

### 2.3. 生徒の回答デバイス側

- **操作の簡素化**: 生徒はデバイスの内蔵ボタンを押すだけで回答できる。特別な入力操作は不要。
- **自動状態同期**: デバイスはサーバーから現在の設問 ID と回答受付状態を自動で取得し、その状態に応じて動作を切り替える（例: 回答受付中のみボタンが有効）。
- **視覚的フィードバック**: 回答が受け付けられたか、受付時間外かなどを内蔵 LED で視覚的に示す。
- **識別子送信**: デバイス固有の ID（例: MAC アドレス）と回答番号をサーバーに送信する。

### 2.4. バックエンドシステム

- **設問管理**: 各設問のテキスト、画像 URL、選択肢、推奨回答時間などをデータベースで一元管理。
- **設問状態管理**: 現在有効な設問の ID、回答受付開始時刻、終了時刻を記録・管理。先生の操作に応じて更新。
- **回答の受付と紐付け**: デバイスからの回答データを受け付け、現在の有効な設問 ID と紐付けてデータベースに保存。
- **リアルタイム集計**: 回答が保存されるたびにリアルタイムで集計結果を更新し、関連するフロントエンドにプッシュ配信。
- **ネットワーク**: インターネット経由でのアクセスが可能であること（Vercel 等のホスティングサービス利用を前提）。

### 2.5. ネットワークハブ

- **Wi-Fi 提供**: 回答デバイスがインターネットに接続するための Wi-Fi アクセスポイントを提供する。
- **ポータビリティ**: スマートフォンなど、持ち運び可能なデバイスをネットワークハブとして利用できること。

---

## 3. 技術スタック（推奨）

この設計は特定のファームウェアに依存しませんが、以下の技術スタックを想定することで効率的な実装が可能です。

- **フロントエンド (先生用操作画面 & 電子黒板表示画面)**:
  - **フレームワーク**: **Next.js (React)**
  - **グラフ表示**: `react-chartjs-2` または同様のリアルタイムグラフライブラリ
  - **リアルタイム通信**: **WebSocket (Pusher, Ably, Supabase Realtime などの SaaS)** または、ポーリング（リアルタイム性が許容できる場合）
- **バックエンド API & データベース**:
  - **フレームワーク**: **Next.js API Routes (Node.js)**
  - **データベース**: **PostgreSQL (Vercel Postgres, Supabase, PlanetScale など)**
  - **リアルタイム通信**: WebSocket SaaS (上記フロントエンドと共通)
- **回答デバイス ファームウェア**:
  - **開発環境**: Arduino IDE / PlatformIO
  - **言語**: C++
  - **ライブラリ**:
    - Wi-Fi 接続用 (`WiFi.h`など)
    - HTTP/HTTPS クライアント (`HTTPClient.h`, `WiFiClientSecure.h`など)
    - JSON 処理 (`ArduinoJson.h`など)
    - デバイス固有機能制御 (例: `M5Unified.h` for ATOM Lite)
    - NTP による時刻同期
- **ネットワークハブ**:
  - **スマートフォン**: テザリング機能 (Wi-Fi ホットスポット)
  - または、ポータブル Wi-Fi ルーター

---

## 4. データフローとシステム動作

1. **システム初期化**:

   - 先生の PC で先生用操作画面を開き、「アンケート開始」ボタンを押す。
   - バックエンド API は、セッションを開始し、初期の設問状態（例: 「設問なし」）をデータベースに記録。
   - 電子黒板表示画面は、初期状態を表示（例: 「アンケート準備中」）。
   - 回答デバイスは Wi-Fi に接続し、サーバーからの設問状態ポーリングを開始。

2. **設問開始**:

   - 先生が先生用操作画面で「次の設問へ」ボタンを押す。
   - 先生用操作画面はバックエンド API (`/api/control/next-question`) を呼び出し、次の設問 ID と、その設問の回答受付期間（例: 現在時刻から 30 秒間）をデータベースに記録するよう指示。
   - バックエンド API はデータベースを更新し、WebSocket を通じて電子黒板表示画面と先生用操作画面に新しい設問 ID と回答受付状態をプッシュ通知。
   - 電子黒板表示画面は、新しい設問内容と回答受付中のカウントダウンタイマーを表示開始。
   - 先生用操作画面も表示を更新。

3. **回答送信**:

   - 生徒の回答デバイスは、定期的なポーリングにより「現在設問 X が回答受付中である」ことを確認。
   - 生徒がデバイスのボタンを押すと、デバイスは自身の MAC アドレスと回答番号を JSON 形式でバックエンド API (`/api/answer`) に HTTP POST 送信。
   - デバイスは送信後、LED で成功/失敗をフィードバック。

4. **リアルタイム集計**:

   - バックエンド API は回答を受け取ると、現在の時刻と設問の受付期間を照合し、有効な回答のみをデータベースに保存。
   - 回答が保存されるたびに、バックエンド API は集計結果を更新し、WebSocket を通じて電子黒板表示画面と先生用操作画面にプッシュ通知。
   - 電子黒板表示画面と先生用操作画面は、リアルタイムで集計グラフを更新。

5. **回答受付終了**:

   - 設問の回答受付期間が終了時刻に達すると、バックエンド API は自動的に`is_active`フラグをオフにする。
   - または、先生が先生用操作画面で明示的に「回答受付終了」ボタンを押すことで、手動で終了させることも可能。
   - 電子黒板表示画面は「回答受付終了」などの表示に切り替わり、カウントダウンタイマーが停止。
   - 回答デバイスは、ポーリングにより「回答受付終了」状態を検知し、ボタンを押しても回答を送信しない（または異なるフィードバック）。

6. **最終結果表示**:

   - 全ての設問が終了後、先生が「最終結果表示」ボタンを押すと、電子黒板に全アンケートの総合結果などが表示される。

---

この設計は、Next.js と WebSocket を活用することで、先生の手間を最小限に抑えつつ、生徒がリアルタイムに参加できるインタラクティブなアンケートシステムを実現します。ファームウェアはこの上位設計に基づいて、各デバイスの役割を忠実に実行するよう実装されます。
