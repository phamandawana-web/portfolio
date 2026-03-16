import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, FileText, Users, Award, 
  TrendingUp, Clock, CheckCircle, XCircle, BarChart3,
  FileSpreadsheet, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const QuizStatistics = () => {
  const { courseSlug, quizId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !['admin', 'instructor'].includes(user.role)) {
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
      
      // Fetch all submissions for this quiz (admin endpoint)
      const subsRes = await axios.get(`${API}/quizzes/${quizId}/submissions`);
      setSubmissions(subsRes.data);
      
      // Calculate statistics
      calculateStatistics(subsRes.data, quizRes.data);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (subs, quizData) => {
    if (!subs || subs.length === 0) {
      setStatistics({
        totalAttempts: 0,
        uniqueStudents: 0,
        passRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTime: 0,
        questionStats: []
      });
      return;
    }

    const uniqueStudents = new Set(subs.map(s => s.student_id)).size;
    const passedCount = subs.filter(s => s.passed).length;
    const scores = subs.map(s => s.percentage || 0);
    const times = subs.filter(s => s.time_taken).map(s => s.time_taken);

    // Calculate per-question statistics
    const questionStats = (quizData.questions_data || []).map((q, idx) => {
      let correct = 0;
      let total = 0;
      subs.forEach(sub => {
        if (sub.answers && sub.answers[idx] !== undefined) {
          total++;
          if (sub.answers[idx] === q.correct_answer) {
            correct++;
          }
        }
      });
      return {
        question: q.question,
        correctRate: total > 0 ? Math.round((correct / total) * 100) : 0,
        attempts: total
      };
    });

    setStatistics({
      totalAttempts: subs.length,
      uniqueStudents,
      passRate: Math.round((passedCount / subs.length) * 100),
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      averageTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      questionStats
    });
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      // Create CSV content
      const headers = ['Student', 'Email', 'Score (%)', 'Points', 'Passed', 'Time (min)', 'Submitted At'];
      const rows = submissions.map(sub => [
        sub.student_name || sub.student_id,
        sub.student_email || 'N/A',
        sub.percentage || 0,
        `${sub.score || 0}/${sub.total_points || quiz?.questions_data?.length || 0}`,
        sub.passed ? 'Yes' : 'No',
        sub.time_taken ? Math.round(sub.time_taken / 60) : 'N/A',
        new Date(sub.submitted_at).toLocaleString()
      ]);

      const csvContent = [
        `Quiz: ${quiz?.title}`,
        `Course: ${courseSlug}`,
        `Exported: ${new Date().toLocaleString()}`,
        '',
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quiz?.title?.replace(/\s+/g, '_')}_results_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    try {
      // Create printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Quiz Results - ${quiz?.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4338ca; margin-bottom: 5px; }
            h2 { color: #6366f1; margin-top: 30px; }
            .meta { color: #64748b; margin-bottom: 20px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .stat-box { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
            .stat-label { font-size: 12px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f8fafc; font-weight: 600; }
            .passed { color: #16a34a; }
            .failed { color: #dc2626; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>Quiz Results: ${quiz?.title}</h1>
          <p class="meta">Course: ${courseSlug} | Generated: ${new Date().toLocaleString()}</p>
          
          <h2>Overview Statistics</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${statistics?.totalAttempts || 0}</div>
              <div class="stat-label">Total Attempts</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${statistics?.uniqueStudents || 0}</div>
              <div class="stat-label">Unique Students</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${statistics?.passRate || 0}%</div>
              <div class="stat-label">Pass Rate</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${statistics?.averageScore || 0}%</div>
              <div class="stat-label">Average Score</div>
            </div>
          </div>
          
          <h2>Student Results</h2>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(sub => `
                <tr>
                  <td>${sub.student_name || sub.student_id}</td>
                  <td>${sub.percentage || 0}%</td>
                  <td class="${sub.passed ? 'passed' : 'failed'}">${sub.passed ? 'Passed' : 'Failed'}</td>
                  <td>${new Date(sub.submitted_at).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Question Analysis</h2>
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Correct Rate</th>
              </tr>
            </thead>
            <tbody>
              ${(statistics?.questionStats || []).map((q, i) => `
                <tr>
                  <td>Q${i + 1}: ${q.question?.substring(0, 50)}${q.question?.length > 50 ? '...' : ''}</td>
                  <td>${q.correctRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `;

      // Open in new window and print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
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
              <BarChart3 className="h-8 w-8" />
              <h1 className="text-3xl font-bold">{quiz?.title} - Statistics</h1>
            </div>
            <p className="text-white/80">View student performance and export results</p>
            
            {/* Export Buttons */}
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={exportToCSV}
                disabled={exporting || submissions.length === 0}
                className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
                data-testid="export-csv-btn"
              >
                <FileSpreadsheet size={18} />
                Export CSV
              </Button>
              <Button 
                onClick={exportToPDF}
                disabled={exporting || submissions.length === 0}
                className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
                data-testid="export-pdf-btn"
              >
                <FileText size={18} />
                Export PDF
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Attempts</p>
                  <p className="text-3xl font-bold text-slate-900">{statistics?.totalAttempts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Unique Students</p>
                  <p className="text-3xl font-bold text-slate-900">{statistics?.uniqueStudents || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pass Rate</p>
                  <p className="text-3xl font-bold text-green-600">{statistics?.passRate || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg. Score</p>
                  <p className="text-3xl font-bold text-indigo-600">{statistics?.averageScore || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Highest: {statistics?.highestScore || 0}% | Lowest: {statistics?.lowestScore || 0}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-slate-500">90-100%</span>
                <Progress value={submissions.filter(s => s.percentage >= 90).length / (submissions.length || 1) * 100} className="flex-1 h-3" />
                <span className="w-12 text-sm text-slate-700">{submissions.filter(s => s.percentage >= 90).length}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-slate-500">70-89%</span>
                <Progress value={submissions.filter(s => s.percentage >= 70 && s.percentage < 90).length / (submissions.length || 1) * 100} className="flex-1 h-3" />
                <span className="w-12 text-sm text-slate-700">{submissions.filter(s => s.percentage >= 70 && s.percentage < 90).length}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-slate-500">50-69%</span>
                <Progress value={submissions.filter(s => s.percentage >= 50 && s.percentage < 70).length / (submissions.length || 1) * 100} className="flex-1 h-3" />
                <span className="w-12 text-sm text-slate-700">{submissions.filter(s => s.percentage >= 50 && s.percentage < 70).length}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-slate-500">Below 50%</span>
                <Progress value={submissions.filter(s => s.percentage < 50).length / (submissions.length || 1) * 100} className="flex-1 h-3" />
                <span className="w-12 text-sm text-slate-700">{submissions.filter(s => s.percentage < 50).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Analysis */}
        {statistics?.questionStats?.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
              <CardDescription>See which questions students struggle with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.questionStats.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Q{idx + 1}: {q.question?.substring(0, 60)}{q.question?.length > 60 ? '...' : ''}
                      </span>
                      <span className={`text-sm font-bold ${q.correctRate >= 70 ? 'text-green-600' : q.correctRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {q.correctRate}% correct
                      </span>
                    </div>
                    <Progress 
                      value={q.correctRate} 
                      className={`h-2 ${q.correctRate >= 70 ? '[&>div]:bg-green-500' : q.correctRate >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Submissions</span>
              <Badge variant="outline">{submissions.length} submissions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No submissions yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.student_name || 'Student'}</p>
                          <p className="text-sm text-slate-500">{sub.student_email || sub.student_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{sub.percentage || 0}%</span>
                          <span className="text-sm text-slate-500">
                            ({sub.score || 0}/{sub.total_points || quiz?.questions_data?.length || 0})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>{formatTime(sub.time_taken)}</TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizStatistics;
