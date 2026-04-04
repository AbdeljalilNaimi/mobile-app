import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";

export type CommunityCategory = "suggestion" | "feedback" | "experience" | "question";
export type ReportReason = "spam" | "abuse" | "false_info" | "other";
export type SortOption = "newest" | "most_upvoted" | "most_discussed";

export interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  title: string;
  content: string;
  category: CommunityCategory;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_admin_post: boolean;
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  parent_comment_id: string | null;
  content: string;
  is_anonymous: boolean;
  upvotes_count: number;
  created_at: string;
  updated_at: string;
  replies?: CommunityComment[];
}

export async function fetchPosts(params: {
  category?: CommunityCategory;
  sort?: SortOption;
  search?: string;
  page?: number;
  pageSize?: number;
  adminOnly?: boolean;
  excludeAdminUnpinned?: boolean;
}): Promise<{ posts: CommunityPost[]; hasMore: boolean }> {
  const { category, sort = "newest", search, page = 0, pageSize = 10, adminOnly, excludeAdminUnpinned } = params;
  return apiGet("/community/posts", {
    category,
    sort,
    search,
    page,
    pageSize,
    adminOnly: adminOnly ? "true" : undefined,
    excludeAdminUnpinned: excludeAdminUnpinned ? "true" : undefined,
  });
}

export async function fetchNewAdminPostCount(since?: string): Promise<number> {
  const result = await apiGet<{ count: number }>("/community/posts/admin-count", since ? { since } : undefined);
  return result.count;
}

export async function createPost(post: {
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  title: string;
  content: string;
  category: CommunityCategory;
  is_anonymous: boolean;
}): Promise<CommunityPost> {
  return apiPost("/community/posts", post);
}

export async function updatePost(id: string, updates: { title?: string; content?: string; category?: CommunityCategory }) {
  return apiPatch("/community/posts/" + id, updates);
}

export async function deletePost(id: string) {
  return apiDelete("/community/posts/" + id);
}

export async function togglePinPost(id: string, pinned: boolean) {
  return apiPatch("/community/posts/" + id, { is_pinned: pinned });
}

export async function fetchComments(postId: string): Promise<CommunityComment[]> {
  return apiGet("/community/posts/" + postId + "/comments");
}

export async function createComment(comment: {
  post_id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  parent_comment_id?: string | null;
  content: string;
  is_anonymous: boolean;
}): Promise<CommunityComment> {
  return apiPost("/community/posts/" + comment.post_id + "/comments", comment);
}

export async function updateComment(id: string, content: string) {
  return apiPatch("/community/comments/" + id, { content });
}

export async function deleteComment(id: string) {
  return apiDelete("/community/comments/" + id);
}

export async function toggleUpvote(userId: string, target: { postId?: string; commentId?: string }): Promise<boolean> {
  const result = await apiPost<{ upvoted: boolean }>("/community/upvotes/toggle", {
    userId,
    postId: target.postId,
    commentId: target.commentId,
  });
  return result.upvoted;
}

export async function getUserUpvotes(userId: string): Promise<{ postIds: string[]; commentIds: string[] }> {
  return apiGet("/community/upvotes/" + userId);
}

export async function submitReport(report: {
  reporter_id: string;
  post_id?: string;
  comment_id?: string;
  reason: ReportReason;
  details?: string;
}) {
  return apiPost("/community/reports", report);
}
