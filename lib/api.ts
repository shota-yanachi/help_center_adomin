import {
  Article,
  BulkCreateResponse,
  Category,
  ConnectionSettings,
  Section,
  UserSegment,
} from "./types";

export class ApiError extends Error {}

function buildUrl(
  settings: ConnectionSettings,
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  if (!settings.workerUrl) {
    throw new ApiError("Worker URLが未設定です。⚙接続設定から入力してください。");
  }
  const base = settings.workerUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  settings: ConnectionSettings,
  path: string,
  init?: RequestInit,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = buildUrl(settings, path, params);
  const method = init?.method ?? "GET";

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (networkErr) {
    throw new ApiError(
      `${method} ${url} に接続できませんでした（ネットワークエラー / CORS / Workerが応答していない可能性があります）: ${
        networkErr instanceof Error ? networkErr.message : String(networkErr)
      }`
    );
  }

  const text = await res.text();
  // レスポンスがJSONでない場合（Cloudflareのエラーページ等）に備え、パース失敗を握りつぶす
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    const parsed =
      data && typeof data === "object"
        ? (data as { error?: string; description?: string })
        : undefined;
    const detail = parsed?.error || parsed?.description || text.slice(0, 300) || res.statusText;
    throw new ApiError(
      `${method} ${url} → ${res.status} ${res.statusText}: ${detail}`
    );
  }

  return data as T;
}

// --- カテゴリ ---

export function listCategories(settings: ConnectionSettings) {
  return request<{ categories: Category[] }>(settings, "/categories").then(
    (r) => r.categories
  );
}

export function createCategory(
  settings: ConnectionSettings,
  data: { name: string; description?: string; locale?: string }
) {
  return request<{ category: Category }>(settings, "/categories", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((r) => r.category);
}

export function createCategoriesBulk(
  settings: ConnectionSettings,
  items: { name: string; description?: string; locale?: string }[]
) {
  return request<BulkCreateResponse<Category>>(settings, "/categories", {
    method: "POST",
    body: JSON.stringify(items),
  });
}

export function deleteCategory(settings: ConnectionSettings, categoryId: number) {
  return request<{ deleted: boolean; categoryId: string }>(
    settings,
    "/categories",
    { method: "DELETE" },
    { categoryId }
  );
}

// --- セクション ---

export function listSections(settings: ConnectionSettings, categoryId: number) {
  return request<{ sections: Section[] }>(
    settings,
    "/sections",
    undefined,
    { categoryId }
  ).then((r) => r.sections);
}

export function createSection(
  settings: ConnectionSettings,
  categoryId: number,
  data: { name: string; description?: string; locale?: string }
) {
  return request<{ section: Section }>(
    settings,
    "/sections",
    { method: "POST", body: JSON.stringify(data) },
    { categoryId }
  ).then((r) => r.section);
}

export function createSectionsBulk(
  settings: ConnectionSettings,
  categoryId: number,
  items: { name: string; description?: string; locale?: string }[]
) {
  return request<BulkCreateResponse<Section>>(
    settings,
    "/sections",
    { method: "POST", body: JSON.stringify(items) },
    { categoryId }
  );
}

export function deleteSection(settings: ConnectionSettings, sectionId: number) {
  return request<{ deleted: boolean; sectionId: string }>(
    settings,
    "/sections",
    { method: "DELETE" },
    { sectionId }
  );
}

// --- 記事 ---

export type ArticleInput = {
  title: string;
  body?: string;
  locale?: string;
  label_names?: string[];
  user_segment_id?: number | null;
  permission_group_id?: number | null;
};

export function listArticles(settings: ConnectionSettings, sectionId: number) {
  return request<{ articles: Article[] }>(
    settings,
    "/articles",
    undefined,
    { sectionId }
  ).then((r) => r.articles);
}

export function createArticle(
  settings: ConnectionSettings,
  sectionId: number,
  data: ArticleInput
) {
  return request<{ article: Article }>(
    settings,
    "/articles",
    { method: "POST", body: JSON.stringify(data) },
    { sectionId }
  ).then((r) => r.article);
}

export function createArticlesBulk(
  settings: ConnectionSettings,
  sectionId: number,
  items: ArticleInput[]
) {
  return request<BulkCreateResponse<Article>>(
    settings,
    "/articles",
    { method: "POST", body: JSON.stringify(items) },
    { sectionId }
  );
}

export function deleteArticle(settings: ConnectionSettings, articleId: number) {
  return request<{ archived: boolean; articleId: string }>(
    settings,
    "/articles",
    { method: "DELETE" },
    { articleId }
  );
}

export function updateArticleVisibility(
  settings: ConnectionSettings,
  articleId: number,
  userSegmentId: number | null
) {
  return request<{ article: Article }>(
    settings,
    "/articles",
    { method: "PATCH", body: JSON.stringify({ user_segment_id: userSegmentId }) },
    { articleId }
  ).then((r) => r.article);
}

// --- ユーザーセグメント ---

export function listUserSegments(settings: ConnectionSettings) {
  return request<{ user_segments: UserSegment[] }>(
    settings,
    "/user-segments"
  ).then((r) => r.user_segments);
}
