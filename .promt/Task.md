1. Tổng quan codebase
Blog xây dựng trên Next.js 16 (App Router) + Go backend (Gin/GORM). Frontend dùng next-intl cho i18n (vi/en), Tailwind CSS + CSS variables cho design system "Warm Dispatch" (cream/terracotta), Framer Motion cho animations, TipTap cho editor.

2. Review i18n: EN/VN chưa apply hết
Bạn đúng — có nhiều chỗ chưa apply i18n. Đây là danh sách đầy đủ:

A. Search page — hardcoded hoàn toàn

page.js
Lines 1-28
const SearchHeader = () => (
  <div className="text-center py-12">
    <h1 className="font-serif text-3xl font-bold text-[#292929] mb-3">Search</h1>
    <p className="text-[#757575] max-w-md mx-auto mb-8">
      Discover articles through search
    </p>
    // ...
    <div className="max-w-sm mx-auto text-[13px] text-[#b3b3b1] space-y-1.5">
      <p>Search in titles and content</p>
      <p>Use quotes for exact phrases</p>
      <p>Results sorted by relevance</p>
    </div>
  </div>
);
6 string cần đưa vào messages/en.json & vi.json:

"Search", "Discover articles through search", "Search in titles and content", "Use quotes for exact phrases", "Results sorted by relevance"
B. TimeAgo — hardcoded tiếng Việt, không hỗ trợ EN

TimeAgo.js
Lines 8-32
export const timeAgo = (date) => {
  // ...
  if (seconds >= 86400) {
    const month = dateObj.toLocaleString('en-US', { month: 'short' }); // always English!
    // ...
  }
  if (seconds >= 3600) {
    return `${hours} giờ trước`;      // Vietnamese only
  }
  if (seconds >= 60) {
    return `${minutes} phút trước`;   // Vietnamese only
  }
  return 'vừa xong';                  // Vietnamese only
};
Component này không dùng useTranslations hay useLocale — khi switch sang EN, date > 1 ngày hiển thị tiếng Anh (do en-US), nhưng < 1 ngày thì hiển thị tiếng Việt. Cần refactor thành hook sử dụng locale.

C. ArchivePageClient — toàn bộ hardcoded English

ArchivePageClient.js
Lines 16-66
  const monthNames = [
    'January', 'February', ...  // Hardcoded EN
  ];
  // ...
  <h1>Archive: {monthName} {yearInt}</h1>
  <p>{totalCount} post{totalCount === 1 ? '' : 's'} from {monthName} {yearInt}</p>
  // Error messages also hardcoded:
  "Invalid archive date"
  "Error loading archive"
  "Loading archive..."
Cần thêm ~8 translation keys cho archive.* section.

D. Archive metadata — mixed language

page.js
Lines 9-18
  const monthNames = ['January', 'February', ...]; // English
  return {
    title: `Archive: ${monthName} ${year}`,                    // English
    description: `Bài viết lưu trữ tháng ${monthName} năm ${year}`, // Vietnamese!
  };
E. EmptyState/ErrorState — default props chưa i18n

EmptyState.js
Lines 5-8
const EmptyState = ({
  title = 'No content yet',          // hardcoded EN fallback
  message = 'Be the first to add content.',
}) => ...

ErrorState.js
Lines 5-8
const ErrorState = ({
  title = 'Something went wrong',    // hardcoded EN fallback
  message = 'An error occurred. Please try again.',
}) => ...
Callers (SearchResults, etc.) đã truyền translated strings, nhưng default fallback vẫn hardcoded.

