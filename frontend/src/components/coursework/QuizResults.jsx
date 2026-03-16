import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Award, TrendingUp, Clock, CheckCircle, XCircle, 
  BarChart3, Target, Calendar, AlertCircle, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const QuizResults = () => {
  const { courseSlug, quizId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/coursework/login');
      return;
    }
    fetchData();
  }, [quizId, user, authLoading]);

  const fetchData = async () => {
    try {
      // Fetch quiz details
      const quizRes = await axios.get(`${API}/quizzes/${quizId}`);
      setQuiz(quizRes.data);
      
      // Fetch my submissions for this quiz
      const subsRes = await axios.get(`${API}/quizzes/${quizId}/submissions`);
      setSubmissions(subsRes.data);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate summary statistics
  const bestScore = submissions.length > 0 
    ? Math.max(...submissions.map(s => s.percentage || 0)) 
    : 0;
  const avgScore = submissions.length > 0 
    ? Math.round(submissions.reduce((a, b) => a + (b.percentage || 0), 0) / submissions.length) 
    : 0;
  const hasPassed = submissions.some(s => s.passed);
  const attemptsUsed = submissions.length;
  const maxAttempts = quiz?.max_attempts || 3;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className={`${hasPassed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white py-12 px-6`}>
        <div className="max-w-4xl mx-auto">
          <Link 
            to={`/coursework/${courseSlug}/quizzes`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Quizzes
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              {hasPassed ? (
                <CheckCircle className="h-10 w-10" />
              ) : (
                <BarChart3 className="h-10 w-10" />
              )}
              <div>
                <h1 className="text-3xl font-bold">{quiz?.title}</h1>
                <p className="text-white/80">Your Results & Progress</p>
              </div>
            </div>
            
            {hasPassed && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Award className="h-5 w-5" />
                <span className="font-medium">Quiz Passed!</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {submissions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Attempts Yet</h3>
              <p className="text-slate-500 mb-6">You haven't taken this quiz yet.</p>
              <Link to={`/coursework/${courseSlug}/quiz/${quizId}`}>
                <Button className="gap-2">
                  Start Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${hasPassed ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {hasPassed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Target className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">Status</p>
                    <p className={`text-lg font-bold ${hasPassed ? 'text-green-600' : 'text-amber-600'}`}>
                      {hasPassed ? 'Passed' : 'In Progress'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-sm text-slate-500">Best Score</p>
                    <p className="text-2xl font-bold text-indigo-600">{bestScore}%</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-slate-500">Avg Score</p>
                    <p className="text-2xl font-bold text-purple-600">{avgScore}%</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-500">Attempts</p>
                    <p className="text-2xl font-bold text-blue-600">{attemptsUsed}/{maxAttempts}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress to Pass */}
            {!hasPassed && (
              <Card className="mb-8 border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 mb-1">Keep Trying!</h3>
                      <p className="text-sm text-amber-700 mb-2">
                        You need {quiz?.passing_score || 60}% to pass. Your best score is {bestScore}%.
                      </p>
                      <Progress 
                        value={(bestScore / (quiz?.passing_score || 60)) * 100} 
                        className="h-2 bg-amber-200 [&>div]:bg-amber-500"
                      />
                    </div>
                    {attemptsUsed < maxAttempts && (
                      <Link to={`/coursework/${courseSlug}/quiz/${quizId}`}>
                        <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                          <RefreshCw size={16} />
                          Retry
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attempt History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attempt History
                </CardTitle>
                <CardDescription>Your quiz submission history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.map((sub, idx) => (
                    <motion.div
                      key={sub.id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${sub.passed ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub.passed ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            <span className="font-bold">#{submissions.length - idx}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-2xl">{sub.percentage || 0}%</span>
                              {sub.passed ? (
                                <Badge className="bg-green-100 text-green-700 gap-1">
                                  <CheckCircle size={12} />
                                  Passed
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 gap-1">
                                  <XCircle size={12} />
                                  Failed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              {sub.score || 0} / {sub.total_points || quiz?.questions_data?.length || 0} points
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <Clock size={14} />
                            {formatTime(sub.time_taken)}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(sub.submitted_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Score breakdown bar */}
                      <div className="mt-3">
                        <Progress 
                          value={sub.percentage || 0} 
                          className={`h-2 ${sub.passed ? '[&>div]:bg-green-500' : '[&>div]:bg-slate-400'}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-8 flex justify-center gap-4">
              {attemptsUsed < maxAttempts && !hasPassed && (
                <Link to={`/coursework/${courseSlug}/quiz/${quizId}`}>
                  <Button size="lg" className="gap-2">
                    <RefreshCw size={18} />
                    Take Quiz Again
                  </Button>
                </Link>
              )}
              <Link to={`/coursework/${courseSlug}/quizzes`}>
                <Button variant="outline" size="lg" className="gap-2">
                  <ArrowLeft size={18} />
                  Back to All Quizzes
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
