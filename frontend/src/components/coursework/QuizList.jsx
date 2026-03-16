import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Award, CheckCircle, XCircle, 
  AlertCircle, FileQuestion, BarChart3, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const QuizList = () => {
  const { courseSlug, topicSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load before fetching
    if (authLoading) return;
    fetchData();
  }, [courseSlug, user, authLoading]);

  const fetchData = async () => {
    try {
      // Get course info
      const courseRes = await axios.get(`${API}/courses/${courseSlug}`);
      setCourse(courseRes.data);
      
      // Get quizzes for this course
      const quizzesRes = await axios.get(`${API}/quizzes?course_id=${courseRes.data.id}`);
      setQuizzes(quizzesRes.data);
      
      // Get my submissions if logged in
      if (user) {
        try {
          const subsRes = await axios.get(`${API}/quizzes/my-submissions`);
          setMySubmissions(subsRes.data);
        } catch (e) {
          console.log('Could not fetch submissions:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const submissions = mySubmissions.filter(s => s.quiz_id === quiz.id);
    if (submissions.length === 0) return { status: 'not_started', text: 'Not Started', color: 'slate' };
    
    const passed = submissions.some(s => s.passed);
    if (passed) return { status: 'passed', text: 'Passed', color: 'green' };
    
    if (submissions.length >= quiz.max_attempts) {
      return { status: 'failed', text: 'Max Attempts', color: 'red' };
    }
    
    return { status: 'attempted', text: `${submissions.length}/${quiz.max_attempts} Attempts`, color: 'yellow' };
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
          >
            <div className="flex items-center gap-3 mb-2">
              <FileQuestion className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Quizzes</h1>
            </div>
            <p className="text-white/80">Test your knowledge with assessments</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!user ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Login Required</h3>
              <p className="text-slate-500 mb-4">Please login to take quizzes and track your progress.</p>
              <Link to="/coursework/login">
                <Button>Login to Continue</Button>
              </Link>
            </CardContent>
          </Card>
        ) : quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileQuestion className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No Quizzes Available</h3>
              <p className="text-slate-500">Quizzes for this course will appear here when published.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => {
              const status = getQuizStatus(quiz);
              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {quiz.title}
                            {status.status === 'passed' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{quiz.description}</CardDescription>
                        </div>
                        <Badge className={`bg-${status.color}-100 text-${status.color}-700`}>
                          {status.text}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <FileQuestion size={16} />
                          {quiz.questions?.length || 0} Questions
                        </span>
                        {quiz.time_limit && (
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {quiz.time_limit} minutes
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Award size={16} />
                          Pass: {quiz.passing_score}%
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Link to={`/coursework/${courseSlug}/quiz/${quiz.id}`} className="flex-1">
                          <Button className="w-full gap-2">
                            <Play size={16} />
                            {status.status === 'not_started' ? 'Start Quiz' : 'Retake Quiz'}
                          </Button>
                        </Link>
                        <Link to={`/coursework/${courseSlug}/quiz/${quiz.id}/results`}>
                          <Button variant="outline" className="gap-2">
                            <BarChart3 size={16} />
                            Results
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
