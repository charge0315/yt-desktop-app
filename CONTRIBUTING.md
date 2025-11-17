# Contributing Guide

このプロジェクトへの貢献を歓迎します！

## 開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/charge0315/yt-desktop-app.git
cd yt-desktop-app
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集してGoogle認証情報とMongoDB URIを設定
```

4. MongoDBを起動（ローカルの場合）
```bash
mongod
```

5. 開発モードで起動
```bash
npm run dev
```

## コーディング規約

- TypeScriptの厳格な型チェックを使用
- ESLintの規則に従う
- 意味のある変数名とコメントを使用
- 各機能には適切なエラーハンドリングを実装

## ビルドとテスト

```bash
# ビルド
npm run build

# リント
npm run lint

# テスト
npm test
```

## コミットメッセージ

わかりやすいコミットメッセージを使用してください：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードフォーマット
- `refactor:` リファクタリング
- `test:` テスト追加・修正
- `chore:` ビルドプロセスやツールの変更

例：
```
feat: Add video search functionality
fix: Fix token refresh issue
docs: Update API documentation
```

## プルリクエスト

1. 新しいブランチを作成
```bash
git checkout -b feature/your-feature-name
```

2. 変更をコミット
```bash
git commit -m "feat: Add new feature"
```

3. プッシュしてプルリクエストを作成
```bash
git push origin feature/your-feature-name
```

## 問題の報告

バグや機能リクエストはGitHub Issuesで報告してください。

以下の情報を含めてください：
- 問題の詳細な説明
- 再現手順
- 期待される動作
- 実際の動作
- 環境情報（OS、Node.jsバージョンなど）

## ライセンス

このプロジェクトに貢献することで、あなたの貢献がMITライセンスの下でライセンスされることに同意したものとみなされます。
