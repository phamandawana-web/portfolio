import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, Plus, Pin, Lock, 
  Heart, Clock, User, Send, ChevronRight, Reply
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ForumView = () => {
  const { courseSlug, forumId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [forum, setForum] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [forumId, courseSlug]);

  const fetchData = async () => {
    try {
      const [courseRes, forumRes] = await Promise.all([
        axios.get(`${API}/courses/${courseSlug}`),
        axios.get(`${API}/forums/${forumId}`)
      ]);
      setCourse(courseRes.data);
      setForum(forumRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    setPosting(true);
    try {
      await axios.post(`${API}/forums/posts`, {
        forum_id: forumId,
        title: newPost.title,
        content: newPost.content
      });
      setShowNewPostDialog(false);
      setNewPost({ title: '', content: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.detail || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API}/forums/posts/${postId}/like`);
      fetchData();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handlePin = async (postId) => {
    try {
      await axios.post(`${API}/forums/posts/${postId}/pin`);
      fetchData();
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const handleLock = async (postId) => {
    try {
      await axios.post(`${API}/forums/posts/${postId}/lock`);
      fetchData();
    } catch (error) {
      console.error('Error locking post:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            to={`/coursework/${courseSlug}/forums`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Forums
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold">{forum?.title}</h1>
              {forum?.description && (
                <p className="text-white/80 mt-1">{forum.description}</p>
              )}
            </div>
            {user && (
              <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-teal-600 hover:bg-white/90 gap-2">
                    <Plus size={18} />
                    New Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start a Discussion</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Input
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Discussion title"
                      />
                    </div>
                    <div>
                      <Textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Write your question or topic..."
                        className="min-h-[150px]"
                      />
                    </div>
                    <Button 
                      onClick={handleCreatePost} 
                      className="w-full" 
                      disabled={posting || !newPost.title || !newPost.content}
                    >
                      {posting ? 'Posting...' : 'Post Discussion'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!user && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="py-4 text-center">
              <p className="text-amber-800">
                Please <Link to="/coursework/login" className="text-teal-600 font-semibold hover:underline">login</Link> to participate in discussions.
              </p>
            </CardContent>
          </Card>
        )}

        {forum?.threads?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No Discussions Yet</h3>
              <p className="text-slate-500">Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {forum?.threads?.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to={`/coursework/${courseSlug}/forum/${forumId}/post/${thread.id}`}>
                  <Card className={`hover:shadow-lg transition-all cursor-pointer group ${
                    thread.is_pinned ? 'border-2 border-amber-200 bg-amber-50/50' : ''
                  }`}>
                    <CardContent className="py-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                            {thread.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.is_pinned && (
                              <Badge className="bg-amber-100 text-amber-700 gap-1">
                                <Pin size={12} />
                                Pinned
                              </Badge>
                            )}
                            {thread.is_locked && (
                              <Badge className="bg-slate-100 text-slate-700 gap-1">
                                <Lock size={12} />
                                Locked
                              </Badge>
                            )}
                            <Badge variant="outline" className={
                              thread.author?.role === 'instructor' ? 'border-blue-300 text-blue-700' :
                              thread.author?.role === 'admin' ? 'border-purple-300 text-purple-700' :
                              'border-slate-300 text-slate-600'
                            }>
                              {thread.author?.role || 'student'}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-teal-600 transition-colors">
                            {thread.title}
                          </h3>
                          <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                            {thread.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {thread.author?.username}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDate(thread.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Reply size={14} />
                              {thread.reply_count || 0} replies
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              {thread.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumView;
