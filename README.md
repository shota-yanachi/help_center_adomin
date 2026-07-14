Help Center 管理ダッシュボード。Cloudflare Worker（`help-center-worker.js`、別プロジェクト）
経由で Zendesk Help Center API を操作する社内向け管理画面です。

## セットアップ

```bash
npm install
npm run dev
```

環境変数は不要です。Worker URLは実行時に⚙モーダルから入力してlocalStorageに保存する方式のため、
`.env`ファイルを用意する必要はありません。

`http://localhost:3000` を開くとパスワード認証画面が表示されます（パスワード: `miruto`）。
ログイン後、左サイドバー下部の「⚙ 接続設定」から **Worker URL**（`help-center-worker.js` を
デプロイした WorkerのURL）を入力してください（localStorageに保存されます）。

## 画面構成

- 左サイドバー（ダーク、幅170px）: カテゴリ→セクションのツリー（常時展開）。
  下部に「＋新規カテゴリ」「＋新規セクション」「⚙ 接続設定」。
- メインパネル: パンくず → 記事一覧（タイトル・ID・公開範囲バッジ・切替ボタン） →
  記事追加UI（左: 個別入力フォーム／右: JSON一括入力）。
- セクション未選択時・未接続時は案内文のみ表示。

## API 仕様（`help-center-worker.js`）

このダッシュボードが呼び出す Worker 側エンドポイントの詳細は `docs/worker-api.md` を参照してください。

概要:

| Method | Path | 必須クエリ | Body |
|---|---|---|---|
| GET | `/categories` | なし | なし |
| POST | `/categories` | なし | `{name,description?,locale?}` または配列 |
| GET | `/sections` | `categoryId` | なし |
| POST | `/sections` | `categoryId` | `{name,description?,locale?}` または配列 |
| GET | `/articles` | `sectionId` | なし |
| POST | `/articles` | `sectionId` | `{title,body?,label_names?,user_segment_id?,...}` または配列 |
| PATCH | `/articles` | `articleId` | 更新したいフィールドのみ（例: `{user_segment_id}`） |
| GET | `/user-segments` | なし | なし |

Worker自体は `X-API-Key` ヘッダーや `brandDomain` クエリにも対応していますが、本アプリの
⚙接続設定は現状 **Worker URLのみ**です（`DASHBOARD_API_KEY`未設定・単一ブランド運用が前提）。
`brandDomain`はサブドメインではなく`xxx.zendesk.com`のようなFQDNが必要な点に注意
（裸のサブドメインを渡すとZendesk側で403になることを確認済み）。将来これらが必要になったら
`lib/api.ts`・`components/SettingsModal.tsx`に入力欄を復活させてください。

配列で作成した場合のレスポンスは `{ created, results: [{status, input, response}] }` で、
1件ごとの成否は `results[].status` で判定します（本アプリはこれを解釈し、失敗件数を画面に表示します）。

---

以下は Next.js のデフォルトREADMEです。

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
# help_center_adomin
