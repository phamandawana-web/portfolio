import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Award, CheckCircle, XCircle, 
  AlertCircle, FileText, Lock, BookOpen, Target,
  ChevronLeft, ChevronRight, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const FinalExam = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [exam, setExam] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [bestSubmission, setBestSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Exam taking state
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/coursework/login');
      return;
    }
    fetchData();
  }, [courseSlug, user, authLoading]);

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeLeft === null || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const fetchData = async () => {
    try {
      // Get course info
      const courseRes = await axios.get(`${API}/courses/${courseSlug}`);
      setCourse(courseRes.data);
      
      // Get exam for this course
      const examRes = await axios.get(`${API}/exams/course/${courseRes.data.id}`);
      setExam(examRes.data.exam);
      setEligibility(examRes.data.eligibility);
      setBestSubmission(examRes.data.best_submission);
      
      // Initialize answers array
      if (examRes.data.exam) {
        setAnswers(new Array(examRes.data.exam.questions?.length || 0).fill(-1));
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    setExamStarted(true);
    setTimeLeft((exam?.time_limit || 60) * 60); // Convert minutes to seconds
    setCurrentQuestion(0);
    setResult(null);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const startTime = (exam?.time_limit || 60) * 60;
      const timeTaken = startTime - (timeLeft || 0);
      
      const response = await axios.post(`${API}/exams/${exam.id}/submit`, {
        answers: answers,
        time_taken: timeTaken
      });
      
      setResult(response.data);
      setExamStarted(false);
      
      // Refresh data to update best submission
      fetchData();
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert(error.response?.data?.detail || 'Error submitting exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Exam taking view
  if (examStarted && exam) {
    const question = exam.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / exam.questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        {/* Timer Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 px-6 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">{exam.title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Question {currentQuestion + 1} of {exam.questions.length}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 300 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'}`}>
              <Timer size={18} />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="max-w-3xl mx-auto mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  Question {currentQuestion + 1}
                </Badge>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
                >
                  <div className="space-y-3">
                    {question.options?.map((option, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          answers[currentQuestion] === idx
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                        onClick={() => handleAnswerSelect(currentQuestion, idx)}
                      >
                        <RadioGroupItem value={idx.toString()} id={`q${currentQuestion}-opt${idx}`} />
                        <Label 
                          htmlFor={`q${currentQuestion}-opt${idx}`} 
                          className="flex-1 cursor-pointer text-slate-700 dark:text-slate-200"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
                className="gap-2 dark:border-slate-600 dark:text-slate-200"
              >
                <ChevronLeft size={18} />
                Previous
              </Button>
              
              {currentQuestion < exam.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  Next
                  <ChevronRight size={18} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                  <CheckCircle size={18} />
                </Button>
              )}
            </div>

            {/* Question Navigator */}
            <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Question Navigator</p>
              <div className="flex flex-wrap gap-2">
                {exam.questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      idx === currentQuestion
                        ? 'bg-indigo-600 text-white'
                        : answers[idx] !== -1
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {answers.filter(a => a !== -1).length} of {exam.questions.length} answered
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main exam info view
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
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
              <FileText className="h-10 w-10" />
              <h1 className="text-3xl font-bold">Final Course Exam</h1>
            </div>
            <p className="text-white/80">Complete all requirements and pass this exam to earn your certificate</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Result Banner */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-xl ${result.passed ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700'}`}
          >
            <div className="flex items-center gap-4">
              {result.passed ? (
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              )}
              <div>
                <h3 className={`text-xl font-bold ${result.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {result.passed ? 'Congratulations! You Passed!' : 'Not Passed - Keep Trying!'}
                </h3>
                <p className={result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  Score: {result.percentage}% ({result.score}/{result.total} correct) - Passing: {result.passing_score}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!exam ? (
          /* No exam available */
          <Card className="text-center py-12 dark:bg-slate-800 dark:border-slate-700">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Final Exam Available</h3>
              <p className="text-slate-500 dark:text-slate-400">
                The instructor hasn't created a final exam for this course yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Exam Info Card */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">{exam.title}</CardTitle>
                {exam.description && (
                  <CardDescription className="dark:text-slate-400">{exam.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{exam.questions?.length || 0}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Questions</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{exam.time_limit || 60}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Minutes</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{exam.passing_score || 70}%</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">To Pass</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {bestSubmission?.percentage || 0}%
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Best Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eligibility Requirements */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Target className="text-indigo-600 dark:text-indigo-400" size={24} />
                  Requirements to Take Exam
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Topics Requirement */}
                  <div className={`p-4 rounded-xl border-2 ${eligibility?.topics_completed >= eligibility?.total_topics ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/30' : 'border-slate-200 dark:border-slate-600'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {eligibility?.topics_completed >= eligibility?.total_topics ? (
                          <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                        ) : (
                          <Lock className="text-slate-400" size={24} />
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Complete All Topics</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {eligibility?.topics_completed || 0} / {eligibility?.total_topics || 0} topics completed
                          </p>
                        </div>
                      </div>
                      <Badge className={eligibility?.topics_completed >= eligibility?.total_topics ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}>
                        {eligibility?.topics_completed >= eligibility?.total_topics ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                  </div>

                  {/* Quizzes Requirement */}
                  <div className={`p-4 rounded-xl border-2 ${eligibility?.quizzes_passed >= eligibility?.total_quizzes ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/30' : 'border-slate-200 dark:border-slate-600'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {eligibility?.quizzes_passed >= eligibility?.total_quizzes ? (
                          <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                        ) : (
                          <Lock className="text-slate-400" size={24} />
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Pass All Quizzes</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {eligibility?.quizzes_passed || 0} / {eligibility?.total_quizzes || 0} quizzes passed
                          </p>
                        </div>
                      </div>
                      <Badge className={eligibility?.quizzes_passed >= eligibility?.total_quizzes ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}>
                        {eligibility?.quizzes_passed >= eligibility?.total_quizzes ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Exam Button */}
            <div className="text-center">
              {eligibility?.eligible ? (
                <Button
                  size="lg"
                  onClick={startExam}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6"
                  data-testid="start-final-exam-btn"
                >
                  <FileText size={24} />
                  {bestSubmission ? 'Retake Final Exam' : 'Start Final Exam'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button
                    size="lg"
                    disabled
                    className="gap-2 text-lg px-8 py-6"
                  >
                    <Lock size={24} />
                    Complete Requirements First
                  </Button>
                  <p className="text-slate-500 dark:text-slate-400">
                    {eligibility?.reasons?.join(' • ')}
                  </p>
                </div>
              )}
            </div>

            {/* Best Submission Info */}
            {bestSubmission && (
              <Card className={`${bestSubmission.passed ? 'border-green-200 dark:border-green-700' : 'border-slate-200 dark:border-slate-700'} dark:bg-slate-800`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Award className={bestSubmission.passed ? 'text-green-600 dark:text-green-400' : 'text-slate-400'} size={24} />
                    Your Best Attempt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{bestSubmission.percentage}%</p>
                      <p className="text-slate-500 dark:text-slate-400">{bestSubmission.score} / {bestSubmission.total} correct</p>
                    </div>
                    <Badge className={bestSubmission.passed ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}>
                      {bestSubmission.passed ? 'Passed' : 'Not Passed'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalExam;
