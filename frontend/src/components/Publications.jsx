import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FileText, ExternalLink, Code, Database, Filter, RefreshCw, AlertCircle, Award, TrendingUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { researchData } from '../mockData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const SCHOLAR_ID = 'adgtAm8AAAAJ';
const mockPublications = researchData.publications;
const ITEMS_PER_PAGE = 10;

const Publications = () => {
  const [filter, setFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const fetchPublications = async (forceRefresh = false) => {
    if (SCHOLAR_ID === 'YOUR_SCHOLAR_ID_HERE') {
      setLoading(false);
      setError('Google Scholar ID not configured.');
      setPublications(mockPublications);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (forceRefresh) {
        setRefreshing(true);
        await axios.delete(`${API}/publications/scholar/cache/${SCHOLAR_ID}`);
      }
      
      const response = await axios.get(`${API}/publications/scholar/${SCHOLAR_ID}`, {
        params: { max_publications: 100 }
      });
      
      setPublications(response.data.publications || []);
      setAuthorInfo({
        name: response.data.author_name,
        total_citations: response.data.total_citations,
        h_index: response.data.h_index,
        i10_index: response.data.i10_index
      });
      
      if (response.data.error) setError(response.data.error);
      
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Failed to fetch publications from Google Scholar. Please try again later.');
      setPublications(mockPublications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPublications(); }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filter, yearFilter]);

  const years = [...new Set(publications.map(p => p.year))].sort((a, b) => b - a);
  
  const filteredPublications = publications.filter(pub => {
    const typeMatch = filter === 'all' || pub.type === filter;
    const yearMatch = yearFilter === 'all' || pub.year.toString() === yearFilter;
    return typeMatch && yearMatch;
  });

  // Get only the visible publications
  const visiblePublications = filteredPublications.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPublications.length;
  const remainingCount = filteredPublications.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const publicationTypes = [
    { value: 'all', label: 'All', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    { value: 'journal', label: 'Journals', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { value: 'conference', label: 'Conferences', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { value: 'preprint', label: 'Preprints', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section id="publications" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">Academic Output</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Publications</h2>
          
          {/* Author Stats Cards */}
          {authorInfo && (
            <motion.div 
              className="mt-8 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-slate-900">{authorInfo.total_citations}</p>
                  <p className="text-sm text-slate-500">Citations</p>
                </div>
              </div>
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Award className="text-teal-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-slate-900">{authorInfo.h_index}</p>
                  <p className="text-sm text-slate-500">h-index</p>
                </div>
              </div>
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="text-purple-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-slate-900">{authorInfo.i10_index}</p>
                  <p className="text-sm text-slate-500">i10-index</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-500">Fetching publications from Google Scholar...</p>
          </div>
        )}

        {/* Publications Content */}
        {!loading && (
          <>
            {/* Filters */}
            <motion.div 
              className="mb-10 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter size={18} />
                  <span className="font-semibold">Filter by type</span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => fetchPublications(true)}
                  disabled={refreshing}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  data-testid="refresh-publications-btn"
                >
                  <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              
              {/* Type Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {publicationTypes.map(type => (
                  <Button
                    key={type.value}
                    variant="ghost"
                    className={`rounded-full px-5 transition-all ${
                      filter === type.value 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : type.color
                    }`}
                    onClick={() => setFilter(type.value)}
                    data-testid={`filter-${type.value}`}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Year Filter */}
              {years.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="ghost"
                    className={`rounded-full px-4 text-sm ${
                      yearFilter === 'all' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    onClick={() => setYearFilter('all')}
                    data-testid="filter-year-all"
                  >
                    All Years
                  </Button>
                  {years.map(year => (
                    <Button
                      key={year}
                      variant="ghost"
                      className={`rounded-full px-4 text-sm ${
                        yearFilter === year.toString() ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      onClick={() => setYearFilter(year.toString())}
                      data-testid={`filter-year-${year}`}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              )}

              {/* Results count */}
              <div className="text-center text-sm text-slate-500">
                Showing {visiblePublications.length} of {filteredPublications.length} publications
              </div>
            </motion.div>

            {/* Publications List */}
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {visiblePublications.map((pub, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 bg-white group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge 
                              className={`border-0 ${
                                pub.type === 'journal' ? 'bg-blue-100 text-blue-700' :
                                pub.type === 'conference' ? 'bg-purple-100 text-purple-700' :
                                'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {pub.type.charAt(0).toUpperCase() + pub.type.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="border-slate-200 text-slate-600">{pub.year}</Badge>
                            {pub.citations > 0 && (
                              <Badge className="bg-green-100 text-green-700 border-0">
                                <TrendingUp size={12} className="mr-1" />
                                {pub.citations} citations
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                            {pub.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-2 text-slate-500">
                            {pub.authors}
                          </CardDescription>
                          <p className="text-slate-500 italic mt-1 text-sm">{pub.venue}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {pub.links.pdf && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-full"
                            onClick={() => window.open(pub.links.pdf, '_blank')}
                            data-testid={`pub-pdf-${idx}`}
                          >
                            <FileText className="mr-2" size={14} />
                            PDF
                          </Button>
                        )}
                        {pub.links.arxiv && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 rounded-full"
                            onClick={() => window.open(pub.links.arxiv, '_blank')}
                          >
                            <ExternalLink className="mr-2" size={14} />
                            arXiv
                          </Button>
                        )}
                        {pub.links.code && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-slate-600 border-slate-200 hover:bg-slate-50 rounded-full"
                            onClick={() => window.open(pub.links.code, '_blank')}
                          >
                            <Code className="mr-2" size={14} />
                            Code
                          </Button>
                        )}
                        {pub.links.dataset && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-teal-600 border-teal-200 hover:bg-teal-50 rounded-full"
                            onClick={() => window.open(pub.links.dataset, '_blank')}
                          >
                            <Database className="mr-2" size={14} />
                            Dataset
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More Button */}
            {hasMore && (
              <motion.div 
                className="mt-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                  data-testid="load-more-btn"
                >
                  <ChevronDown className="mr-2" size={20} />
                  Load More ({Math.min(ITEMS_PER_PAGE, remainingCount)} more)
                </Button>
                <p className="mt-3 text-sm text-slate-500">
                  {remainingCount} publications remaining
                </p>
              </motion.div>
            )}

            {filteredPublications.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg">No publications found with the selected filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Publications;
