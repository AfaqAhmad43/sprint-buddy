import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BookSelector from './components/BookSelector';
import PercentageConverter from './components/PercentageConverter';
import SprintTimer from './components/SprintTimer';
import SavedBooks from './components/SavedBooks';
import { Calculator, Timer as TimerIcon, Info, CheckCircle } from 'lucide-react';

const DEFAULT_BOOK = {
  title: 'Sample Fantasy Edition',
  author: 'Brandon Sanderson',
  totalPages: 540,
  coverUrl: null,
  source: 'Sample'
};

export default function App() {
  // Theme state with safe localStorage lookup
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('sprint_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Active navigation tab ('converter' or 'timer')
  const [activeTab, setActiveTab] = useState('converter');

  // Active book state with safe localStorage JSON parse
  const [currentBook, setCurrentBook] = useState(() => {
    try {
      const saved = localStorage.getItem('sprint_active_book');
      return saved ? JSON.parse(saved) : DEFAULT_BOOK;
    } catch (e) {
      return DEFAULT_BOOK;
    }
  });

  // Saved books library state with safe localStorage JSON parse
  const [savedBooks, setSavedBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('sprint_books_library');
      return saved ? JSON.parse(saved) : [DEFAULT_BOOK];
    } catch (e) {
      return [DEFAULT_BOOK];
    }
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Sync theme to document element
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('sprint_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Sync active book
  useEffect(() => {
    try {
      localStorage.setItem('sprint_active_book', JSON.stringify(currentBook));
    } catch (e) {}
  }, [currentBook]);

  // Sync saved library
  useEffect(() => {
    try {
      localStorage.setItem('sprint_books_library', JSON.stringify(savedBooks));
    } catch (e) {}
  }, [savedBooks]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveToLibrary = (book) => {
    if (!book || !book.title) return;
    setSavedBooks((prev) => {
      const exists = prev.some((b) => b.title === book.title && b.totalPages === book.totalPages);
      if (exists) return prev;
      return [book, ...prev].slice(0, 10);
    });
  };

  const handleDeleteSavedBook = (index) => {
    setSavedBooks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllSaved = () => {
    setSavedBooks([]);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'converter' ? 'active' : ''}`}
          onClick={() => setActiveTab('converter')}
        >
          <Calculator size={18} /> Quick Page Converter
        </button>
        <button
          className={`tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          <TimerIcon size={18} /> Sprint Timer & Companion
        </button>
      </nav>

      <main className="grid-2" style={{ alignItems: 'start' }}>
        {/* Main Workspace Column */}
        <div>
          {/* Book Setup (Goodreads Link or Manual Input) */}
          <BookSelector
            currentBook={currentBook}
            setCurrentBook={setCurrentBook}
            onSaveToLibrary={handleSaveToLibrary}
          />

          {/* Active View based on Tab */}
          {activeTab === 'converter' ? (
            <PercentageConverter
              currentBook={currentBook}
              onCopyToast={showToast}
            />
          ) : (
            <SprintTimer
              currentBook={currentBook}
              onCopyToast={showToast}
            />
          )}
        </div>

        {/* Sidebar Column: Saved Books & Instructions */}
        <div>
          {/* Saved Books Library */}
          <SavedBooks
            savedBooks={savedBooks}
            currentBook={currentBook}
            onSelectBook={(book) => setCurrentBook(book)}
            onDeleteBook={handleDeleteSavedBook}
            onClearAll={handleClearAllSaved}
          />

          {/* Discord Sprint Guide Card */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818CF8', marginBottom: '0.75rem' }}>
              <Info size={16} /> How to use with Bookverse
            </h4>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
              <li>Paste your book link from <strong>Goodreads</strong> or type total physical pages manually.</li>
              <li>Type your e-reader percentage (e.g. <code>42.5%</code>) to see your exact physical page number.</li>
              <li>Click <strong>Copy Command</strong> to grab your Bookverse command (`/sprint update page: X`).</li>
              <li>Paste into your Discord reading sprint channel!</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle size={18} color="var(--accent-emerald)" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
