"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as api from "@/lib/api";
import { ArticleInput } from "@/lib/api";
import { loadSettings, saveSettings } from "@/lib/storage";
import {
  Article,
  BulkCreateResponse,
  Category,
  ConnectionSettings,
  Section,
  UserSegment,
} from "@/lib/types";

type DashboardState = {
  settings: ConnectionSettings;
  updateSettings: (settings: ConnectionSettings) => void;
  isConfigured: boolean;

  categories: Category[];
  sectionsByCategory: Record<number, Section[]>;
  segments: UserSegment[];
  loadingTree: boolean;
  treeError: string | null;
  refreshTree: () => Promise<void>;

  selectedCategoryId: number | null;
  selectedSectionId: number | null;
  selectSection: (categoryId: number, sectionId: number) => void;

  articles: Article[];
  loadingArticles: boolean;
  articlesError: string | null;
  refreshArticles: () => Promise<void>;

  addCategory: (data: { name: string; description?: string }) => Promise<void>;
  addCategoriesBulk: (
    items: { name: string; description?: string }[]
  ) => Promise<BulkCreateResponse<Category>>;
  addSection: (
    categoryId: number,
    data: { name: string; description?: string }
  ) => Promise<void>;
  addSectionsBulk: (
    categoryId: number,
    items: { name: string; description?: string }[]
  ) => Promise<BulkCreateResponse<Section>>;
  addArticle: (data: ArticleInput) => Promise<void>;
  addArticlesBulk: (
    items: ArticleInput[]
  ) => Promise<BulkCreateResponse<Article>>;
  toggleArticleVisibility: (
    articleId: number,
    userSegmentId: number | null
  ) => Promise<void>;

  removeCategory: (categoryId: number) => Promise<void>;
  removeSection: (categoryId: number, sectionId: number) => Promise<void>;
  removeArticles: (
    articleIds: number[]
  ) => Promise<{ succeeded: number; failed: { id: number; message: string }[] }>;
};

