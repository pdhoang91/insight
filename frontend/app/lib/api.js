const API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_BASE_API_URL;

async function fetchAPI(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAllPostSlugs() {
  const data = await fetchAPI('/posts?limit=1000&page=1');
  return (data.data || []).map((p) => p.slug).filter(Boolean);
}

export async function fetchPostBySlug(slug) {
  const data = await fetchAPI(`/p/${slug}`);
  return data?.data?.post || null;
}

export async function fetchPosts(page = 1, limit = 10) {
  const data = await fetchAPI(`/posts?page=${page}&limit=${limit}`);
  return { posts: data.data || [], total: data.total_count || 0 };
}

export async function fetchPopularPosts(limit = 5) {
  const data = await fetchAPI(`/posts/popular?limit=${limit}`);
  return data.data || [];
}

export async function fetchRecentPosts(limit = 5) {
  const data = await fetchAPI(`/posts/recent?limit=${limit}`);
  return data.data || [];
}

export async function fetchCategories(limit = 50) {
  const data = await fetchAPI(`/categories?limit=${limit}`);
  return data.data || [];
}

export async function fetchPopularCategories(limit = 10) {
  const data = await fetchAPI(`/categories/popular?limit=${limit}`);
  return data.data || [];
}

export async function fetchPostsByCategory(name, page = 1, limit = 10) {
  const data = await fetchAPI(
    `/categories/${encodeURIComponent(name)}/posts?page=${page}&limit=${limit}`
  );
  return { posts: data.data || [], total: data.total_count || 0 };
}

export async function fetchPostsByYearMonth(year, month, page = 1, limit = 20) {
  const data = await fetchAPI(
    `/archive/${year}/${month}?page=${page}&limit=${limit}`
  );
  return { posts: data.data || [], total: data.total_count || 0 };
}

export async function fetchPopularTags(limit = 20) {
  const data = await fetchAPI(`/tags/popular?limit=${limit}`);
  return data.data || [];
}

export async function fetchHomeData() {
  const data = await fetchAPI('/home');
  return data?.data || { latest_posts: [], popular_posts: [], categories: [], total_posts: 0 };
}
