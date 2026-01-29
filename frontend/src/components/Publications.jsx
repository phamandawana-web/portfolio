import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, ExternalLink, Code, Database, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Your Google Scholar ID - Update this with your actual Scholar ID!
// To find it: Go to your Google Scholar profile, the URL will be:
// https://scholar.google.com/citations?user=YOUR_ID_HERE
// Replace the value below with YOUR_ID_HERE
const SCHOLAR_ID = 'YOUR_SCHOLAR_ID_HERE';  // Update this!

const Publications = () => {
  const [filter, setFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPublications = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache if force refresh
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
      
      if (response.data.error) {
        setError(response.data.error);
      }
      
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Failed to fetch publications from Google Scholar. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const years = [...new Set(publications.map(p => p.year))].sort((a, b) => b - a);

  const filteredPublications = publications.filter(pub => {
    const typeMatch = filter === 'all' || pub.type === filter;
    const yearMatch = yearFilter === 'all' || pub.year.toString() === yearFilter;
    return typeMatch && yearMatch;
  });

  const publicationTypes = [
    { value: 'all', label: 'All' },
    { value: 'journal', label: 'Journals' },
    { value: 'conference', label: 'Conferences' },
    { value: 'preprint', label: 'Preprints' }
  ];

  return (
    <section id="publications" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Publications</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
          
          {/* Author Stats */}
          {authorInfo && (
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="font-semibold text-slate-700">Citations: </span>
                <span className="text-teal-600">{authorInfo.total_citations}</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="font-semibold text-slate-700">h-index: </span>
                <span className="text-teal-600">{authorInfo.h_index}</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="font-semibold text-slate-700">i10-index: </span>
                <span className="text-teal-600">{authorInfo.i10_index}</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Fetching publications from Google Scholar...</p>
          </div>
        )}

        {/* Publications Content */}
        {!loading && (
          <>
            {/* Filters and Refresh */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-slate-600" />
                  <span className="font-semibold text-slate-700">Filter by:</span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => fetchPublications(true)}
                  disabled={refreshing}
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
                  {refreshing ? 'Refreshing...' : 'Refresh from Scholar'}
                </Button>
              </div>
              
              {/* Type Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {publicationTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={filter === type.value ? 'default' : 'outline'}
                    className={filter === type.value ? 'bg-teal-600 hover:bg-teal-700' : ''}
                    onClick={() => setFilter(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Year Filter */}
              {years.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={yearFilter === 'all' ? 'default' : 'outline'}
                    className={yearFilter === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                    onClick={() => setYearFilter('all')}
                  >
                    All Years
                  </Button>
                  {years.map(year => (
                    <Button
                      key={year}
                      variant={yearFilter === year.toString() ? 'default' : 'outline'}
                      className={yearFilter === year.toString() ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setYearFilter(year.toString())}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Publications List */}
            <div className="space-y-6">
              {filteredPublications.map((pub, idx) => (
                <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge 
                            className={
                              pub.type === 'journal' ? 'bg-blue-600' :
                              pub.type === 'conference' ? 'bg-purple-600' :
                              'bg-amber-600'
                            }
                          >
                            {pub.type.charAt(0).toUpperCase() + pub.type.slice(1)}
                          </Badge>
                          <Badge variant="outline">{pub.year}</Badge>
                          {pub.citations > 0 && (
                            <Badge variant="secondary" className="bg-slate-100">
                              {pub.citations} citations
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl text-slate-800 mb-2">
                          {pub.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {pub.authors}
                        </CardDescription>
                        <p className="text-slate-600 italic mt-1">{pub.venue}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {pub.links.pdf && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-teal-600 hover:text-teal-700"
                          onClick={() => window.open(pub.links.pdf, '_blank')}
                        >
                          <FileText className="mr-2" size={14} />
                          PDF
                        </Button>
                      )}
                      {pub.links.arxiv && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-teal-600 hover:text-teal-700"
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
                          className="text-teal-600 hover:text-teal-700"
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
                          className="text-teal-600 hover:text-teal-700"
                          onClick={() => window.open(pub.links.dataset, '_blank')}
                        >
                          <Database className="mr-2" size={14} />
                          Dataset
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPublications.length === 0 && !loading && (
              <div className="text-center py-12">
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