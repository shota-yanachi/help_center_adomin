# Help Center Worker API ドキュメント

`help-center-worker.js` が提供するAPIの仕様書です。全エンドポイント共通の事項を先に説明し、その後エンドポイントごとに詳細を記載します。

---

## 共通仕様

### ベースURL
```
https://<あなたのWorkerのサブドメイン>.workers.dev
```

### 認証
全エンドポイント（`OPTIONS`を除く）で、リクエストヘッダーに以下が必要です。

```
X-API-Key: <DASHBOARD_API_KEYに設定した値>
```

- `DASHBOARD_API_KEY`をWorkerの環境変数として設定していない場合、このチェックはスキップされます（誰でも呼び出せる状態になるので注意）
- 一致しない場合は `401 Unauthorized` が返ります

```json
{ "error": "Unauthorized: invalid or missing X-API-Key header" }
```

### Content-Type
body を送るリクエスト（POST/PATCH）は、必ず以下のヘッダーを付与してください。
```
Content-Type: application/json
```

### 共通クエリパラメータ: `brandDomain`
マルチブランド構成の場合、接続先ブランドのドメインを明示的に指定できます。省略時は環境変数 `ZD_SUBDOMAIN` から組み立てたデフォルトブランドが使われます。

```
?brandDomain=brand2.zendesk.com
```

（`/brands`のみ、常にデフォルトブランドの接続先を使うため対象外です）

### CORS
すべてのレスポンスに以下が付与されます。ブラウザから直接fetchする前提の設計です。
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
```

### エラーレスポンスの形式
Worker自体が検知したエラー（必須パラメータ不足など）:
```json
{ "error": "categoryId query param is required" }
```

Zendesk側が返したバリデーションエラーは、Zendeskのレスポンスがそのまま透過されます:
```json
{
  "error": "RecordInvalid",
  "description": "Record validation errors",
  "details": {
    "name": [{ "description": "空白にできません", "error": "BlankValue" }]
  }
}
```

---

## 1. カテゴリ一覧取得

```
GET /categories
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**レスポンス例（200）**
```json
{
  "categories": [
    { "id": 5506621409950, "name": "子猫・早期(0〜6ヶ月)", "description": "...", "locale": "ja" }
  ]
}
```

---

## 2. カテゴリ作成

```
POST /categories
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody（単一作成）**
```json
{
  "locale": "ja",
  "name": "カテゴリ名",
  "description": "説明文（省略可）"
}
```

**リクエストBody（複数一括作成）** — 配列で送ると自動的にforループで1件ずつ登録されます
```json
[
  { "locale": "ja", "name": "カテゴリ名1", "description": "説明1" },
  { "locale": "ja", "name": "カテゴリ名2", "description": "説明2" }
]
```

| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---|---|---|
| `locale` | string | 任意 | `"ja"` | 言語ロケール |
| `name` | string | **必須** | - | カテゴリ名（空だとZendesk側でエラー） |
| `description` | string | 任意 | `""` | 説明文 |

**レスポンス（単一で送った場合）** — Zendeskのレスポンスをそのまま返す
```json
{ "category": { "id": 5506621409950, "name": "カテゴリ名", "description": "...", "locale": "ja", ... } }
```

**レスポンス（配列で送った場合）**
```json
{
  "created": 2,
  "results": [
    { "status": 201, "input": { "...": "..." }, "response": { "category": { "id": 111, "...": "..." } } },
    { "status": 201, "input": { "...": "..." }, "response": { "category": { "id": 112, "...": "..." } } }
  ]
}
```
- `results[].status` はZendesk APIから返ったHTTPステータス（成功なら201）
- 1件が失敗しても他の件の処理は止まりません。`results`を見て失敗件を確認してください

---

## 3. カテゴリ削除

```
DELETE /categories?categoryId=xxxx
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `categoryId` | **必須** | 削除対象のカテゴリID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody** — 不要

> ⚠️ **警告**: カテゴリを削除すると、**配下の全セクション・全記事も完全に削除されます**（Zendesk側の仕様）。この操作は取り消せません。

**レスポンス例（200）** — Zendeskは成功時 `204 No Content`（bodyなし）を返すため、Worker側で整形して返します
```json
{ "deleted": true, "categoryId": "5506621409950" }
```

---

## 4. セクション一覧取得

