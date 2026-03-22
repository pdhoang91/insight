Plan: Tags on Post Detail + Tag Page
Current state
Backend: Tags fully supported — GET /tags/:name/posts, GET /tags/popular, many-to-many via post_tags table. All good.
Frontend services: tagService.js already has getPostsByTag(tagName, page, limit) — ready to use.
Post detail page (/p/[slug]): Uses PostDetail.js which renders categories but not tags. The API response includes post.tags as [{id, name, ...}].
ArticleReader.js: Has tag rendering but treats post.tags as strings (/tag/${tag}) — this is a bug since tags are objects {id, name}.
No /tag/[name] route exists in the frontend.
Tasks
1. Show tags on PostDetail.js (small change)
File: frontend/components/Post/PostDetail.js

Add a tags section below the existing categories block (lines 93-117). Tags are already in post.tags from the API. Render them as <Link> to /tag/{tag.name}, styled similarly to categories but visually distinct (e.g. with a # prefix or different color).

Roughly:

{post.tags?.length > 0 && (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
    {post.tags.map((tag) => (
      <Link key={tag.id} href={`/tag/${tag.name}`} ...>
        #{tag.name}
      </Link>
    ))}
  </div>
)}
2. Fix ArticleReader.js tag bug
File: frontend/components/Post/ArticleReader.js (line 145)

Change href={/tag/${tag}} → href={/tag/${tag.name}} and {tag} → {tag.name} since post.tags are objects, not strings.

3. Create /tag/[name] route (mirror category pattern)
Three files, following the exact same pattern as [locale]/category/[name]/:

a. frontend/app/[locale]/tag/[name]/page.js (server component)

generateStaticParams → call fetchPopularTags to pre-render popular tag pages
generateMetadata → title/description based on tag name
Render <TagPostsClient name={name} />
Add fetchPopularTags to frontend/app/lib/api.js if not already there
b. frontend/app/[locale]/tag/[name]/TagPostsClient.js (client component)

Use a new hook useInfinitePostByTag(tagName) (similar to useInfinitePostByCategory)
Layout: HomeLayout + PersonalBlogSidebar
Render a TagPosts component (similar to CategoryPosts)
4. Create useInfinitePostByTag hook
File: frontend/hooks/useInfinitePostByTag.js

Mirror useInfinitePostByCategory.js but call getPostsByTag(tagName, page, limit) from tagService.js.

5. Create TagPosts component
File: frontend/components/Tag/TagPosts.js

Similar to CategoryPosts — shows tag name as header, post list with infinite scroll/load more. Can reuse existing PostCard or whatever CategoryPosts uses for rendering individual posts.

6. (Optional) Tag listing page at /tag
If you also want a /tag index page showing all/popular tags:

File: frontend/app/[locale]/tag/page.js

Grid of popular tags, each linking to /tag/{name} with post counts.

Dependency order

1. Fix ArticleReader.js bug (independent, quick)
2. Add tags to PostDetail.js (independent, quick)
3. Create useInfinitePostByTag hook
4. Create TagPosts component
5. Create /tag/[name] route (depends on 3, 4)
6. (Optional) Create /tag index page