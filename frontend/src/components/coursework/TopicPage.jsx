import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Edit, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const TopicPage = () => {
  const { courseSlug, topicSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [topic, setTopic] = useState(null);
  const [course, setCourse] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/coursework/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [courseSlug, topicSlug, user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch course and topic
      const [courseRes, topicRes] = await Promise.all([
        axios.get(`${API}/courses/${courseSlug}`),
        axios.get(`${API}/courses/${courseSlug}/topics/${topicSlug}`)
      ]);
      
      setCourse(courseRes.data);
      setAllTopics(courseRes.data.topics_data || []);
      setTopic(topicRes.data);
      
      // Check progress
      const progressRes = await axios.get(`${API}/courses/progress/${user?.user_id}`);
      const topicProgress = progressRes.data.find(p => p.topic_id === topicRes.data.id);
      setCompleted(topicProgress?.completed || false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    try {
      await axios.post(`${API}/courses/progress`, {
        student_id: user?.user_id,
        course_id: course.id,
        topic_id: topic.id,
        completed: !completed
      });
      setCompleted(!completed);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const currentIndex = allTopics.findIndex(t => t.slug === topicSlug);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const renderBlock = (block) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-600 prose-li:text-slate-600">
            <ReactMarkdown>{block.content}</ReactMarkdown>
          </div>
        );
      case 'image':
        return (
          <figure className="my-6">
            <img 
              src={block.content} 
              alt={block.caption || 'Image'} 
              className="rounded-xl shadow-lg max-w-full mx-auto"
            />
            {block.caption && (
              <figcaption className="text-center text-sm text-slate-500 mt-3 italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      case 'video':
        return (
          <div className="my-6 aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={block.content}
              title={block.caption || 'Video'}
              className="w-full h-full"
              allowFullScreen
            />
            {block.caption && (
              <p className="text-center text-sm text-slate-500 mt-3 italic">{block.caption}</p>
            )}
          </div>
        );
      case 'code':
        return (
          <div className="my-6">
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
                <span className="text-sm text-slate-400">{block.language || 'Code'}</span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-slate-100 font-mono">{block.content}</code>
              </pre>
            </div>
            {block.caption && (
              <p className="text-center text-sm text-slate-500 mt-3 italic">{block.caption}</p>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <a 
              href={block.content} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{block.caption || 'Download File'}</p>
                <p className="text-sm text-slate-500">Click to download</p>
              </div>
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Topic not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 py-6 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Link 
              to={`/coursework/${courseSlug}`}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{course?.title}</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {user && (
                <Link to={`/coursework/${courseSlug}/${topicSlug}/edit`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit size={16} />
                    Edit
                  </Button>
                </Link>
              )}
              
              <Button
                onClick={markComplete}
                variant={completed ? "default" : "outline"}
                size="sm"
                className={`gap-2 ${completed ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                <CheckCircle size={16} />
                {completed ? 'Completed' : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Topic Header */}
          <div className="mb-10">
            <Badge className="bg-blue-100 text-blue-700 mb-4">{course?.title}</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{topic.title}</h1>
            {topic.updated_at && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Clock size={14} />
                Last updated: {new Date(topic.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Content Blocks */}
          <div className="space-y-8">
            {topic.blocks?.sort((a, b) => a.order - b.order).map((block, idx) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {renderBlock(block)}
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
              {prevTopic ? (
                <Link
                  to={`/coursework/${courseSlug}/${prevTopic.slug}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                  <div>
                    <p className="text-sm text-slate-400">Previous</p>
                    <p className="font-medium">{prevTopic.title}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              
              {nextTopic ? (
                <Link
                  to={`/coursework/${courseSlug}/${nextTopic.slug}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors text-right"
                >
                  <div>
                    <p className="text-sm text-slate-400">Next</p>
                    <p className="font-medium">{nextTopic.title}</p>
                  </div>
                  <ChevronRight size={20} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TopicPage;
