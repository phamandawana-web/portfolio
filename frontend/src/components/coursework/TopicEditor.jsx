import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Type, Image, Video, Code, FileText, X, History, Music, FileEdit } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from './RichTextEditor';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const blockTypes = [
  { type: 'richtext', icon: FileEdit, label: 'Rich Text', description: 'Full-featured editor with formatting' },
  { type: 'text', icon: Type, label: 'Plain Text', description: 'Simple markdown content' },
  { type: 'image', icon: Image, label: 'Image', description: 'Add an image from URL' },
  { type: 'video', icon: Video, label: 'Video', description: 'Embed a video (YouTube, etc.)' },
  { type: 'audio', icon: Music, label: 'Audio', description: 'Embed audio content' },
  { type: 'code', icon: Code, label: 'Code Snippet', description: 'Add code with syntax highlighting' },
  { type: 'file', icon: FileText, label: 'File Attachment', description: 'Link to PDF, slides, etc.' }
];

const SortableBlock = ({ block, onUpdate, onDelete, courses = [] }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockTypeInfo = blockTypes.find(b => b.type === block.type);
  const IconComponent = blockTypeInfo?.icon || Type;

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className={`border-2 ${isDragging ? 'border-blue-400 shadow-lg' : 'border-slate-200'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
            >
              <GripVertical size={20} className="text-slate-400" />
            </button>
            <Badge variant="outline" className="gap-1">
              <IconComponent size={14} />
              {blockTypeInfo?.label}
            </Badge>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {block.type === 'richtext' && (
            <RichTextEditor
              content={block.content || ''}
              onChange={(html) => onUpdate(block.id, { content: html })}
              placeholder="Start writing your content..."
              minHeight="250px"
              courses={courses}
            />
          )}
          {block.type === 'text' && (
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Enter markdown content..."
              className="min-h-[200px] font-mono text-sm"
            />
          )}
          {block.type === 'image' && (
            <div className="space-y-3">
              <Input
                value={block.content}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder="Image URL..."
              />
              <Input
                value={block.caption || ''}
                onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                placeholder="Caption (optional)"
              />
              {block.content && (
                <img src={block.content} alt="Preview" className="max-h-40 rounded-lg" />
              )}
            </div>
          )}
          {block.type === 'video' && (
            <div className="space-y-3">
              <Input
                value={block.content}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder="Video embed URL (YouTube, Vimeo)..."
              />
              <Input
                value={block.caption || ''}
                onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                placeholder="Caption (optional)"
              />
            </div>
          )}
          {block.type === 'code' && (
            <div className="space-y-3">
              <Input
                value={block.language || ''}
                onChange={(e) => onUpdate(block.id, { language: e.target.value })}
                placeholder="Language (e.g., python, javascript)"
              />
              <Textarea
                value={block.content}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder="Enter code..."
                className="min-h-[150px] font-mono text-sm"
              />
              <Input
                value={block.caption || ''}
                onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                placeholder="Caption (optional)"
              />
            </div>
          )}
          {block.type === 'file' && (
            <div className="space-y-3">
              <Input
                value={block.content}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder="File URL or upload..."
              />
              <Input
                value={block.caption || ''}
                onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                placeholder="File name/description"
              />
            </div>
          )}
          {block.type === 'audio' && (
            <div className="space-y-3">
              <Input
                value={block.content}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder="Audio URL (MP3, WAV, OGG)..."
              />
              <Input
                value={block.caption || ''}
                onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                placeholder="Audio title/description"
              />
              {block.content && (
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-lg">
                  <p className="text-white font-medium mb-2">🎵 {block.caption || 'Audio Preview'}</p>
                  <audio controls src={block.content} className="w-full" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TopicEditor = () => {
  const { courseSlug, topicSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [topic, setTopic] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      navigate('/coursework/login');
      return;
    }
    fetchTopic();
  }, [courseSlug, topicSlug, user, authLoading]);

  const fetchTopic = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseSlug}/topics/${topicSlug}`);
      setTopic(response.data);
      setBlocks(response.data.blocks || []);
      
      // Fetch versions
      const versionsRes = await axios.get(`${API}/courses/topics/${response.data.id}/versions`);
      setVersions(versionsRes.data);
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: uuidv4(),
      type,
      content: '',
      caption: null,
      language: null,
      order: blocks.length + 1
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, updates) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id).map((b, idx) => ({ ...b, order: idx + 1 })));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/courses/topics/${topic.id}`, {
        blocks,
        change_summary: changeSummary || 'Content updated'
      });
      setChangeSummary('');
      alert('Changes saved successfully!');
      // Refresh versions
      const versionsRes = await axios.get(`${API}/courses/topics/${topic.id}/versions`);
      setVersions(versionsRes.data);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = async (version) => {
    if (!window.confirm(`Restore to version ${version}? Current changes will be saved as a new version.`)) return;
    
    try {
      await axios.post(`${API}/courses/topics/${topic.id}/restore/${version}`);
      fetchTopic();
      setShowVersions(false);
    } catch (error) {
      console.error('Error restoring:', error);
      alert('Error restoring version');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to={`/coursework/${courseSlug}/${topicSlug}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={20} />
            Back to Topic
          </Link>
          
          <div className="flex items-center gap-3">
            <Dialog open={showVersions} onOpenChange={setShowVersions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <History size={16} />
                  History ({versions.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Version History</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {versions.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No previous versions</p>
                  ) : (
                    versions.slice().reverse().map((v) => (
                      <div key={v.version} className="p-3 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Version {v.version}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(v.updated_at).toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-500">by {v.updated_by}</p>
                            {v.change_summary && (
                              <p className="text-sm text-slate-600 mt-1">{v.change_summary}</p>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => restoreVersion(v.version)}>
                            Restore
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={saveChanges} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit: {topic?.title}</h1>
          <Input
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="Describe your changes (optional)..."
            className="max-w-md"
          />
        </div>

        {/* Add Block Buttons */}
        <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-600 mb-3">Add Content Block:</p>
          <div className="flex flex-wrap gap-2">
            {blockTypes.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addBlock(type)}
                className="gap-2"
              >
                <Icon size={16} />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Blocks */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 mb-4">No content blocks yet</p>
                <p className="text-sm text-slate-400">Click the buttons above to add content</p>
              </div>
            ) : (
              blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default TopicEditor;