```
GET /sections
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `categoryId` | **必須** | 対象カテゴリのID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

`categoryId`が無い場合: `400 { "error": "categoryId query param is required" }`

**レスポンス例（200）**
```json
{
  "sections": [
    { "id": 5506622925982, "name": "ワクチンについて", "description": "...", "locale": "ja" }
  ]
}
```

---

## 5. セクション作成

```
POST /sections?categoryId=xxxx
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `categoryId` | **必須** | 紐付け先のカテゴリID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody** — カテゴリ作成と同一構造（単一 or 配列）
```json
[
  { "locale": "ja", "name": "セクション名", "description": "説明文" }
]
```

| フィールド | 型 | 必須 | デフォルト |
|---|---|---|---|
| `locale` | string | 任意 | `"ja"` |
| `name` | string | **必須** | - |
| `description` | string | 任意 | `""` |

**レスポンス** — カテゴリ作成と同一形式（単一なら`{ "section": {...} }`、配列なら`{ "created": N, "results": [...] }`）

---

## 6. セクション削除

```
DELETE /sections?sectionId=xxxx
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `sectionId` | **必須** | 削除対象のセクションID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody** — 不要

> ⚠️ **警告**: セクションを削除すると、**配下の全記事もアーカイブされます**（Zendesk側の仕様）。

**レスポンス例（200）**
```json
{ "deleted": true, "sectionId": "5506622925982" }
```

---

## 7. 記事一覧取得

```
GET /articles
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `sectionId` | **必須** | 対象セクションのID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**レスポンス例（200）**
```json
{
  "articles": [
    {
      "id": 98765,
      "title": "子猫のワクチンはいつ受ける？",
      "body": "<p>...</p>",
      "locale": "ja",
      "user_segment_id": null,
      "permission_group_id": null,
      "label_names": ["子猫", "ワクチン"]
    }
  ]
}
```
- `user_segment_id` が `null` の記事は「全員に公開（Everyone）」
- 数値が入っている記事は、そのセグメントに属するサインインユーザーのみ閲覧可能

---

## 8. 記事作成

```
POST /articles?sectionId=xxxx
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `sectionId` | **必須** | 紐付け先のセクションID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody（単一）**
```json
{
  "title": "記事タイトル",
  "body": "<p>本文（HTML）</p>",
  "locale": "ja",
  "user_segment_id": null,
  "permission_group_id": null,
  "label_names": ["タグ1", "タグ2"]
}
```

**リクエストBody（複数一括）**
```json
[
  { "title": "記事1", "body": "<p>本文1</p>", "locale": "ja", "user_segment_id": null },
  { "title": "記事2", "body": "<p>本文2</p>", "locale": "ja", "user_segment_id": null }
]
```

| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---|---|---|
| `title` | string | **必須** | - | 記事タイトル（空だとZendesk側でエラー） |
| `body` | string (HTML) | 任意 | `""` | 本文 |
| `locale` | string | 任意 | `"ja"` | 言語ロケール |
| `user_segment_id` | number \| null | 任意 | `null` | `null`=全員公開。数値=そのセグメント限定 |
| `permission_group_id` | number \| null | 任意 | `null` | `null`の場合Zendesk側はAdmins扱いになる |
| `label_names` | string[] | 任意 | `[]` | ラベル（タグ）配列 |

**レスポンス** — カテゴリ/セクション作成と同一形式（単一なら`{ "article": {...} }`、配列なら`{ "created": N, "results": [...] }`）

---

## 9. 記事の部分更新（公開範囲の変更など）

```
PATCH /articles?articleId=xxxx
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `articleId` | **必須** | 更新対象の記事ID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody** — 更新したいフィールドのみでOK（内部でZendeskの`PUT /articles/{id}.json`にそのまま渡されます）

全員公開にする場合:
```json
{ "user_segment_id": null }
```

特定セグメント限定にする場合:
```json
{ "user_segment_id": 12345678 }
```

本文だけ更新する場合:
```json
{ "body": "<p>更新後の本文</p>" }
```

**レスポンス例（200）**
```json
{ "article": { "id": 98765, "user_segment_id": null, "...": "..." } }
```

---

## 10. 記事削除（アーカイブ）

