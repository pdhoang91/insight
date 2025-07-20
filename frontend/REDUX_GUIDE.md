# Hướng dẫn sử dụng Redux trong ứng dụng Insight

## Giới thiệu

Ứng dụng Insight sử dụng Redux để quản lý state một cách hiệu quả. Redux giúp chúng ta quản lý state tập trung, dễ dàng debug và mở rộng ứng dụng.

## Cấu trúc Redux

### Store

Store là nơi lưu trữ state của ứng dụng. Chúng ta đã cấu hình store trong file `redux/store.js`.

```javascript
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import postReducer from './slices/postSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    post: postReducer,
  },
  // Cấu hình middleware...
});
```

### Slices

Chúng ta sử dụng Redux Toolkit để tạo các slice, mỗi slice quản lý một phần của state:

1. **userSlice**: Quản lý thông tin người dùng và authentication
2. **uiSlice**: Quản lý trạng thái UI như modals, sidebar, theme, toast
3. **postSlice**: Quản lý dữ liệu bài viết và pagination

### Custom Hooks

Để dễ dàng sử dụng Redux trong các component, chúng ta đã tạo các custom hooks:

1. **useReduxAuth**: Hook để quản lý authentication
2. **useReduxUI**: Hook để quản lý UI
3. **useReduxPosts**: Hook để quản lý bài viết

## Lớp tương thích

Để đảm bảo tương thích với code cũ, chúng ta đã tạo các lớp tương thích:

1. **AppContext/useApp**: Sử dụng Redux bên trong nhưng cung cấp API giống với useApp cũ
2. **UserContext/useUser**: Sử dụng Redux bên trong nhưng cung cấp API giống với useUser cũ
3. **PostContext/usePostContext**: Sử dụng Redux bên trong nhưng cung cấp API giống với usePostContext cũ

Các lớp tương thích này giúp chúng ta chuyển đổi dần dần từ Context API sang Redux mà không cần phải cập nhật tất cả các component cùng một lúc.

### Ví dụ về lớp tương thích

```javascript
// context/UserContext.js
export const useUser = () => {
  // Sử dụng Redux hooks bên trong
  const { user, loading, login } = useReduxAuth();
  const { openModal } = useReduxUI();
  
  // Trả về đối tượng có cùng API với useUser cũ
  return {
    user,
    loading,
    setUser: login,
    setModalOpen: (isOpen) => openModal('login')
  };
};
```

## Cách sử dụng

### Authentication

```javascript
import { useReduxAuth } from '../hooks/useReduxAuth';

function MyComponent() {
  const { user, loading, login, logout } = useReduxAuth();
  
  // Kiểm tra người dùng đã đăng nhập chưa
  if (!user) {
    return <p>Vui lòng đăng nhập</p>;
  }
  
  // Đăng xuất
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div>
      <p>Xin chào, {user.username}</p>
      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
}
```

### UI Management

```javascript
import { useReduxUI } from '../hooks/useReduxUI';

function MyComponent() {
  const { 
    modals, 
    openModal, 
    closeModal, 
    displayToast 
  } = useReduxUI();
  
  // Mở modal đăng nhập
  const handleOpenLoginModal = () => {
    openModal('login');
  };
  
  // Hiển thị thông báo
  const handleShowToast = () => {
    displayToast('Thao tác thành công!', 'success');
  };
  
  return (
    <div>
      <button onClick={handleOpenLoginModal}>Đăng nhập</button>
      <button onClick={handleShowToast}>Hiển thị thông báo</button>
    </div>
  );
}
```

### Post Management

```javascript
import { useEffect } from 'react';
import { useReduxPosts } from '../hooks/useReduxPosts';

function PostsList() {
  const { 
    posts, 
    loading, 
    loadPosts, 
    loadMorePosts, 
    hasMore 
  } = useReduxPosts('ForYou');
  
  // Load bài viết khi component mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);
  
  if (loading && posts.length === 0) {
    return <p>Đang tải...</p>;
  }
  
  return (
    <div>
      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
      
      {hasMore && (
        <button 
          onClick={loadMorePosts} 
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Tải thêm'}
        </button>
      )}
    </div>
  );
}
```

## Async Thunks

Redux Toolkit cung cấp `createAsyncThunk` để xử lý các tác vụ bất đồng bộ. Chúng ta đã sử dụng nó trong các slice:

```javascript
// Ví dụ từ userSlice.js
export const initializeUser = createAsyncThunk(
  'user/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Kiểm tra token trong localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      // Lấy thông tin người dùng
      const userProfile = await getUserProfile();
      return userProfile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Selectors

Selectors giúp chúng ta truy xuất dữ liệu từ Redux store một cách hiệu quả:

```javascript
// Ví dụ từ userSlice.js
export const selectUser = (state) => state.user.user;
export const selectUserLoading = (state) => state.user.loading;

// Sử dụng trong component
const user = useSelector(selectUser);
```

## Memoization

Để tối ưu hiệu suất, chúng ta sử dụng `useCallback` và `useMemo` trong các custom hooks:

```javascript
// Ví dụ từ useReduxPosts.js
const loadMorePosts = useCallback((limit = 10) => {
  if (loading || !pagination.hasMore) return;
  
  const nextPage = pagination.page + 1;
  dispatch(fetchPosts({ 
    type: activeType, 
    page: nextPage, 
    limit 
  }));
}, [dispatch, activeType, pagination, loading]);
```

## Kế hoạch chuyển đổi

Để hoàn thành việc chuyển đổi từ Context API sang Redux, chúng ta nên:

1. **Giai đoạn 1**: Sử dụng các lớp tương thích để đảm bảo ứng dụng vẫn hoạt động
2. **Giai đoạn 2**: Dần dần cập nhật các component để sử dụng Redux hooks trực tiếp
3. **Giai đoạn 3**: Loại bỏ các lớp tương thích khi không còn component nào sử dụng chúng

## Debugging

Để debug Redux, bạn có thể sử dụng Redux DevTools Extension trong trình duyệt. Extension này cho phép bạn theo dõi các actions, state changes và time-travel debugging.

## Kết luận

Redux giúp chúng ta quản lý state một cách hiệu quả trong ứng dụng Insight. Bằng cách sử dụng Redux Toolkit và các custom hooks, chúng ta có thể dễ dàng truy cập và cập nhật state từ bất kỳ component nào trong ứng dụng. 