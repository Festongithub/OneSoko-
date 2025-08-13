import { useState, useEffect, useCallback, useMemo } from 'react';
import { shopsAPI } from '../services/api';
import { Shop } from '../types';

interface SearchFilters {
  query: string;
  city: string;
  country: string;
  status: string;
}

interface SearchState {
  shops: Shop[];
  suggestions: Shop[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface UseShopSearchReturn extends SearchState {
  search: (filters: Partial<SearchFilters>) => Promise<void>;
  autocomplete: (query: string) => Promise<void>;
  quickSearch: (query: string) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  trending: Shop[];
  loadTrending: () => Promise<void>;
}

// Debounce utility
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Search results cache
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedResult = (key: string) => {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  searchCache.delete(key);
  return null;
};

const setCachedResult = (key: string, data: any) => {
  searchCache.set(key, { data, timestamp: Date.now() });
};

export const useShopSearch = (): UseShopSearchReturn => {
  const [state, setState] = useState<SearchState>({
    shops: [],
    suggestions: [],
    loading: false,
    error: null,
    hasMore: true,
    totalCount: 0,
  });

  const [trending, setTrending] = useState<Shop[]>([]);

  // Advanced search with caching
  const search = useCallback(async (filters: Partial<SearchFilters>) => {
    const cacheKey = `search_${JSON.stringify(filters)}`;
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      setState(prev => ({
        ...prev,
        shops: cached.shops,
        totalCount: cached.count,
        loading: false,
        error: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await shopsAPI.advancedSearch({
        q: filters.query,
        city: filters.city,
        country: filters.country,
        status: filters.status || 'active',
      });

      setCachedResult(cacheKey, result);

      setState(prev => ({
        ...prev,
        shops: result.shops,
        totalCount: result.count,
        loading: false,
        hasMore: false, // For simplicity, assuming single page results
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, []);

  // Autocomplete with debouncing
  const autocomplete = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    const cacheKey = `autocomplete_${query}`;
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      setState(prev => ({ ...prev, suggestions: cached.suggestions }));
      return;
    }

    try {
      const result = await shopsAPI.autocomplete(query);
      setCachedResult(cacheKey, result);
      
      setState(prev => ({
        ...prev,
        suggestions: result.suggestions,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Autocomplete failed',
      }));
    }
  }, []);

  // Quick search (used for instant results)
  const quickSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, shops: [], totalCount: 0 }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await shopsAPI.getPublicList({ search: query });
      
      setState(prev => ({
        ...prev,
        shops: result.shops,
        totalCount: result.count,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Quick search failed',
      }));
    }
  }, []);

  // Load trending shops
  const loadTrending = useCallback(async () => {
    const cacheKey = 'trending_shops';
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      setTrending(cached.trending_shops);
      return;
    }

    try {
      const result = await shopsAPI.getTrending();
      setCachedResult(cacheKey, result);
      setTrending(result.trending_shops);
    } catch (error) {
      console.error('Failed to load trending shops:', error);
    }
  }, []);

  // Clear functions
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      shops: [],
      suggestions: [],
      totalCount: 0,
      hasMore: true,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load trending shops on mount
  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  return {
    ...state,
    search,
    autocomplete,
    quickSearch,
    clearResults,
    clearError,
    trending,
    loadTrending,
  };
};

// Hook for debounced search
export const useDebouncedShopSearch = (query: string, delay: number = 300) => {
  const debouncedQuery = useDebounce(query, delay);
  const { autocomplete, suggestions, loading } = useShopSearch();

  useEffect(() => {
    if (debouncedQuery) {
      autocomplete(debouncedQuery);
    }
  }, [debouncedQuery, autocomplete]);

  return { suggestions, loading };
};
