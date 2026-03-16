import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, AlertCircle, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Flag, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const QuizTaker = () => {
  const { courseSlug, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [flagged, setFlagged] = useState(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/coursework/login');
      return;
    }
    fetchQuiz();
  }, [quizId, user]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`${API}/quizzes/${quizId}`);
      setQuiz(response.data);
      setQuestions(response.data.questions_data || []);
      
      if (response.data.time_limit) {
        setTimeLeft(response.data.time_limit * 60);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleFlag = (questionId) => {
    setFlagged(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    const unanswered = questions.filter(q => !answers[q.id]).length;
    if (unanswered > 0 && !result) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/quizzes/${quizId}/submit`, {
        quiz_id: quizId,
        answers: Object.entries(answers).map(([question_id, answer]) => ({
          question_id,
          answer
        })),
        time_taken: quiz.time_limit ? (quiz.time_limit * 60) - timeLeft : null
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert(error.response?.data?.detail || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className={`border-2 ${result.passed ? 'border-green-200' : 'border-red-200'}`}>
              <CardContent className="pt-8 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  result.passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.passed ? (
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {result.passed ? 'Congratulations!' : 'Quiz Completed'}
                </h2>
                <p className="text-slate-600 mb-6">
                  {result.passed 
                    ? 'You have successfully passed this quiz!' 
                    : 'Keep practicing and try again.'}
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
                    <p className="text-sm text-slate-500">Score</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-3xl font-bold text-green-600">{result.score}</p>
                    <p className="text-sm text-slate-500">Points</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-3xl font-bold text-purple-600">{result.total_points}</p>
                    <p className="text-sm text-slate-500">Total</p>
                  </div>
                </div>

                {/* Show answers with explanations */}
                {quiz?.show_correct_answers && (
                  <div className="text-left space-y-4 mt-8 border-t pt-6">
                    <h3 className="font-semibold text-lg text-slate-900">Review Answers</h3>
                    {result.answers?.map((ans, idx) => {
                      const question = questions.find(q => q.id === ans.question_id);
                      return (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                          <p className="font-medium text-slate-900 mb-2">
                            {idx + 1}. {question?.question}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            {ans.is_correct ? (
                              <Badge className="bg-green-100 text-green-700">Correct</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">Incorrect</Badge>
                            )}
                            <span className="text-sm text-slate-500">
                              +{ans.points_earned} points
                            </span>
                          </div>
                          {ans.explanation && (
                            <p className="text-sm text-slate-600 italic">
                              <strong>Explanation:</strong> {ans.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3 justify-center mt-8">
                  <Link to={`/coursework/${courseSlug}/quizzes`}>
                    <Button variant="outline">Back to Quizzes</Button>
                  </Link>
                  <Link to={`/coursework/${courseSlug}`}>
                    <Button>Continue Learning</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-900">{quiz?.title}</h1>
            <p className="text-sm text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <Badge className={`gap-1 ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                <Clock size={14} />
                {formatTime(timeLeft)}
              </Badge>
            )}
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              <Send size={16} />
              Submit Quiz
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-1 mt-4" />
      </div>

      {/* Question Navigator */}
      <div className="bg-slate-50 border-b border-slate-200 py-3 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white'
                  : answers[q.id]
                  ? 'bg-green-100 text-green-700'
                  : flagged.has(q.id)
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">
                    {currentIndex + 1}. {currentQuestion.question}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={flagged.has(currentQuestion.id) ? 'text-amber-500' : 'text-slate-400'}
                  >
                    <Flag size={18} />
                  </Button>
                </div>
                <Badge variant="outline">
                  {currentQuestion.type === 'multiple_choice' && 'Multiple Choice'}
                  {currentQuestion.type === 'true_false' && 'True/False'}
                  {currentQuestion.type === 'short_answer' && 'Short Answer'}
                  {currentQuestion.type === 'essay' && 'Essay'}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Multiple Choice / True-False */}
                {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-3"
                  >
                    {currentQuestion.options?.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          answers[currentQuestion.id] === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="cursor-pointer flex-1">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Short Answer */}
                {currentQuestion.type === 'short_answer' && (
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-0 outline-none"
                  />
                )}

                {/* Essay */}
                {currentQuestion.type === 'essay' && (
                  <Textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Write your essay response..."
                    className="min-h-[200px]"
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ChevronLeft size={18} />
                Previous
              </Button>
              
              {currentIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                  <Send size={18} />
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="gap-2"
                >
                  Next
                  <ChevronRight size={18} />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
