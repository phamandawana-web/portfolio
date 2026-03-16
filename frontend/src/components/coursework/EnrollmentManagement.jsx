import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Clock, CheckCircle, XCircle, 
  AlertCircle, Search, BookOpen, UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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

const EnrollmentManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [filterCourse, setFilterCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);
  const [bulkEnrollCourse, setBulkEnrollCourse] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'instructor'].includes(user.role))) {
      navigate('/coursework/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes, coursesRes, studentsRes] = await Promise.all([
        axios.get(`${API}/enrollments/pending`),
        axios.get(`${API}/enrollments/all`),
        axios.get(`${API}/courses`),
        axios.get(`${API}/users/all`)
      ]);
      setPendingEnrollments(pendingRes.data);
      setAllEnrollments(allRes.data);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data.filter(u => u.role === 'student' && u.status === 'approved'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId, approve, reason = null) => {
    try {
      await axios.post(`${API}/enrollments/approve/${enrollmentId}?approved=${approve}${reason ? `&rejection_reason=${encodeURIComponent(reason)}` : ''}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update enrollment');
    }
  };

  const handleBulkEnroll = async () => {
    if (!bulkEnrollCourse || selectedStudents.length === 0) {
      alert('Please select a course and at least one student');
      return;
    }

    try {
      const response = await axios.post(`${API}/enrollments/bulk-enroll?course_id=${bulkEnrollCourse}`, selectedStudents);
      alert(response.data.message);
      setShowBulkEnroll(false);
      setBulkEnrollCourse('');
      setSelectedStudents([]);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to bulk enroll');
    }
  };

  const filteredEnrollments = allEnrollments.filter(e => {
    const matchesCourse = filterCourse === 'all' || e.course_id === filterCourse;
    const matchesSearch = e.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/coursework/admin" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Admin
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                Enrollment Management
              </h1>
              <p className="text-white/80 mt-1">Manage student course enrollments</p>
            </div>
            <Dialog open={showBulkEnroll} onOpenChange={setShowBulkEnroll}>
              <DialogTrigger asChild>
                <Button className="bg-white text-orange-600 hover:bg-white/90 gap-2">
                  <UserPlus size={18} />
                  Bulk Enroll
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bulk Enroll Students</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Course</label>
                    <Select value={bulkEnrollCourse} onValueChange={setBulkEnrollCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Students</label>
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-1">
                      {students.map(student => (
                        <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span>{student.username}</span>
                          <span className="text-slate-400 text-sm">{student.email}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedStudents.length} student(s) selected
                    </p>
                  </div>
                  <Button onClick={handleBulkEnroll} className="w-full">
                    Enroll Selected Students
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingEnrollments.length}</p>
                  <p className="text-sm text-slate-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allEnrollments.filter(e => e.status === 'approved').length}</p>
                  <p className="text-sm text-slate-500">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-slate-500">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <AlertCircle size={16} />
              Pending Requests
              {pendingEnrollments.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingEnrollments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Users size={16} />
              All Enrollments
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {pendingEnrollments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">All Caught Up!</h3>
                  <p className="text-slate-500">No pending enrollment requests.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingEnrollments.map((enrollment) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-yellow-100">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                              {enrollment.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{enrollment.username}</h3>
                              <p className="text-sm text-slate-500">{enrollment.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <BookOpen size={10} className="mr-1" />
                                  {enrollment.course_title}
                                </Badge>
                                <span className="text-xs text-slate-400">
                                  {new Date(enrollment.requested_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => {
                                const reason = window.prompt('Rejection reason (optional):');
                                handleApprove(enrollment.id, false, reason);
                              }}
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle size={16} className="mr-1" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleApprove(enrollment.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Enrollments Tab */}
          <TabsContent value="all">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="Search by student or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {filteredEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-semibold text-slate-600">
                          {enrollment.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{enrollment.username}</span>
                            <Badge className={statusColors[enrollment.status]}>
                              {enrollment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">{enrollment.course_title}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        {enrollment.status === 'approved' && enrollment.approved_at && (
                          <p>Approved {new Date(enrollment.approved_at).toLocaleDateString()}</p>
                        )}
                        {enrollment.approved_by && (
                          <p className="text-xs">by {enrollment.approved_by}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnrollmentManagement;
