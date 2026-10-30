"use client";

import { createContext, useContext } from "react";
import { FALLBACK_POSTS, type Post } from "@/lib/medium";

export const PostsContext = createContext<Post[]>(FALLBACK_POSTS);
export const usePosts = () => useContext(PostsContext);
