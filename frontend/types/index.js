/**
 * @file types/index.js
 * JSDoc type definitions for Insight domain models.
 * Import with: @typedef {import('../types').Post} Post
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} [slug]
 */

/**
 * @typedef {Object} Tag
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} username
 * @property {string} email
 * @property {string} [avatar_url]
 * @property {string} [bio]
 * @property {string} role           - One of USER_ROLES values
 */

/**
 * @typedef {Object} Post
 * @property {number}     id
 * @property {string}     title
 * @property {string}     slug
 * @property {string}     [excerpt]
 * @property {string}     [cover_image]
 * @property {object}     content       - TipTap/ProseMirror JSON
 * @property {User}       [user]
 * @property {Category[]} [categories]
 * @property {Tag[]}      [tags]
 * @property {string}     created_at
 * @property {string}     [updated_at]
 */

/**
 * @typedef {Object} Comment
 * @property {number}  id
 * @property {string}  content
 * @property {User}    [user]
 * @property {number}  post_id
 * @property {number}  [parent_id]   - null for top-level comments
 * @property {number}  replies_count
 * @property {string}  created_at
 */

/**
 * @typedef {Object} Reply
 * @property {number} id
 * @property {string} content
 * @property {User}   [user]
 * @property {number} comment_id
 * @property {string} created_at
 */

/**
 * @typedef {Object} PaginatedResult
 * @property {any[]}  posts        - or items depending on endpoint
 * @property {number} totalCount
 */

/**
 * @typedef {Object} CursorResult
 * @property {any[]}       data
 * @property {string|null} nextCursor
 * @property {number}      totalCount
 */