Tóm tắt translation keys cần thêm
Area	Keys cần thêm
search.*	title, subtitle, tipTitles, tipQuotes, tipRelevance
timeago.*	hoursAgo, minutesAgo, justNow
archive.*	title, postsFrom, noPostsFor, invalidDate, invalidDateMessage, loadingArchive, errorTitle, errorMessage
3. Review UX/UI theo taste-skill
Đang follow tốt:
Font stack: Cabinet Grotesk (display) + Source Serif 4 (body) + JetBrains Mono (code) — không dùng Inter
Color: Single accent terracotta (
#C4541D), neutral warm palette, không purple/neon
Hero asymmetric: Left text + right decorative element — follow ANTI-CENTER BIAS
Spring physics: Framer Motion với stiffness: 100, damping: 20
Container constraint: max-w-[1192px]
Anti-emoji: Toàn bộ code sạch emoji
Icons: Dùng @phosphor-icons/react (Navbar)
Hardware acceleration: Animate qua transform/opacity
Staggered animations & warm skeleton loaders
Active state feedback: active:-translate-y-[1px], scale-[0.98]
Loading/Empty/Error states đều có
Vi phạm taste-skill:
1. Icon inconsistency — vi phạm Section 2

Taste-skill yêu cầu dùng exclusively @phosphor-icons/react hoặc @radix-ui/react-icons. Nhưng BasePostItem.js, LoginModal.js, PostDetail.js dùng react-icons (FaEdit, FaTrash, FaGoogle, FaTimes, FaUser, FaLock).

2. Old Medium green colors chưa migrate — vi phạm color consistency

Nhiều component vẫn dùng hardcoded #1a8917 (Medium green) thay vì var(--accent):

EmptyState.js: bg-[#1a8917], hover:bg-[#156d12]
ErrorState.js: bg-[#1a8917], hover:bg-[#156d12]
SearchHeader: bg-[#1a8917]/10, text-[#1a8917]
Và dùng hardcoded grays thay vì CSS variables:

text-[#292929] → nên dùng var(--text)
text-[#757575] → nên dùng var(--text-muted)
bg-[#f2f2f2] → nên dùng var(--bg-surface)
bg-white (ArchivePageClient) → nên dùng var(--bg)
3. CategoryHero dùng Slate colors — vi phạm COLOR CONSISTENCY


CategoryHero.js
Lines 69-70
  className="font-display font-bold text-4xl md:text-6xl 
             tracking-tighter leading-none text-slate-900"
Dùng text-slate-900, text-slate-600, text-slate-500 thay vì warm palette (var(--text), var(--text-muted)). Toàn bộ project dùng warm gray nhưng CategoryHero lại cool gray.

4. EmptyState/ErrorState dùng font-serif cho headings — vi phạm typography hierarchy

Design system dùng var(--font-display) (Cabinet Grotesk) cho headings, nhưng EmptyState/ErrorState dùng font-serif (Source Serif 4) cho <h3>. Nên đổi thành font-display.

5. rounded-full buttons trong EmptyState/ErrorState

Design system dùng sharp corners (borderRadius 3px-4px) cho buttons (xem LoginModal, Navbar). Nhưng EmptyState/ErrorState lại dùng rounded-full — inconsistent.

6. PersonalBlogSidebar popular posts dùng old Tailwind classes


PersonalBlogSidebar.js
Lines 57-63
  <article key={post.id} className="py-2 border-b border-[#f2f2f2] last:border-0">
    <a href={`/p/${post.slug}`} className="block group">
      <h4 className="text-[13px] font-medium text-[#292929] group-hover:underline line-clamp-2 leading-snug">
Dùng <a> thay vì <Link>, dùng hardcoded colors thay vì CSS variables.

4. Content suggestions cho blog kỹ sư phần mềm
Hiện tại hero content:


HomeClient.js
Lines 46-72
  <p>{t('home.personalWriting')}</p>  // "Personal writing" / "Viết lách cá nhân"
  <h1>Insight</h1>
  <p>{t('home.tagline')}</p>          // "Notes on software, craft, and the thinking behind what gets built."
Suggestions cải thiện:
A. Hero tagline — quá generic, nên cụ thể hơn

Hiện tại:

EN: "Notes on software, craft, and the thinking behind what gets built."
VN: "Ghi chép về phần mềm, kỹ năng, và tư duy đằng sau những gì được xây dựng."
Gợi ý (concrete hơn, tránh AI filler words theo taste-skill Rule 7):

EN: "A backend engineer writing about system design, Go, distributed systems, and lessons from building things that scale."
VN: "Một kỹ sư backend viết về thiết kế hệ thống, Go, hệ thống phân tán, và những bài học từ việc xây dựng sản phẩm."
Hoặc minimal style:

EN: "Writing about code, architecture, and the craft of building software."
VN: "Viết về code, kiến trúc, và nghề xây dựng phần mềm."
B. Label "Personal writing" — nên thay bằng gì đó identity hơn

Gợi ý:

"Engineering notes" / "Ghi chép kỹ thuật"
"From the terminal" / "Từ terminal"
"Build log" / "Nhật ký xây dựng"
C. Footer "Built with intention" — có thể thêm identity

Gợi ý:

"Built with Go, Next.js, and good coffee" / "Xây bằng Go, Next.js, và cà phê"
"Open source on GitHub" (nếu muốn link repo)
D. Nên thêm About section

Blog cá nhân kỹ sư phần mềm rất nên có 1 trang /about hoặc ít nhất 1 bio section ở sidebar. Hiện tại PersonalBlogSidebar chỉ có popular posts + categories + archive. Gợi ý thêm:

Author card ở đầu sidebar: avatar, tên, 1-2 dòng bio, links (GitHub, LinkedIn, Twitter)
Hoặc 1 mini intro section ngay dưới hero
E. Category hero stats hardcoded


CategoryHero.js
Lines 140-158
  <div className="font-display font-bold text-2xl text-slate-900">12+</div>
  // ...
  <div className="font-display font-bold text-2xl text-slate-900">100+</div>
12+ categories và 100+ articles là hardcoded — nên fetch dynamic từ API hoặc bỏ nếu chưa đủ data.

Summary — Priority action items:
Priority	Task
P0	i18n cho Search page (5 strings)
P0	Refactor TimeAgo để support locale
P0	i18n cho ArchivePageClient (~8 strings)
P1	Migrate old #1a8917 green → var(--accent) trong EmptyState/ErrorState/SearchHeader
P1	Fix CategoryHero slate colors → warm palette
P1	Replace react-icons → @phosphor-icons/react
P2	Thêm author bio card vào sidebar
P2	Cập nhật hero tagline cho cụ thể hơn
P2	Dynamic stats cho CategoryHero
