import { Post, User, PaginatedResponse, SearchResults } from '@/types';
import { axiosPublicInstance } from '@/lib/axios';



export const searchService = {
  async searchStories(query: string, page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const response = await axiosPublicInstance.get('/search/posts', {
        params: { q: query, page, limit },
      });

      const data = response.data;
      console.log('Search stories data:', data);

      // Check data format and return empty result if invalid
      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      return {
        data: data.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(data.total_count / limit),
          totalItems: data.total_count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(data.total_count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Return empty result instead of throwing error for better UX
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  },

  async searchPeople(query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await axiosPublicInstance.get('/search/users', {
        params: { q: query, page, limit },
      });

      const data = response.data;

      // Check data format and return empty result if invalid
      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      return {
        data: data.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(data.total_count / limit),
          totalItems: data.total_count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(data.total_count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching people:', error);
      // Return empty result instead of throwing error for better UX
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  },

  async globalSearch(query: string): Promise<SearchResults> {
    try {
      const [storiesResult, peopleResult] = await Promise.allSettled([
        this.searchStories(query, 1, 5),
        this.searchPeople(query, 1, 5),
      ]);

      const stories = storiesResult.status === 'fulfilled' ? storiesResult.value.data : [];
      const users = peopleResult.status === 'fulfilled' ? peopleResult.value.data : [];

      return {
        posts: stories,
        users: users,
        categories: [], // Categories search not implemented yet
        total: stories.length + users.length,
      };
    } catch (error) {
      console.error('Error in global search:', error);
      return {
        posts: [],
        users: [],
        categories: [],
        total: 0,
      };
    }
  },
}; 