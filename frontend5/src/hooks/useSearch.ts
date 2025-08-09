import { useState, useCallback } from 'react';
import { Post, User, SearchResults } from '@/types';
import { searchService } from '@/services/search.service';

interface SearchState {
  stories: Post[];
  people: User[];
  isLoading: boolean;
  error: string | null;
  hasMore: { [key: string]: boolean };
}

export const useSearch = (query: string) => {
  const [state, setState] = useState<SearchState>({
    stories: [],
    people: [],
    isLoading: false,
    error: null,
    hasMore: { stories: true, people: true },
  });

  const searchStories = useCallback(async (page = 1, limit = 10) => {
    if (!query) return { posts: [], totalCount: 0 };

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await searchService.searchStories(query, page, limit);
      
      if (page === 1) {
        setState(prev => ({
          ...prev,
          stories: response.data,
          hasMore: { ...prev.hasMore, stories: response.pagination.hasNext },
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          stories: [...prev.stories, ...response.data],
          hasMore: { ...prev.hasMore, stories: response.pagination.hasNext },
          isLoading: false,
        }));
      }

      return { posts: response.data, totalCount: response.pagination.totalItems };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search stories';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { posts: [], totalCount: 0 };
    }
  }, [query]);

  const searchPeople = useCallback(async (page = 1, limit = 10) => {
    if (!query) return { people: [], totalCount: 0 };

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await searchService.searchPeople(query, page, limit);
      
      if (page === 1) {
        setState(prev => ({
          ...prev,
          people: response.data,
          hasMore: { ...prev.hasMore, people: response.pagination.hasNext },
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          people: [...prev.people, ...response.data],
          hasMore: { ...prev.hasMore, people: response.pagination.hasNext },
          isLoading: false,
        }));
      }

      return { people: response.data, totalCount: response.pagination.totalItems };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search people';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { people: [], totalCount: 0 };
    }
  }, [query]);

  const globalSearch = useCallback(async (): Promise<SearchResults> => {
    if (!query) {
      return { posts: [], users: [], categories: [], total: 0 };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await searchService.globalSearch(query);
      
      setState(prev => ({
        ...prev,
        stories: response.posts,
        people: response.users,
        isLoading: false,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to perform global search';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { posts: [], users: [], categories: [], total: 0 };
    }
  }, [query]);

  const loadMore = useCallback((category: 'stories' | 'people') => {
    const currentLength = category === 'stories' ? state.stories.length : state.people.length;
    const page = Math.floor(currentLength / 10) + 1;
    
    if (category === 'stories') {
      searchStories(page);
    } else {
      searchPeople(page);
    }
  }, [state.stories.length, state.people.length, searchStories, searchPeople]);

  const clearSearch = useCallback(() => {
    setState({
      stories: [],
      people: [],
      isLoading: false,
      error: null,
      hasMore: { stories: true, people: true },
    });
  }, []);

  return {
    data: {
      stories: state.stories,
      people: state.people,
    },
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,
    searchStories,
    searchPeople,
    globalSearch,
    loadMore,
    clearSearch,
  };
}; 