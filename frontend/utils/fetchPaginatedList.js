/**
 * Generic paginated-list fetcher for the Insight API.
 *
 * All paginated endpoints follow the same response shape:
 *   { data: [...], total_count: number }
 *
 * @param {object} axiosInstance  - axiosPublicInstance or axiosPrivateInstance
 * @param {string} url            - API path
 * @param {object} params         - Query params (page, limit, q, …)
 * @param {string} [itemsKey='posts'] - Key to use in the returned object
 * @returns {{ [itemsKey]: any[], totalCount: number }}
 */
export const fetchPaginatedList = async (axiosInstance, url, params = {}, itemsKey = 'posts') => {
  const response = await axiosInstance.get(url, { params });
  const data = response.data;

  if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
    throw new Error(`Invalid response format from ${url}`);
  }

  return { [itemsKey]: data.data, totalCount: data.total_count };
};
