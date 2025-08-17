// config/api.js
// export const BASE_API_URL_SIMPLE = 'https://insight.io.vn';
// export const BASE_API_URL = 'https://insight.io.vn/api';
// export const BASE_FE_URL = 'https://insight.io.vn';

// export const BASE_API_URL_SIMPLE = 'http://localhost:82';
// export const BASE_API_URL = 'http://localhost:81';
// export const BASE_FE_URL = 'http://localhost:3000';

export const BASE_API_URL_SIMPLE = process.env.NEXT_PUBLIC_BASE_API_URL_SIMPLE;
export const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
export const BASE_AIAPI_URL = process.env.NEXT_PUBLIC_BASE_AIAPI_URL;
export const BASE_FE_URL = process.env.NEXT_PUBLIC_BASE_FE_URL;
// BASE_AUTH_API_URL removed - auth merged into application service



