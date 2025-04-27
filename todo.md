# kotemari TypeScript移植 ToDo

このToDoリストは、Python製kotemariライブラリをTypeScriptに移植するための作業手順です。

## 1. 準備
- [x] Python版kotemariリポジトリの仕様・構造を理解する
- [x] 主要API・機能の洗い出し
- [x] TypeScriptプロジェクト（kotemari-ts）をセットアップ
- [x] 必要な依存パッケージの選定・導入

## 2. コア機能の設計
- [x] Python版のクラス・関数構成をTypeScriptにマッピング
- [x] ファイル依存関係解析ロジックの設計（Python→TypeScript: import解析→import/export解析）
- [x] 設定ファイル（.kotemari.yml等）の読み込み設計
- [x] キャッシュ・ウォッチ機能の設計
- [x] **主要APIとしてREADME.mdに記載されている下記メソッドは必ずTypeScriptユーザーに提供すること：**
    - [x] Kotemari（クラス/コンストラクタ）
    - [x] analyzeProject（analyze_project）
    - [x] listFiles（list_files）
    - [x] getDependencies（get_dependencies）
    - [x] getReverseDependencies（get_reverse_dependencies）
    - [ ] getContext（get_context）
    - [x] startWatching / stopWatching（start_watching / stop_watching）
    - [x] clearCache（clear_cache）

## 3. 実装（テスト駆動で進める）
- [x] Kotemariクラスの実装
    - [x] テスト作成（プロジェクトルート・設定パス・キャッシュ・ログレベルの管理）
    - [x] 実装
    - [x] テストがパスすることを確認
- [x] analyzeProject: プロジェクト全体の解析
    - [x] テスト作成
    - [x] 実装
    - [x] テストがパスすることを確認
- [x] listFiles: 解析対象ファイル一覧取得
    - [x] テスト作成
    - [x] 実装
    - [x] テストがパスすることを確認
- [x] getDependencies: ファイルの依存先取得
    - [x] テスト作成
    - [x] 実装
    - [x] テストがパスすることを確認
- [x] getReverseDependencies: 逆依存ファイル取得
    - [x] テスト作成
    - [x] 実装
    - [x] テストがパスすることを確認
- [x] getContext: 文脈生成API
    - [x] テスト作成
    - [x] 実装
    - [x] テストがパスすることを確認
- [x] startWatching/stopWatching: ファイル監視
    - [x] テスト作成
    - [x] 実装
    - [x] テストがパスすることを確認
- [x] clearCache: キャッシュクリア
    - [x] テスト作成
    - [x] 実装
    - [x] テストがパスすることを確認

## 4. テスト・検証
- [x] 各APIメソッドの単体テスト作成
- [x] テスト用プロジェクトでの動作検証
- [ ] 既存Python版との出力比較

## 5. ドキュメント整備
- [x] README.mdの作成・更新
- [ ] APIリファレンス作成
- [ ] 使用例・サンプルコード追加

## 6. 公開準備
- [ ] npm公開用設定（package.jsonなど）
- [ ] バージョニング・CHANGELOG作成
- [ ] ライセンス確認
- [ ] GitHubリポジトリ整備

---
必要に応じて手順を追加・修正してください。
