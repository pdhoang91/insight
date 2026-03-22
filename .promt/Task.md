DEEP FRONTEND ARCHITECTURE & PERFORMANCE REVIEW
A. Executive Summary
Đánh giá tổng thể: 5.5/10

Điểm mạnh
ISR hybrid tốt cho trang chính: Home (revalidate=120) và Post detail (revalidate=60) dùng server-fetch + SWR fallbackData — pattern đúng
Comment lazy-load replies: Replies chỉ fetch khi user mở rộng — tiết kiệm bandwidth
Cursor-based pagination cho comments — scalable, không bị drift khi có comment mới
Dynamic import cho editor: PostForm và PublishPanel dùng next/dynamic với ssr: false — editor không ảnh hưởng trang đọc... trên lý thuyết (xem bottleneck #1)
Image format optimization: next.config.js cấu hình WebP/AVIF
Điểm yếu nghiêm trọng
TipTap + lowlight bundle leak vào trang đọc — đây là vấn đề lớn nhất
Font loading chặn render — 3 external CSS @import không dùng next/font
Hình ảnh cover dùng <img> thay vì next/image — không optimize, không responsive sizing
Framer Motion bao bọc mọi post item trong infinite scroll — heavy cho long lists
Thiếu global SWR config, không có Web Vitals, không có bundle analyzer
Top 5 ưu tiên
Loại bỏ TipTap/lowlight khỏi trang đọc → giảm ~200-400KB JS
Chuyển font sang next/font → cải thiện FCP 200-500ms
Dùng next/image cho cover images → giảm layout shift, tăng LCP
Giảm Framer Motion trên infinite scroll lists → giảm CPU/RAM trên mobile
Truyền fallbackData vào usePostName → loại bỏ fetch thừa trên post page
B. Major Performance Bottlenecks
Bottleneck #1: TipTap + highlight.js leak vào mọi trang post detail
Vấn đề: PostDetail.js import renderPostContent → tiptapExtensions.js → load toàn bộ TipTap stack (18 extensions) + lowlight với createLowlight(common) (40+ ngôn ngữ highlight.js)
Tại sao nghiêm trọng: Đây là code chỉ cần cho editor, nhưng đang ship vào mọi trang đọc bài viết. Ước tính ~200-400KB JS (gzipped ~60-120KB). Mỗi lần user đọc 1 bài = parse + execute toàn bộ TipTap stack
Likely impact: +500ms-1s Time to Interactive trên mobile, LCP delay đáng kể
Severity: HIGH

renderContent.js
Lines 1-2
import { generateHTML } from '@tiptap/html';
import { getExtensions } from './tiptapExtensions';

tiptapExtensions.js
Lines 22-24
import { common, createLowlight } from 'lowlight'
const lowlight = createLowlight(common)
Bottleneck #2: Font loading chặn first paint
Vấn đề: 3 external CSS @import trong globals.css — Fontshare, Google Fonts (x2). CSS @import là render-blocking — browser phải download CSS → parse → phát hiện thêm font files → download fonts
Tại sao nghiêm trọng: Tạo chuỗi waterfall: HTML → CSS → font CSS → font files. User thấy blank/FOUT trong 500ms-2s tùy connection
Likely impact: FCP bị delay 300-800ms trên 3G/4G
Severity: HIGH

globals.css
Lines 3-8
@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
Bottleneck #3: Cover images dùng <img> thay vì next/image
Vấn đề: BasePostItem (dùng trong feed chính, category, tag, search...) dùng plain <img> cho cover images. Không có responsive sizing, không optimize format, không có width/height → layout shift
Tại sao nghiêm trọng: Feed chính có infinite scroll → load hàng chục ảnh cover full-size. Trên mobile 3G, mỗi ảnh có thể 200-500KB thay vì 30-50KB nếu dùng next/image resize
Likely impact: CLS > 0.1 (fail Core Web Vitals), bandwidth lãng phí 5-10x
Severity: HIGH

BasePostItem.js
Lines 191-199
<img
  src={post.cover_image}
  alt=""
  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
  loading="lazy"
  className="group-hover:scale-105"
/>
Bottleneck #4: Framer Motion trên mọi item trong infinite scroll
Vấn đề: PostList wrap mỗi post item trong motion.div với stagger animation. Khi infinite scroll load thêm → toàn bộ list re-animate. motion.div tạo 1 component wrapper + animation observer cho mỗi item
Tại sao nghiêm trọng: Sau 50+ posts (scroll nhiều), có 50+ Framer Motion instances active. Trên điện thoại cũ = jank, frame drops, memory leak tiềm ẩn
Likely impact: Scroll jank rõ rệt sau 30-50 posts trên mid-range mobile
Severity: MEDIUM-HIGH

PostList.js
Lines 143-159
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {flatPosts.map((post, index) => (
            <React.Fragment key={`${post.id}-${index}`}>
              <motion.div variants={itemVariants}>
                <BasePostItem post={post} variant={variant} />
              </motion.div>
              {interstitial &&
                index === interstitial.afterIndex &&
                flatPosts.length > interstitial.afterIndex + 1 &&
                interstitial.element}
            </React.Fragment>
          ))}
        </motion.div>
Bottleneck #5: Post page fetch thừa — không dùng fallbackData
Vấn đề: PostPageClient nhận initialPost từ server nhưng usePostName(slug) không nhận fallbackData. SWR sẽ fire 1 client-side fetch ngay lập tức dù đã có data
Tại sao nghiêm trọng: Mỗi page view = 1 fetch thừa. Multiply với traffic = double API load + wasted bandwidth
Likely impact: 1 redundant API call per post view
Severity: MEDIUM

PostPageClient.js
Lines 9-11
export default function PostPageClient({ slug, initialPost }) {
  const commentSectionRef = useRef(null);
  const { post, isLoading, isError, mutate } = usePostName(slug);
usePostName không có option fallbackData:


usePost.js
Lines 16-24
export const usePostName = (slug) => {
  const { data, error, mutate } = useSWR(
    slug ? `/p/${slug}` : null,
    () => getPostBySlug(slug),
    {
      dedupingInterval: 30000,
      revalidateOnFocus: false,
    }
  );
Bottleneck #6: Duplicate icon libraries
Vấn đề: Dùng cả @phosphor-icons/react VÀ react-icons. CommentItem import FaUser từ react-icons/fa trong khi toàn bộ codebase khác dùng Phosphor
Tại sao nghiêm trọng: Ship 2 icon bundles. react-icons/fa pull cả Font Awesome subset
Likely impact: +20-40KB JS thừa
Severity: MEDIUM
Bottleneck #7: O(n²) deduplication trong comments
Vấn đề: useInfiniteComments dùng .filter((item, index, arr) => arr.findIndex(...)) — O(n²) dedup
Severity: LOW (vì comment count thường < 100, nhưng nên fix)

useInfiniteComments.js
Lines 37-41
  const comments = data
    ? data
        .flatMap(page => page.data || [])
        .filter((item, index, arr) => arr.findIndex(i => i.id === item.id) === index)
    : [];
C. Rendering and Data-Loading Issues
C1. Rendering Strategy Problems
Trang	Hiện tại	Vấn đề	Nên
Home	ISR 120s + SWR	OK	Giữ nguyên
Post detail	ISR 60s + SWR	SWR fetch thừa vì thiếu fallbackData	Truyền fallbackData vào hook
Category /category/[name]	Pure client	Không có initial data, user thấy skeleton	ISR hoặc SSR initial page
Tag /tag/[name]	Pure client	Tương tự	ISR hoặc SSR initial page
Archive	Pure client	Tương tự	SSR hoặc ISR
Profile	Pure client	Chấp nhận được — content private/dynamic	Giữ nguyên
Search	Pure client	OK — search phải dynamic	Giữ nguyên
Vấn đề chính: Category và tag pages là những trang SEO-critical nhưng lại hoàn toàn client-rendered. Google crawl sẽ thấy skeleton, không thấy content.

C2. Client/Server Boundary Issues
ClientProviders bọc toàn bộ app:


ClientProviders.js
Lines 13-44
export default function ClientProviders({ children }) {
  const { user, setUser, loading, mutate } = useAuth();
  // ...
  return (
    <PostProvider>
      <UserContext.Provider value={{ user, setUser, setModalOpen, loading, mutate }}>
        <GrainOverlay />
        <FrogScrollbar />
        <header className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </header>
        <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        <main role="main">{children}</main>
      </UserContext.Provider>
    </PostProvider>
  );
}
Điều này không sai per se (children vẫn có thể là Server Components), nhưng:

GrainOverlay, FrogScrollbar, LoginModal luôn mount trên mọi trang — kể cả trang không cần
useAuth() fire trên mọi page navigation → 1 API call kiểm tra auth
LoginModal render (hidden) trên mọi trang
C3. Data-Fetching Inefficiencies
Duplicate service functions: getPostsByCategory tồn tại trong cả postService.js và categoryService.js — confusing, potential bug source

Home page double-fetch pattern:

useInfinitePosts nhận fallbackData từ home data — OK
useHomeData cũng nhận initialHomeData — OK
Nhưng PersonalBlogSidebar cũng gọi useHomeData riêng + useArchiveSummary — thêm request
Profile page không dùng SWR: useProfile hook dùng raw useEffect + useState — mất caching, deduplication, error retry tự động

Không có global SWRConfig: Mỗi hook tự config dedupingInterval, revalidateOnFocus riêng lẻ. Không consistent, dễ quên.

C4. Component Performance Issues
Inline styles everywhere: PostDetail, BasePostItem, CommentItem, Navbar — hàng trăm dòng inline styles. Vấn đề:

Mỗi render tạo object mới → fail React shallow comparison
Không reusable, không responsive media queries
Khó maintain khi cần thay đổi design system
PostDetail render HTML content: dangerouslySetInnerHTML với full TipTap render — OK pattern nhưng content HTML rất lớn không được lazy-render. Nếu bài viết dài (10000+ words), toàn bộ DOM render ngay lập tức

BasePostItem import deletePost và useRouter: Mọi post item trong feed import deletion logic kể cả khi user không phải owner — wasted bundle

C5. Image/Media Issues
Cover images trong feed: Plain <img> không có width/height attributes → CLS (Cumulative Layout Shift). Không có responsive sizes → mobile load ảnh desktop-size

Avatar images: Toàn bộ avatar dùng plain <img> (trong CommentItem, Navbar, PostDetail). SafeImage component tồn tại nhưng không được dùng ở những nơi quan trọng nhất

Post content images: Render qua dangerouslySetInnerHTML → không thể dùng next/image. Ảnh trong bài viết:

Không lazy load (TipTap HTML output không thêm loading="lazy")
Không responsive
Không có placeholder/blur
Không có ảnh placeholder cho cover: Khi ảnh chưa load, user thấy empty space hoặc jump

D. Recommended Improvements
D1. Loại bỏ TipTap khỏi trang đọc
Problem	TipTap + lowlight (~200-400KB) ship vào mọi post page
Why it matters	Gấp đôi JS bundle cho trang phổ biến nhất (post detail)
Solution	Convert TipTap JSON → HTML phía server (trong API route hoặc fetchPostBySlug). Backend Go đã có ProcessJSONContentForDisplay — extend nó để trả HTML. Frontend chỉ cần dangerouslySetInnerHTML
Alternative	Nếu không muốn đổi backend: tạo Next.js API route /api/render-content dùng generateHTML server-side, cache kết quả
Expected impact	-200-400KB JS, -500ms+ TTI trên mobile
Complexity	Medium
Priority	Do now
D2. Chuyển fonts sang next/font
Problem	3 CSS @import render-blocking
Why it matters	Delay FCP 300-800ms
Solution	Dùng next/font/google cho Source Serif 4 và JetBrains Mono. Dùng next/font/local hoặc @next/third-parties cho Cabinet Grotesk từ Fontshare. Xóa @import khỏi globals.css
Expected impact	-300-500ms FCP, loại bỏ FOUT
Complexity	Low
Priority	Do now
D3. Dùng next/image cho cover images
Problem	Plain <img> cho cover — CLS, no optimization
Why it matters	Feed là trang nhiều traffic nhất, ảnh cover là LCP candidate
Solution	Thay <img> trong BasePostItem bằng next/image với sizes prop. Set width/height hoặc fill + container dimensions. Thêm placeholder="blur" nếu có blurDataURL
Expected impact	CLS gần 0, ảnh nhỏ hơn 5-10x trên mobile
Complexity	Low
Priority	Do now
D4. Truyền fallbackData vào usePostName
Problem	Post page fetch thừa
Why it matters	Double API call mỗi page view
Solution	Modify usePostName để accept initialData option, pass trong PostPageClient
Expected impact	Loại bỏ 1 API call/view, faster perceived load
Complexity	Low
Priority	Do now
D5. Giảm Framer Motion trên infinite scroll
Problem	motion.div wrap mỗi item + stagger trên toàn list
Why it matters	50+ animation instances tích lũy, jank trên mobile
Solution	Chỉ animate batch mới nhất khi load more. Items đã hiện → plain div. Dùng CSS @keyframes cho stagger animation thay vì JS-driven. Hoặc dùng motion.div chỉ cho 10 items đầu tiên, rest = plain div
Expected impact	Giảm memory 30-50%, smoother scroll
Complexity	Medium
Priority	Do now
D6. Consolidate icon libraries
Problem	2 icon libraries (@phosphor-icons/react + react-icons)
Solution	Thay FaUser trong CommentItem bằng User từ Phosphor. Remove react-icons dependency
Expected impact	-20-40KB bundle
Complexity	Low
Priority	Do now
D7. SSR cho Category/Tag pages
Problem	Pure client render cho SEO-important pages
Solution	Tương tự home page: server fetch initial data, pass fallbackData cho SWR hook
Expected impact	SEO content visible, faster FCP
Complexity	Medium
Priority	Do later (medium-term)
D8. Lazy-load lowlight languages
Problem	createLowlight(common) load 40+ ngôn ngữ
Solution	Nếu vẫn cần client-side render: createLowlight() rỗng + lazy import từng language khi gặp code block
Expected impact	-100KB+ nếu TipTap vẫn ở client
Complexity	Medium
Priority	Do later (bị override bởi D1 nếu move render lên server)
D9. Thêm SWRConfig global
Problem	Mỗi hook tự config, không consistent
Solution	Wrap app trong <SWRConfig value={{ revalidateOnFocus: false, dedupingInterval: 10000, errorRetryCount: 2 }}>
Expected impact	Maintainability, consistent behavior
Complexity	Low
Priority	Do now
D10. Lazy-render post content cho bài dài
Problem	Bài viết dài render toàn bộ DOM ngay lập tức
Solution	CSS content-visibility: auto trên .reading-content sections, hoặc split content thành chunks với Intersection Observer
Expected impact	Faster initial render cho bài dài
Complexity	Low (CSS) / Medium (chunking)
Priority	Do later
E. Frontend Optimization Roadmap
Quick Wins (1-3 ngày)
#	Task	Impact	Effort
1	Pass fallbackData vào usePostName	Loại bỏ fetch thừa	30 min
2	Thay react-icons bằng Phosphor icons	-20-40KB	1 hour
3	Thêm SWRConfig global provider	Consistency	1 hour
4	Dùng next/image cho cover images trong BasePostItem	CLS fix, bandwidth	2 hours
5	Thêm @next/bundle-analyzer	Visibility	30 min
6	Fix O(n²) dedup trong useInfiniteComments (dùng Map hoặc Set)	CPU	30 min
Medium-term (1-2 tuần)
#	Task	Impact	Effort
7	Chuyển fonts sang next/font	FCP -300-500ms	1 day
8	Move TipTap HTML rendering lên server	-200-400KB JS	2-3 days
9	SSR initial data cho category/tag pages	SEO, FCP	1-2 days
10	Giảm Framer Motion trên infinite scroll	Mobile perf	1 day
11	Chuyển useProfile sang SWR	Caching, consistency	2 hours
12	Thêm preconnect hints cho API domain	Network latency	30 min
Long-term (1+ tháng)
#	Task	Impact	Effort
13	Web Vitals instrumentation (CLS, LCP, FID, INP)	Observability	2-3 days
14	Image CDN với automatic resize/format	Bandwidth, speed	1 week
15	Migrate inline styles → Tailwind classes hoặc CSS modules	Maintainability	1-2 weeks
16	Service worker cho offline reading	UX	1 week
17	React Server Components cho post content rendering	Bundle size	1 week
18	Virtualized comment list cho posts > 100 comments	Memory	2-3 days
F. Explicit Callouts
First Page Load Speed
Rating: 5/10 — ISR cho home page là đúng, nhưng 3 render-blocking font imports + TipTap bundle leak làm FCP và TTI chậm hơn cần thiết. User trên 3G sẽ thấy blank screen 2-4 giây.

Post Detail Page Speed
Rating: 4/10 — Đây là trang tệ nhất. TipTap + lowlight ship vào client chỉ để render HTML từ JSON. usePostName fetch lại data server đã có. Trên mobile, post page có thể mất 3-5s để fully interactive.

Comment/Reply Rendering Performance
Rating: 7/10 — Đây là phần được design tốt nhất. Cursor-based pagination, lazy reply expansion, page size nhỏ (5 comments, 10 replies). Vấn đề nhỏ: O(n²) dedup, và Framer Motion trên mỗi reply animation có thể gây jank với thread dài. Nhưng overall approach đúng.

Image Loading Speed
Rating: 3/10 — Vấn đề nghiêm trọng. Cover images dùng <img> không optimize. Avatar images dùng <img> không optimize. Post content images trong dangerouslySetInnerHTML không lazy-load. SafeImage component tồn tại nhưng bị underused. CLS gần như chắc chắn fail Core Web Vitals threshold.

Navigation Smoothness
Rating: 6/10 — Next.js App Router + next/link tự động prefetch. Tuy nhiên:

Không có scroll restoration rõ ràng
motion.div initial={{ opacity: 0 }} trên PostPageClient tạo flash effect
Không có page transition loading indicator
Quay lại feed từ post → feed re-render toàn bộ animation (mất scroll position?)
Mobile Experience
Rating: 4/10 — Các vấn đề chồng chất:

Font blocking FCP
Full-size cover images
50+ Framer Motion instances trên long feeds
TipTap bundle 200-400KB parse trên CPU yếu
GrainOverlay SVG filter luôn active (dù nhẹ, nhưng tạo composite layer)
backdropFilter: blur(12px) trên Navbar — expensive trên mobile
JS Bundle Efficiency
Rating: 3/10 — Vấn đề cốt lõi:

TipTap (18 extensions) + lowlight (40+ languages) ship vào read path
2 icon libraries
framer-motion (~30KB gzipped) dùng cho mọi animation kể cả simple fade
isomorphic-dompurify import jsdom server-side
Không có optimizePackageImports trong next.config
Không có bundle analyzer → không ai biết bundle đang bao nhiêu
Perceived Performance
Rating: 5/10 — Skeleton loaders có. Error states có. Nhưng:

Font flash (FOUT) do external @import
Layout shift từ cover images không có dimensions
Post page opacity fade-in 400ms cộng thêm vào perceived delay
Không có optimistic UI cho comment posting
Retry on error dùng window.location.reload() thay vì SWR retry