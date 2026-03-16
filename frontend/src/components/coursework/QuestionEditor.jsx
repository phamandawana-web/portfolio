import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, GripVertical,
  CheckCircle, XCircle, FileQuestion
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const QuestionEditor = () => {
  const { courseSlug, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple_choice',
    question: '',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ],
    correct_answer: '',
    points: 1,
    explanation: ''
  });

  useEffect(() => {
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      navigate('/coursework/login');
      return;
    }
    fetchQuiz();
  }, [quizId, user]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`${API}/quizzes/${quizId}?include_answers=true`);
      setQuiz(response.data);
      setQuestions(response.data.questions_data || []);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      await axios.post(`${API}/quizzes/${quizId}/questions`, {
        quiz_id: quizId,
        type: newQuestion.type,
        question: newQuestion.question,
        options: newQuestion.type === 'short_answer' || newQuestion.type === 'essay' 
          ? [] 
          : newQuestion.options.filter(o => o.text.trim()),
        correct_answer: newQuestion.correct_answer,
        points: newQuestion.points,
        explanation: newQuestion.explanation
      });
      
      // Reset form
      setNewQuestion({
        type: 'multiple_choice',
        question: '',
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ],
        correct_answer: '',
        points: 1,
        explanation: ''
      });
      
      fetchQuiz();
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`${API}/quizzes/questions/${questionId}`);
      fetchQuiz();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...newQuestion.options];
    if (field === 'is_correct' && value) {
      // Only one correct answer for multiple choice
      newOptions.forEach((o, i) => o.is_correct = i === index);
    } else {
      newOptions[index][field] = value;
    }
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleTypeChange = (type) => {
    setNewQuestion({
      ...newQuestion,
      type,
      options: type === 'true_false' 
        ? [{ text: 'True', is_correct: false }, { text: 'False', is_correct: false }]
        : [
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false }
          ]
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
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link 
              to={`/coursework/${courseSlug}/quiz-manager`}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-1"
            >
              <ArrowLeft size={18} />
              Back to Quiz Manager
            </Link>
            <h1 className="font-semibold text-slate-900">{quiz?.title}</h1>
          </div>
          <Badge variant="outline" className="gap-1">
            <FileQuestion size={14} />
            {questions.length} Questions
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Existing Questions */}
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-lg text-slate-900">Questions</h2>
          {questions.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-slate-500">No questions yet. Add your first question below.</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((q, idx) => (
              <Card key={q.id} className="border-2">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">
                          {q.type === 'multiple_choice' && 'Multiple Choice'}
                          {q.type === 'true_false' && 'True/False'}
                          {q.type === 'short_answer' && 'Short Answer'}
                          {q.type === 'essay' && 'Essay'}
                        </Badge>
                        <span className="text-sm text-slate-500">{q.points} pt(s)</span>
                      </div>
                      <p className="text-slate-900 font-medium">{q.question}</p>
                      
                      {q.options && q.options.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {q.options.map((opt) => (
                            <div key={opt.id} className={`flex items-center gap-2 text-sm ${
                              opt.is_correct ? 'text-green-600 font-medium' : 'text-slate-600'
                            }`}>
                              {opt.is_correct ? <CheckCircle size={14} /> : <XCircle size={14} className="text-slate-300" />}
                              {opt.text}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {q.correct_answer && (
                        <p className="mt-2 text-sm text-green-600">
                          <strong>Answer:</strong> {q.correct_answer}
                        </p>
                      )}
                      
                      {q.explanation && (
                        <p className="mt-2 text-sm text-slate-500 italic">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Question Form */}
        <Card className="border-2 border-dashed border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={20} />
              Add New Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Question Type</Label>
                <Select value={newQuestion.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label>Question</Label>
              <Textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder="Enter your question..."
                className="min-h-[80px]"
              />
            </div>

            {/* Options for Multiple Choice / True-False */}
            {(newQuestion.type === 'multiple_choice' || newQuestion.type === 'true_false') && (
              <div className="space-y-3">
                <Label>Options (check the correct answer)</Label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={opt.is_correct}
                      onChange={() => handleOptionChange(idx, 'is_correct', true)}
                      className="w-4 h-4 text-green-600"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      disabled={newQuestion.type === 'true_false'}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Correct Answer for Short Answer */}
            {newQuestion.type === 'short_answer' && (
              <div>
                <Label>Correct Answer</Label>
                <Input
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  placeholder="Enter the correct answer..."
                />
              </div>
            )}

            {/* Essay info */}
            {newQuestion.type === 'essay' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800">
                  Essay questions require manual grading by an instructor.
                </p>
              </div>
            )}

            <div>
              <Label>Explanation (shown after submission)</Label>
              <Textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="Explain why this is the correct answer..."
                className="min-h-[60px]"
              />
            </div>

            <Button onClick={handleAddQuestion} className="w-full gap-2">
              <Plus size={18} />
              Add Question
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionEditor;
