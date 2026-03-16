import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Eye, Send, FileQuestion,
  GripVertical, Edit, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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

const QuizManager = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quizzes, setQuizzes] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    time_limit: null,
    passing_score: 60,
    max_attempts: 3
  });

  useEffect(() => {
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      navigate('/coursework/login');
      return;
    }
    fetchData();
  }, [courseSlug, user]);

  const fetchData = async () => {
    try {
      const courseRes = await axios.get(`${API}/courses/${courseSlug}`);
      setCourse(courseRes.data);
      
      const quizzesRes = await axios.get(`${API}/quizzes/manage`);
      // Filter quizzes for this course
      setQuizzes(quizzesRes.data.filter(q => q.course_id === courseRes.data.id));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      await axios.post(`${API}/quizzes`, {
        ...newQuiz,
        course_id: course.id,
        time_limit: newQuiz.time_limit || null
      });
      setShowCreateDialog(false);
      setNewQuiz({ title: '', description: '', time_limit: null, passing_score: 60, max_attempts: 3 });
      fetchData();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz');
    }
  };

  const handlePublish = async (quizId) => {
    if (!window.confirm('Publish this quiz? Students will be notified.')) return;
    try {
      await axios.post(`${API}/quizzes/${quizId}/publish`);
      fetchData();
    } catch (error) {
      console.error('Error publishing quiz:', error);
      alert('Failed to publish quiz');
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/quizzes/${quizId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-6">
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
                <FileQuestion className="h-8 w-8" />
                Quiz Manager
              </h1>
              <p className="text-white/80 mt-1">Create and manage course assessments</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-indigo-600 hover:bg-white/90 gap-2">
                  <Plus size={18} />
                  Create Quiz
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Quiz</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Quiz Title</Label>
                    <Input
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      placeholder="Brief description of the quiz"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Time Limit (min)</Label>
                      <Input
                        type="number"
                        value={newQuiz.time_limit || ''}
                        onChange={(e) => setNewQuiz({ ...newQuiz, time_limit: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="No limit"
                      />
                    </div>
                    <div>
                      <Label>Pass Score (%)</Label>
                      <Input
                        type="number"
                        value={newQuiz.passing_score}
                        onChange={(e) => setNewQuiz({ ...newQuiz, passing_score: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Max Attempts</Label>
                      <Input
                        type="number"
                        value={newQuiz.max_attempts}
                        onChange={(e) => setNewQuiz({ ...newQuiz, max_attempts: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateQuiz} className="w-full" disabled={!newQuiz.title}>
                    Create Quiz
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileQuestion className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No Quizzes Yet</h3>
              <p className="text-slate-500 mb-4">Create your first quiz to assess student learning.</p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus size={18} />
                Create Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">{quiz.title}</h3>
                          {quiz.is_published ? (
                            <Badge className="bg-green-100 text-green-700 gap-1">
                              <CheckCircle size={12} />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm mb-3">{quiz.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{quiz.questions?.length || 0} questions</span>
                          {quiz.time_limit && <span>{quiz.time_limit} min limit</span>}
                          <span>Pass: {quiz.passing_score}%</span>
                          <span>Max {quiz.max_attempts} attempts</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/coursework/${courseSlug}/quiz/${quiz.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit size={16} />
                            Edit Questions
                          </Button>
                        </Link>
                        {!quiz.is_published && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(quiz.id)}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Send size={16} />
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quiz.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManager;
