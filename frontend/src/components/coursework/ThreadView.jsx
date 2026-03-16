import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, Pin, Lock, Heart, Clock, 
  User, Send, MoreVertical, Trash2, Edit, Reply
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ThreadView = () => {
  const { courseSlug, forumId, postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/forums/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setSubmitting(true);
    try {
      await axios.post(`${API}/forums/posts`, {
        forum_id: forumId,
        content: replyContent,
        parent_id: postId
      });
      setReplyContent('');
      fetchPost();
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(error.response?.data?.detail || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (targetPostId) => {
    try {
      await axios.post(`${API}/forums/posts/${targetPostId}/like`);
      fetchPost();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handlePin = async () => {
    try {
      await axios.post(`${API}/forums/posts/${postId}/pin`);
      fetchPost();
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const handleLock = async () => {
    try {
      await axios.post(`${API}/forums/posts/${postId}/lock`);
      fetchPost();
    } catch (error) {
      console.error('Error locking post:', error);
    }
  };

  const handleDelete = async (targetPostId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API}/forums/posts/${targetPostId}`);
      if (targetPostId === postId) {
        navigate(`/coursework/${courseSlug}/forum/${forumId}`);
      } else {
        fetchPost();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canModerate = user && ['admin', 'instructor'].includes(user.role);
  const isLocked = post?.is_locked;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <Link 
            to={`/coursework/${courseSlug}/forum/${forumId}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2"
          >
            <ArrowLeft size={18} />
            Back to Forum
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.is_pinned && (
                <Badge className="bg-amber-100 text-amber-700 gap-1">
                  <Pin size={12} />
                  Pinned
                </Badge>
              )}
              {post.is_locked && (
                <Badge className="bg-slate-100 text-slate-700 gap-1">
                  <Lock size={12} />
                  Locked
                </Badge>
              )}
            </div>
            {canModerate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePin}>
                    <Pin className="mr-2 h-4 w-4" />
                    {post.is_pinned ? 'Unpin' : 'Pin'} Thread
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLock}>
                    <Lock className="mr-2 h-4 w-4" />
                    {post.is_locked ? 'Unlock' : 'Lock'} Thread
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(postId)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Thread
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Original Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-lg">
                    {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                    <span className="font-medium">{post.author?.username}</span>
                    <Badge variant="outline" className={
                      post.author?.role === 'instructor' ? 'border-blue-300 text-blue-700' :
                      post.author?.role === 'admin' ? 'border-purple-300 text-purple-700' :
                      'border-slate-300 text-slate-600'
                    }>
                      {post.author?.role || 'student'}
                    </Badge>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.edited && <span className="italic">(edited)</span>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(postId)}
                  className={`gap-2 ${post.likes?.includes(user?.user_id) ? 'text-red-500' : 'text-slate-500'}`}
                  disabled={!user}
                >
                  <Heart size={16} className={post.likes?.includes(user?.user_id) ? 'fill-current' : ''} />
                  {post.likes?.length || 0}
                </Button>
                <span className="text-sm text-slate-400">
                  {post.replies?.length || 0} replies
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Replies */}
        {post.replies?.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
              <Reply size={20} />
              Replies
            </h2>
            {post.replies.map((reply, idx) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-l-4 border-l-teal-200">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm">
                          {reply.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-slate-900">{reply.author?.username}</span>
                          <Badge variant="outline" className="text-xs">
                            {reply.author?.role || 'student'}
                          </Badge>
                          <span className="text-xs text-slate-400">{formatDate(reply.created_at)}</span>
                          {reply.edited && <span className="text-xs text-slate-400 italic">(edited)</span>}
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{reply.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(reply.id)}
                            className={`gap-1 h-7 px-2 ${reply.likes?.includes(user?.user_id) ? 'text-red-500' : 'text-slate-400'}`}
                            disabled={!user}
                          >
                            <Heart size={14} className={reply.likes?.includes(user?.user_id) ? 'fill-current' : ''} />
                            {reply.likes?.length || 0}
                          </Button>
                          {(canModerate || reply.author_id === user?.user_id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(reply.id)}
                              className="gap-1 h-7 px-2 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reply Form */}
        {user && !isLocked ? (
          <Card className="border-2 border-dashed border-teal-200">
            <CardContent className="py-4">
              <h3 className="font-medium text-slate-900 mb-3">Post a Reply</h3>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="min-h-[100px] mb-3"
              />
              <Button 
                onClick={handleReply} 
                disabled={submitting || !replyContent.trim()}
                className="gap-2"
              >
                <Send size={16} />
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </CardContent>
          </Card>
        ) : isLocked ? (
          <Card className="bg-slate-50">
            <CardContent className="py-4 text-center text-slate-500">
              <Lock className="mx-auto mb-2" size={20} />
              This thread is locked. No new replies allowed.
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-50">
            <CardContent className="py-4 text-center text-slate-500">
              Please <Link to="/coursework/login" className="text-teal-600 font-semibold hover:underline">login</Link> to reply.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ThreadView;