```
DELETE /articles?articleId=xxxx
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `articleId` | **必須** | 削除対象の記事ID |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody** — 不要

> ⚠️ **注意（カテゴリ/セクション削除との違い）**: Zendesk側の実際の仕様上、記事のDELETEは**完全削除ではなく「アーカイブ」（論理削除）**です。
> - アーカイブされた記事はHelp Center上には表示されなくなり、AI Agentのナレッジソースからも参照されなくなります
> - ただし完全には消えておらず、**Zendesk管理画面（Guide admin > アーカイブ済み記事）から復元・完全削除が可能**です
> - 完全に削除したい場合は、このAPIを叩いた後、Zendesk管理画面側で改めて完全削除の操作が必要です

**レスポンス例（200）** — Zendeskは成功時 `204 No Content`（bodyなし）を返すため、Worker側で整形して返します
```json
{ "archived": true, "articleId": "98765" }
```

---

## 11. セクション/カテゴリ配下の記事を一括で公開範囲変更

```
POST /bulk-visibility
```

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `sectionId` | `categoryId`と排他で必須 | 対象セクションのID（この配下の記事のみ変更） |
| `categoryId` | `sectionId`と排他で必須 | 対象カテゴリのID（配下の全セクションの記事を変更） |
| `userSegmentId` | **必須** | 変更後の値。文字列`"null"`を渡すと全員公開になる |
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**リクエストBody** — 不要（空でよい）

**実行例（全員公開に一括変更）**
```
POST /bulk-visibility?sectionId=5506622925982&userSegmentId=null
```

**実行例（特定セグメント限定に一括変更）**
```
POST /bulk-visibility?categoryId=5506621409950&userSegmentId=12345678
```

**レスポンス例（200）**
```json
{
  "updated": 3,
  "results": [
    { "articleId": 98765, "status": 200 },
    { "articleId": 98766, "status": 200 },
    { "articleId": 98767, "status": 200 }
  ]
}
```

**注意点**
- `categoryId`指定時は、内部で「配下の全セクション取得 → 各セクションの全記事取得 → 1件ずつPUT」を順に実行するため、記事数が多いとレスポンスが返るまで時間がかかります
- 途中で失敗した記事があっても処理は止まりません。`results`で個別のstatusを確認してください

---

## 12. ユーザーセグメント一覧取得

```
GET /user-segments
```

記事の公開範囲（`user_segment_id`）に指定できる、実際に存在するセグメントの一覧を取得します。決め打ちのIDを使わず、ここで取得したIDを使うようにしてください。

**クエリパラメータ**
| パラメータ | 必須 | 説明 |
|---|---|---|
| `brandDomain` | 任意 | 接続先ブランドの上書き |

**レスポンス例（200）**
```json
{
  "user_segments": [
    { "id": 12345678, "name": "サインインユーザー", "built_in": true },
    { "id": 23456789, "name": "VIP顧客限定", "built_in": false }
  ]
}
```

---

## 13. ブランド一覧取得

```
GET /brands
```

将来のマルチブランド対応時、選択肢として使うためのエンドポイントです。常にデフォルトブランド（`ZD_SUBDOMAIN`）に接続するため、`brandDomain`クエリは効きません。

**レスポンス例（200）**
```json
{
  "brands": [
    { "id": 1, "name": "デフォルトブランド", "subdomain": "miruto-app-sandbox", "default": true }
  ]
}
```

---

## エンドポイント早見表

| Method | Path | 必須クエリ | Body | 備考 |
|---|---|---|---|---|
| GET | `/categories` | なし | なし | |
| POST | `/categories` | なし | `{locale,name,description}` または配列 | |
| DELETE | `/categories` | `categoryId` | なし | 配下も含めて完全削除 |
| GET | `/sections` | `categoryId` | なし | |
| POST | `/sections` | `categoryId` | `{locale,name,description}` または配列 | |
| DELETE | `/sections` | `sectionId` | なし | 配下の記事もアーカイブ |
| GET | `/articles` | `sectionId` | なし | |
| POST | `/articles` | `sectionId` | `{title,body,locale,user_segment_id,permission_group_id,label_names}` または配列 | |
| PATCH | `/articles` | `articleId` | 更新したいフィールドのみ | |
| DELETE | `/articles` | `articleId` | なし | **完全削除ではなくアーカイブ** |
| POST | `/bulk-visibility` | `sectionId` または `categoryId`, `userSegmentId` | なし | |
| GET | `/user-segments` | なし | なし | |
| GET | `/brands` | なし | なし | |

すべて `brandDomain` をオプション付与可能。全エンドポイント `X-API-Key` ヘッダー必須（`DASHBOARD_API_KEY`未設定時のみ任意）。

> 本ダッシュボード（help-center-admin）が実際に利用しているのは 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12 です。11, 13 は現時点でUIから未使用（将来の拡張余地として記載）。
> なお本アプリの⚙接続設定は現状Worker URLのみで、`X-API-Key`/`brandDomain`は送信していません（[README](../README.md)参照）。
