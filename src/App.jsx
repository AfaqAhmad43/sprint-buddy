import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BookSelector from './components/BookSelector';
import PercentageConverter from './components/PercentageConverter';
import SprintTimer from './components/SprintTimer';
import SavedBooks from './components/SavedBooks';
import { Calculator, Timer as TimerIcon, Info, CheckCircle, Sparkles } from 'lucide-react';

const DEFAULT_BOOK = {
  title: 'Sample Fantasy Edition',
  author: 'Brandon Sanderson',
  totalPages: 540,
  coverUrl: null,
  source: 'Sample'
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('sprint_theme') || 'dark');
  
  // Bot preset state ('bookverse', 'sprinty', 'bookish', 'custom')
  const [botPreset, setBotPreset] = useState(() => localStorage.getItem('sprint_bot') || 'bookverse');

  // Active navigation tab ('converter' or 'timer')
  const [activeTab, setActiveTab] = useState('converter');

  // Active book state
  const [currentBook, setCurrentBook] = useState(() => {
    const saved = localStorage.getItem('sprint_active_book');
    return saved ? JSON.parse(saved) : DEFAULT_BOOK;
  });

  // Saved books library state
  const [savedBooks, setSavedBooks] = useState(() => {
    const saved = localStorage.getItem('sprint_books_library');
    return saved ? JSON.parse(saved) : [DEFAULT_BOOK];
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Sync theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sprint_theme', theme);
  }, [theme]);

  // Sync bot preset
  useEffect(() => {
    localStorage.setItem('sprint_bot', botPreset);
  }, [botPreset]);

  // Sync active book
  useEffect(() => {
    localStorage.setItem('sprint_active_book', JSON.stringify(currentBook));
  }, [currentBook]);

  // Sync saved library
  useEffect(() => {
    localStorage.setItem('sprint_books_library', JSON.stringify(savedBooks));
  }, [savedBooks]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveToLibrary = (book) => {
    setSavedBooks((prev) => {
      // Avoid duplicate entries with same title and totalPages
      const exists = prev.some((b) => b.title === book.title && b.totalPages === book.totalPages);
      if (exists) return prev;
      return [book, ...prev].slice(0, 10); // Keep top 10 recent books
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
        botPreset={botPreset}
        setBotPreset={setBotPreset}
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
              botPreset={botPreset}
              onCopyToast={showToast}
            />
          ) : (
            <SprintTimer
              currentBook={currentBook}
              botPreset={botPreset}
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
              <li>Click <strong>Copy Update</strong> to grab the Discord bot command.</li>
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
