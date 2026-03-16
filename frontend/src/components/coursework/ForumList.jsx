import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, Plus, Pin, Lock, 
  Heart, Clock, User, Send, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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

const ForumList = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [forums, setForums] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newForum, setNewForum] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [courseSlug]);

  const fetchData = async () => {
    try {
      const courseRes = await axios.get(`${API}/courses/${courseSlug}`);
      setCourse(courseRes.data);
      
      const forumsRes = await axios.get(`${API}/forums?course_id=${courseRes.data.id}`);
      setForums(forumsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async () => {
    try {
      await axios.post(`${API}/forums?course_id=${course.id}&title=${encodeURIComponent(newForum.title)}&description=${encodeURIComponent(newForum.description)}`);
      setShowCreateDialog(false);
      setNewForum({ title: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating forum:', error);
      alert('Failed to create forum');
    }
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
            to={`/coursework/${courseSlug}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to {course?.title}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <MessageSquare className="h-8 w-8" />
                Discussion Forums
              </h1>
              <p className="text-white/80 mt-1">Ask questions and share knowledge</p>
            </div>
            {user && ['admin', 'instructor'].includes(user.role) && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-teal-600 hover:bg-white/90 gap-2">
                    <Plus size={18} />
                    New Forum
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Forum</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Input
                        value={newForum.title}
                        onChange={(e) => setNewForum({ ...newForum, title: e.target.value })}
                        placeholder="Forum title"
                      />
                    </div>
                    <div>
                      <Textarea
                        value={newForum.description}
                        onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                        placeholder="Description (optional)"
                      />
                    </div>
                    <Button onClick={handleCreateForum} className="w-full" disabled={!newForum.title}>
                      Create Forum
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {forums.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No Forums Yet</h3>
              <p className="text-slate-500">Discussion forums will appear here when created.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {forums.map((forum) => (
              <motion.div
                key={forum.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to={`/coursework/${courseSlug}/forum/${forum.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-teal-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-teal-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-teal-600 transition-colors">
                              {forum.title}
                            </h3>
                            {forum.description && (
                              <p className="text-slate-500 text-sm mt-1">{forum.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                              <span>{forum.post_count || 0} discussions</span>
                              <span>•</span>
                              <span>{forum.type === 'topic' ? 'Topic Forum' : 'Course Forum'}</span>
                            </div>
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

export default ForumList;
