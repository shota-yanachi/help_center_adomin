export type Category = {
  id: number;
  name: string;
  description?: string;
  locale?: string;
};

export type Section = {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  locale?: string;
};

export type Article = {
  id: number;
  section_id: number;
  title: string;
  body?: string;
  locale?: string;
  label_names?: string[];
  /** null = 全員に公開(Everyone)。値がある場合は該当セグメントのみ公開。 */
  user_segment_id?: number | null;
  permission_group_id?: number | null;
};

export type UserSegment = {
  id: number;
  name: string;
  built_in?: boolean;
};

/** POST /categories, /sections, /articles の配列一括作成レスポンス内の1件分 */
export type BulkItemResult<T> = {
  status: number;
  input: unknown;
  response: { category?: T; section?: T; article?: T; error?: string; description?: string };
};

export type BulkCreateResponse<T> = {
  created: number;
  results: BulkItemResult<T>[];
};

export type ConnectionSettings = {
  workerUrl: string;
};

export const EMPTY_SETTINGS: ConnectionSettings = {
  workerUrl: "",
};
