import ChatPortfolio from "@/components/ChatPortfolio";
import { getMediumPosts } from "@/lib/medium";

// Re-read the Medium feed at most once an hour, so new essays appear without a redeploy.
export const revalidate = 3600;

export default async function Page() {
  const posts = await getMediumPosts();
  return <ChatPortfolio posts={posts} />;
}
