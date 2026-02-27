import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { X, Send, Reply } from "lucide-react";

interface Comment {
  id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
}

interface Confession {
  id: number;
  content: string;
  category: string;
  color: string;
  mood: string;
  reaction_love: number;
  reaction_relate: number;
  reaction_shocked: number;
  reaction_funny: number;
  report_count: number;
  comment_count: number;
  created_at: string;
}

interface CommentModalProps {
  confession: Confession;
  onClose: () => void;
  onCommentAdded: () => void;
}

export default function CommentModal({ confession, onClose, onCommentAdded }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [confession.id]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/confessions/${confession.id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await fetch(`/api/confessions/${confession.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, parent_id: replyingTo }),
      });
      setNewComment("");
      setReplyingTo(null);
      fetchComments();
      onCommentAdded();
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: number) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-cute text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Comments <span className="text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{comments.length}</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
          <div className={`${confession.color} p-4 rounded-2xl border border-black/10`}>
            <p className="text-gray-900 font-medium leading-relaxed">
              {confession.content}
            </p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {topLevelComments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p className="mb-2 text-3xl">💭</p>
              <p className="font-medium">No comments yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            topLevelComments.map(comment => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-700 dark:text-gray-300">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-200">Anonymous</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    <button 
                      onClick={() => setReplyingTo(comment.id)}
                      className="mt-1 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 flex items-center gap-1 ml-2"
                    >
                      <Reply className="size-3" /> Reply
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {getReplies(comment.id).length > 0 && (
                  <div className="pl-12 space-y-4">
                    {getReplies(comment.id).map(reply => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="size-6 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-700 dark:text-gray-300">
                          R
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-none px-3 py-2 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-200">Anonymous</span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-semibold text-primary">Replying to comment...</span>
              <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-500 hover:text-gray-800">Cancel</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Write an anonymous comment..."}
              className="w-full bg-gray-100 dark:bg-gray-700/50 border-none rounded-full pl-5 pr-12 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="absolute right-2 p-2 text-white bg-primary hover:bg-accent rounded-full disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
