import React, { useState } from 'react';
import { Search, Link as LinkIcon, Edit3, Check, BookPlus, RefreshCw } from 'lucide-react';
import { fetchBookMetadata } from '../services/bookApi';

export default function BookSelector({ currentBook, setCurrentBook, onSaveToLibrary }) {
  const [inputMode, setInputMode] = useState('goodreads'); // 'goodreads' or 'manual'
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manual inputs state
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualPages, setManualPages] = useState('');

  // Edit page state
  const [isEditingPages, setIsEditingPages] = useState(false);
  const [editedPages, setEditedPages] = useState(currentBook ? currentBook.totalPages : 350);

  const handleFetchBook = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const book = await fetchBookMetadata(query);
      if (book) {
        setCurrentBook(book);
        onSaveToLibrary(book);
        setEditedPages(book.totalPages);
      } else {
        setErrorMsg('Book not found. You can switch to Manual Entry to type your page count directly!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch book. Try entering details manually below.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetManualBook = (e) => {
    e.preventDefault();
    const pages = parseInt(manualPages, 10);
    if (!pages || pages <= 0) {
      setErrorMsg('Please enter a valid page count.');
      return;
    }

    const newBook = {
      title: manualTitle.trim() || 'My Current Book',
      author: manualAuthor.trim() || 'Author',
      totalPages: pages,
      coverUrl: null,
      source: 'Manual Input'
    };

    setCurrentBook(newBook);
    onSaveToLibrary(newBook);
    setEditedPages(pages);
    setErrorMsg('');
  };

  const handleSaveEditedPages = () => {
    const pages = parseInt(editedPages, 10);
    if (pages && pages > 0) {
      const updated = { ...currentBook, totalPages: pages };
      setCurrentBook(updated);
      onSaveToLibrary(updated);
    }
    setIsEditingPages(false);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookPlus size={20} color="var(--accent-primary)" />
          Book & Edition Setup
        </h3>

        <div className="mode-toggle" style={{ margin: 0 }}>
          <button 
            type="button"
            className={`mode-btn ${inputMode === 'goodreads' ? 'active' : ''}`}
            onClick={() => setInputMode('goodreads')}
          >
            <LinkIcon size={14} /> Goodreads / Search
          </button>
          <button 
            type="button"
            className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
            onClick={() => setInputMode('manual')}
          >
            <Edit3 size={14} /> Manual Entry
          </button>
        </div>
      </div>

      {/* Input Mode 1: Goodreads / Search */}
      {inputMode === 'goodreads' && (
        <form onSubmit={handleFetchBook} style={{ marginBottom: '1.25rem' }}>
          <div className="input-group" style={{ marginBottom: '0.75rem' }}>
            <div className="input-label">
              <span>Goodreads URL, ISBN, or Book Title</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Auto-fetches physical page count</span>
            </div>
            <div className="input-wrapper">
              <LinkIcon className="input-icon" size={18} />
              <input
                type="text"
                className="custom-input"
                placeholder="Paste Goodreads link (e.g. goodreads.com/book/show/...) or type title"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? <RefreshCw size={18} className="spin" /> : <Search size={18} />}
              {loading ? 'Fetching Book Details...' : 'Fetch Book Pages'}
            </button>
          </div>
        </form>
      )}

      {/* Input Mode 2: Manual Page Input */}
      {inputMode === 'manual' && (
        <form onSubmit={handleSetManualBook} style={{ marginBottom: '1.25rem' }}>
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Book Title (Optional)</label>
              <input
                type="text"
                className="custom-input no-icon"
                placeholder="e.g. Babel"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Author (Optional)</label>
              <input
                type="text"
                className="custom-input no-icon"
                placeholder="e.g. R.F. Kuang"
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '0.75rem' }}>
            <label className="input-label" style={{ color: '#818CF8' }}>Total Physical Pages *</label>
            <input
              type="number"
              className="custom-input no-icon mono-font"
              placeholder="e.g. 544"
              value={manualPages}
              onChange={(e) => setManualPages(e.target.value)}
              min="1"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            <Check size={18} /> Set Total Pages ({manualPages || '---'})
          </button>
        </form>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Active Book Card Preview */}
      {currentBook && (
        <div className="book-preview-card" style={{ margin: 0 }}>
          <div className="book-cover">
            {currentBook.coverUrl ? (
              <img src={currentBook.coverUrl} alt={currentBook.title} style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} />
            ) : (
              '📖'
            )}
          </div>

          <div className="book-info" style={{ flex: 1 }}>
            <h4>{currentBook.title}</h4>
            <p>{currentBook.author}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {!isEditingPages ? (
                <div className="book-page-badge">
                  <span>{currentBook.totalPages} Total Physical Pages</span>
                  <button 
                    onClick={() => { setIsEditingPages(true); setEditedPages(currentBook.totalPages); }} 
                    style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'inline-flex', padding: '2px' }}
                    title="Edit Page Count"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <input
                    type="number"
                    value={editedPages}
                    onChange={(e) => setEditedPages(e.target.value)}
                    className="mono-font"
                    style={{ width: '80px', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--accent-primary)', background: 'var(--bg-input)', color: 'white' }}
                  />
                  <button onClick={handleSaveEditedPages} className="btn-copy" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    <Check size={12} /> Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
