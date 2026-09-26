import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Plus, Image as ImageIcon, MapPin, Calendar, Trash2, Edit2 } from 'lucide-react';

export function MemoriesPage() {
  const { user, couple, partner } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    memoryDate: new Date().toISOString().split('T')[0],
    location: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const res = await api.getMemories({ limit: 100 });
      setMemories(res.data || []);
    } catch (err) {
      console.error('[Memories load error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (couple) {
      loadMemories();
    }
  }, [couple]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      memoryDate: new Date().toISOString().split('T')[0],
      location: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setShowAddModal(true);
  };

  const handleSubmitMemory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('memoryDate', formData.memoryDate);
      if (formData.location) data.append('location', formData.location);
      if (imageFile) data.append('image', imageFile);

      await api.createMemory(data);
      setShowAddModal(false);
      loadMemories();
    } catch (err) {
      alert(err.message || 'Could not save memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this memory?')) return;
    try {
      await api.deleteMemory(id);
      loadMemories();
      if (selectedMemory?.id === id) {
        setSelectedMemory(null);
      }
    } catch (err) {
      alert(err.message || 'Could not delete memory');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="memories-header-row">
        <div>
          <h1 className="memories-page-title">Shared Memories</h1>
          <p className="memories-page-sub">A personal archive of the moments you've created together.</p>
        </div>
        <button
          type="button"
          className="tm-btn tm-btn-primary tm-btn-sm"
          onClick={handleOpenAdd}
        >
          <Plus size={16} />
          <span>Add Memory</span>
        </button>
      </div>

      {loading ? (
        <div className="memories-loading-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="tm-card tm-skeleton" style={{ height: '240px' }} />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Nothing here yet."
          description="Your first memory can start here. Capture a trip, a milestone, or a quiet moment from a call."
          actionText="Add your first memory"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="memories-stream">
          {memories.map((mem) => (
            <article
              key={mem.id}
              className="tm-card memory-entry-card"
              onClick={() => setSelectedMemory(mem)}
            >
              {mem.image_url && (
                <div className="memory-card-image-wrap">
                  <img src={mem.image_url} alt={mem.title} loading="lazy" />
                </div>
              )}

              <div className="memory-card-body">
                <div className="memory-meta-strip">
                  <span className="memory-date-tag">
                    <Calendar size={13} />
                    {new Date(mem.memory_date).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  {mem.location && (
                    <span className="memory-location-tag">
                      <MapPin size={13} />
                      {mem.location}
                    </span>
                  )}
                </div>

                <h3 className="memory-card-title">{mem.title}</h3>

                {mem.description && (
                  <p className="memory-card-desc">"{mem.description}"</p>
                )}

                <div className="memory-card-footer">
                  <span className="memory-creator-badge">
                    Added by {mem.creator_name}
                  </span>
                  <button
                    type="button"
                    className="memory-delete-btn"
                    onClick={(e) => handleDelete(mem.id, e)}
                    aria-label="Delete memory"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Memory"
      >
        <form onSubmit={handleSubmitMemory}>
          <div className="tm-form-group">
            <label className="tm-label">Title</label>
            <input
              type="text"
              className="tm-input"
              placeholder="e.g. Our evening walk along the river"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Date</label>
            <input
              type="date"
              className="tm-input"
              value={formData.memoryDate}
              onChange={(e) => setFormData({ ...formData, memoryDate: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Location (Optional)</label>
            <input
              type="text"
              className="tm-input"
              placeholder="e.g. Central Park, New York"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Photograph (Optional)</label>
            <input
              type="file"
              className="tm-input"
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <div style={{ marginTop: '10px', height: '140px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Description or Note</label>
            <textarea
              className="tm-textarea"
              placeholder="One of those simple days I wish could last longer..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="tm-btn tm-btn-primary tm-btn-full"
            disabled={isSubmitting}
            style={{ marginTop: '10px' }}
          >
            {isSubmitting ? 'Saving Memory...' : 'Save to Archive'}
          </button>
        </form>
      </Modal>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <Modal
          isOpen={!!selectedMemory}
          onClose={() => setSelectedMemory(null)}
          title={selectedMemory.title}
          maxWidth="640px"
        >
          <div>
            {selectedMemory.image_url && (
              <div style={{ maxHeight: '340px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '16px' }}>
                <img src={selectedMemory.image_url} alt={selectedMemory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div className="memory-meta-strip" style={{ marginBottom: '12px' }}>
              <span className="memory-date-tag">
                <Calendar size={14} />
                {new Date(selectedMemory.memory_date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              {selectedMemory.location && (
                <span className="memory-location-tag">
                  <MapPin size={14} />
                  {selectedMemory.location}
                </span>
              )}
            </div>
            {selectedMemory.description && (
              <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.6', margin: '16px 0' }}>
                "{selectedMemory.description}"
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Preserved by {selectedMemory.creator_name}
              </span>
              <button
                type="button"
                className="tm-btn tm-btn-danger tm-btn-sm"
                onClick={(e) => handleDelete(selectedMemory.id, e)}
              >
                Delete memory
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .memories-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }

        .memories-page-title {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          margin-bottom: 4px;
        }

        .memories-page-sub {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .memories-loading-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .memories-stream {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .memory-entry-card {
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .memory-entry-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .memory-card-image-wrap {
          width: 100%;
          max-height: 320px;
          background-color: var(--bg-subtle);
          overflow: hidden;
        }

        .memory-card-image-wrap img {
          width: 100%;
          height: 100%;
          max-height: 320px;
          object-fit: cover;
          display: block;
        }

        .memory-card-body {
          padding: 20px 24px;
        }

        .memory-meta-strip {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .memory-date-tag, .memory-location-tag {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .memory-card-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .memory-card-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.55;
          font-style: italic;
          margin-bottom: 16px;
        }

        .memory-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
        }

        .memory-creator-badge {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .memory-delete-btn {
          color: var(--text-muted);
          padding: 4px;
          border-radius: var(--radius-xs);
          transition: color var(--transition-fast);
        }

        .memory-delete-btn:hover {
          color: var(--danger);
        }
      `}</style>
    </div>
  );
}
