OK, here's the full picture.

Tất cả border-b / borderBottom trong project
1. Right Sidebar — Popular Posts (target chính)

PersonalBlogSidebar.js
Lines 70-70
              <article key={post.id} className="py-2 border-b border-[var(--border)] last:border-0">
Dùng border-b để ngăn cách giữa các popular post items. Đây là chỗ bạn muốn bỏ.

2. Right Sidebar — Author Bio

PersonalBlogSidebar.js
Lines 38-38
  <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
Inline style borderBottom ngăn cách author bio với phần dưới. Cũng nên xem xét bỏ nếu muốn sidebar clean.

3. Right Sidebar — Category links

PersonalBlogSidebar.js
Lines 110-110
                  borderBottom: '1px solid transparent',
Cái này transparent nên không visible — chỉ là placeholder cho hover effect. Giữ lại OK.

4. SkeletonPost

Skeleton.js
Lines 108-108
    <div className="p-card bg-medium-bg-card border-b border-medium-border pb-6 mb-6">
Skeleton post card dùng border-b làm separator giữa các loading cards. Nên bỏ để consistent.

5. AvatarUpdateModal

AvatarUpdateModal.js
Lines 56-56
          <div className="flex items-center justify-between p-5 border-b border-[#f2f2f2]">
Modal header separator. Đây là pattern chuẩn cho modal — có thể giữ lại vì modal header cần visual separation.

6. Navbar

themeClasses.js
Lines 377-377
    'border-b shadow-sm'

Navbar.js
Lines 77-77
        borderBottom: scrolled ? '1px solid rgba(26, 20, 16, 0.11)' : '1px solid transparent',
Navbar bottom border on scroll. Đây là functional — giúp user nhận biết navbar khi scroll. Giữ lại.

7. StickyCategoryBar, AddCommentForm, CategoryTagsPopup, PublishPanel
Các chỗ này dùng borderBottom cho UI separation trong forms/panels — mostly functional borders cho interactive components.

Plan đề xuất
#	File	Line	Pattern	Action	Lý do
1	PersonalBlogSidebar.js	70	border-b border-[var(--border)] last:border-0	Remove	Sidebar items không cần divider, dùng spacing đủ rồi
2	PersonalBlogSidebar.js	38	borderBottom: '1px solid var(--border)'	Remove	AuthorBio section — dùng spacing thay cho border
3	Skeleton.js	108	border-b border-medium-border	Remove	Skeleton card — consistent với post card thật
4	AvatarUpdateModal.js	56	border-b border-[#f2f2f2]	Keep	Modal header — standard pattern
5	Navbar.js	77	borderBottom: scrolled ? ...	Keep	Functional — scroll indicator
6	themeClasses.js	377	border-b shadow-sm	Keep	Navbar preset — functional
7	StickyCategoryBar.js	34	borderBottom: isStuck...	Keep	Functional — sticky indicator
8	AddCommentForm.js	109	borderBottom	Keep	Input field underline style
9	CategoryTagsPopup.js	311	borderBottom	Keep	Section divider in popup
10	PublishPanel.js	181, 403	borderBottom	Keep	Panel section dividers
Tóm lại: Remove 3 chỗ — cả 3 đều ở sidebar/skeleton, dùng spacing (gap, padding, margin) thay cho border là đẹp hơn và modern hơn. Các chỗ còn lại là functional borders cho navbar, forms, modals — giữ lại hợp lý.

