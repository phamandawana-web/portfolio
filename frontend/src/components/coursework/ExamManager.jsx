import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Save, Trash2, GripVertical, FileText,
  CheckCircle, Clock, Target, Eye, EyeOff, Settings, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ExamManager = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([]);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      navigate('/coursework/login');
      return;
    }
    fetchData();
  }, [courseSlug, user, authLoading]);

  const fetchData = async () => {
    try {
      const courseRes = await axios.get(`${API}/courses/${courseSlug}`);
      setCourse(courseRes.data);
      
      const examRes = await axios.get(`${API}/exams/course/${courseRes.data.id}`);
      if (examRes.data.exam) {
        const e = examRes.data.exam;
        setExam(e);
        setTitle(e.title || '');
        setDescription(e.description || '');
        setTimeLimit(e.time_limit || 60);
        setPassingScore(e.passing_score || 70);
        setQuestions(e.questions || []);
        setIsPublished(e.is_published || false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      question: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: 0,
      points: 1,
      explanation: ''
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter an exam title');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        course_id: course.id,
        title,
        description,
        time_limit: timeLimit,
        passing_score: passingScore,
        questions: questions.map(q => ({
          question: q.question,
          question_type: q.question_type || 'multiple_choice',
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points || 1,
          explanation: q.explanation
        }))
      };

      if (exam) {
        await axios.put(`${API}/exams/${exam.id}`, payload);
      } else {
        const res = await axios.post(`${API}/exams`, payload);
        setExam(res.data.exam);
      }
      
      alert('Exam saved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert(error.response?.data?.detail || 'Error saving exam');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!exam) return;
    try {
      const res = await axios.post(`${API}/exams/${exam.id}/publish`);
      setIsPublished(res.data.is_published);
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            to={`/coursework/${courseSlug}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to {course?.title}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Settings size={28} />
                Manage Final Exam
              </h1>
              <p className="text-white/80 mt-1">Create and configure the course final exam</p>
            </div>
            <div className="flex items-center gap-3">
              {exam && (
                <Link to={`/coursework/${courseSlug}/exam-statistics`}>
                  <Button className="bg-white/20 hover:bg-white/30 gap-2">
                    <BarChart3 size={18} />
                    View Statistics
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Exam Settings */}
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Exam Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-slate-200">Exam Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Final Exam"
                  className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
              <div>
                <Label className="dark:text-slate-200">Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  min={5}
                  max={180}
                  className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            </div>
            <div>
              <Label className="dark:text-slate-200">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Exam description..."
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-slate-200">Passing Score (%)</Label>
                <Input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  min={0}
                  max={100}
                  className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <Label className="dark:text-slate-200">Published</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isPublished ? 'Students can see and take this exam' : 'Only visible to instructors'}
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={togglePublish}
                  disabled={!exam}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">Questions ({questions.length})</h2>
            <Button onClick={addQuestion} className="gap-2">
              <Plus size={18} />
              Add Question
            </Button>
          </div>

          {questions.map((q, qIndex) => (
            <motion.div
              key={q.id || qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      Question {qIndex + 1}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={q.points || 1}
                        onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                        min={1}
                        className="w-20 text-center dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">points</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="dark:text-slate-200">Question</Label>
                    <Textarea
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Enter your question..."
                      className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="dark:text-slate-200">Answer Options</Label>
                    <div className="space-y-2 mt-2">
                      {q.options?.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correct_answer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                            className="w-4 h-4 text-green-600"
                          />
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className={`flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${q.correct_answer === oIndex ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : ''}`}
                          />
                          {q.correct_answer === oIndex && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle size={14} className="mr-1" />
                              Correct
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="dark:text-slate-200">Explanation (shown after grading)</Label>
                    <Textarea
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      placeholder="Explain the correct answer..."
                      className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {questions.length === 0 && (
            <Card className="text-center py-12 dark:bg-slate-800 dark:border-slate-700">
              <CardContent>
                <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">No questions yet. Add your first question.</p>
                <Button onClick={addQuestion} className="gap-2">
                  <Plus size={18} />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 px-8"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Exam'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamManager;