const DashboardContext = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ConnectionSettings>({
    workerUrl: "",
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionsByCategory, setSectionsByCategory] = useState<
    Record<number, Section[]>
  >({});
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );

  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  useEffect(() => {
    // localStorageはサーバーに存在しないため、マウント後にクライアントで読み直す
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
    setSettingsLoaded(true);
  }, []);

  const updateSettings = useCallback((next: ConnectionSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const isConfigured = Boolean(settings.workerUrl);

  const refreshTree = useCallback(async () => {
    if (!isConfigured) return;
    setLoadingTree(true);
    setTreeError(null);
    try {
      const cats = await api.listCategories(settings);
      const entries = await Promise.all(
        cats.map(async (c) => [c.id, await api.listSections(settings, c.id)] as const)
      );
      const map: Record<number, Section[]> = {};
      for (const [id, sections] of entries) map[id] = sections;
      setCategories(cats);
      setSectionsByCategory(map);
      try {
        setSegments(await api.listUserSegments(settings));
      } catch {
        setSegments([]);
      }
    } catch (e) {
      setTreeError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoadingTree(false);
    }
  }, [settings, isConfigured]);

  useEffect(() => {
    if (settingsLoaded && isConfigured) {
      // 接続設定が変わるたびにツリーを再取得する（外部API同期のための意図的なeffect）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshTree();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded, settings.workerUrl]);

  const selectSection = useCallback((categoryId: number, sectionId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedSectionId(sectionId);
  }, []);

  const refreshArticles = useCallback(async () => {
    if (!selectedSectionId) return;
    setLoadingArticles(true);
    setArticlesError(null);
    try {
      setArticles(await api.listArticles(settings, selectedSectionId));
    } catch (e) {
      setArticlesError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoadingArticles(false);
    }
  }, [settings, selectedSectionId]);

  useEffect(() => {
    // 選択セクションが変わるたびに記事一覧を再取得する（外部API同期のための意図的なeffect）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedSectionId) refreshArticles();
    else setArticles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionId]);

  const addCategory = useCallback(
    async (data: { name: string; description?: string }) => {
      await api.createCategory(settings, data);
      await refreshTree();
    },
    [settings, refreshTree]
  );

  const addCategoriesBulk = useCallback(
    async (items: { name: string; description?: string }[]) => {
      const result = await api.createCategoriesBulk(settings, items);
      await refreshTree();
      return result;
    },
    [settings, refreshTree]
  );

  const addSection = useCallback(
    async (categoryId: number, data: { name: string; description?: string }) => {
      await api.createSection(settings, categoryId, data);
      await refreshTree();
    },
    [settings, refreshTree]
  );

  const addSectionsBulk = useCallback(
    async (
      categoryId: number,
      items: { name: string; description?: string }[]
    ) => {
      const result = await api.createSectionsBulk(settings, categoryId, items);
      await refreshTree();
      return result;
    },
    [settings, refreshTree]
  );

  const addArticle = useCallback(
    async (data: ArticleInput) => {
      if (!selectedSectionId) throw new Error("セクションが選択されていません");
      await api.createArticle(settings, selectedSectionId, data);
      await refreshArticles();
    },
    [settings, selectedSectionId, refreshArticles]
  );

  const addArticlesBulk = useCallback(
    async (items: ArticleInput[]) => {
      if (!selectedSectionId) throw new Error("セクションが選択されていません");
      const result = await api.createArticlesBulk(settings, selectedSectionId, items);
      await refreshArticles();
      return result;
    },
    [settings, selectedSectionId, refreshArticles]
  );

  const toggleArticleVisibility = useCallback(
    async (articleId: number, userSegmentId: number | null) => {
      await api.updateArticleVisibility(settings, articleId, userSegmentId);
      await refreshArticles();
    },
    [settings, refreshArticles]
  );

  const removeCategory = useCallback(
    async (categoryId: number) => {
      await api.deleteCategory(settings, categoryId);
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setSelectedSectionId(null);
      }
      await refreshTree();
    },
    [settings, selectedCategoryId, refreshTree]
  );

  const removeSection = useCallback(
    async (categoryId: number, sectionId: number) => {
      await api.deleteSection(settings, sectionId);
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
      await refreshTree();
    },
    [settings, selectedSectionId, refreshTree]
  );

  const removeArticles = useCallback(
    async (articleIds: number[]) => {
      const results = await Promise.allSettled(
        articleIds.map((id) => api.deleteArticle(settings, id))
      );
      const failed: { id: number; message: string }[] = [];
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          failed.push({
            id: articleIds[i],
            message: r.reason instanceof Error ? r.reason.message : String(r.reason),
          });
        }
      });
      await refreshArticles();
      return { succeeded: articleIds.length - failed.length, failed };
    },
    [settings, refreshArticles]
  );

  const value = useMemo<DashboardState>(
    () => ({
      settings,
      updateSettings,
      isConfigured,
      categories,
      sectionsByCategory,
      segments,
      loadingTree,
      treeError,
      refreshTree,
      selectedCategoryId,
      selectedSectionId,
      selectSection,
      articles,
      loadingArticles,
      articlesError,
      refreshArticles,
      addCategory,
      addCategoriesBulk,
      addSection,
      addSectionsBulk,
      addArticle,
      addArticlesBulk,
      toggleArticleVisibility,
      removeCategory,
      removeSection,
      removeArticles,
    }),
    [
      settings,
      updateSettings,
      isConfigured,
      categories,
      sectionsByCategory,
      segments,
      loadingTree,
      treeError,
      refreshTree,
      selectedCategoryId,
      selectedSectionId,
      selectSection,
      articles,
      loadingArticles,
      articlesError,
      refreshArticles,
      addCategory,
      addCategoriesBulk,
      addSection,
      addSectionsBulk,
      addArticle,
      addArticlesBulk,
      toggleArticleVisibility,
      removeCategory,
      removeSection,
      removeArticles,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardState {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
