import React from 'react';
import { Bookmark, Trash2, CheckCircle2 } from 'lucide-react';

export default function SavedBooks({ savedBooks, currentBook, onSelectBook, onDeleteBook, onClearAll }) {
  if (!savedBooks || savedBooks.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bookmark size={18} color="var(--accent-primary)" />
          Saved Books Library ({savedBooks.length})
        </h3>
        {savedBooks.length > 0 && (
          <button 
            onClick={onClearAll} 
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Clear History
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {savedBooks.map((book, idx) => {
          const isSelected = currentBook && currentBook.title === book.title && currentBook.totalPages === book.totalPages;

          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: isSelected ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid var(--border-color)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onSelectBook(book)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <div style={{ width: '28px', height: '40px', background: '#1E293B', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', overflow: 'hidden' }}>
                  {book.coverUrl ? <img src={book.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📖'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? '#A5B4FC' : 'var(--text-main)' }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {book.author} • <span className="mono-font" style={{ color: '#38BDF8' }}>{book.totalPages} Pages</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isSelected && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBook(idx);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                  title="Remove Book"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
