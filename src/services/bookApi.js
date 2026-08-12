/**
 * Robust Book & Goodreads API Service
 * Parses Goodreads links, ISBNs, and searches Open Library & Google Books.
 */

export const parseGoodreadsUrl = (inputStr) => {
  if (!inputStr) return null;
  let clean = inputStr.trim();

  // Strip query parameters and hashes (e.g. ?from_search=true)
  clean = clean.split('?')[0].split('#')[0].replace(/\/$/, '');

  // 1. Check for standalone ISBN-10 or ISBN-13 (or ISBN embedded in Goodreads URL)
  const isbnMatches = clean.match(/\b(\d{13}|\d{10}|\d{9}[\dX])\b/gi);
  if (isbnMatches) {
    const validIsbn = isbnMatches.find(d => d.length === 13 || d.length === 10);
    if (validIsbn) {
      return { type: 'isbn', value: validIsbn };
    }
  }

  // 2. Match Goodreads URL structure:
  // e.g. https://www.goodreads.com/book/show/58283080-babel-or-the-necessity-of-violence
  // or https://www.goodreads.com/book/show/2657.To_Kill_a_Mockingbird
  // or https://www.goodreads.com/book/show/186074
  const grMatch = clean.match(/goodreads\.com\/book\/show\/(\d+)[._-]?([^/]*)/i);
  if (grMatch) {
    const grId = grMatch[1];
    const rawSlug = grMatch[2];

    // If ID itself is an ISBN
    if (grId.length === 10 || grId.length === 13) {
      return { type: 'isbn', value: grId };
    }

    if (rawSlug && rawSlug.trim() !== '') {
      // Clean slug into search terms
      const titleQuery = rawSlug.replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim();
      return { type: 'slug', grId, titleQuery };
    }

    return { type: 'gr_id', grId, titleQuery: grId };
  }

  // Fallback: Use string as generic query search
  return { type: 'search', titleQuery: clean };
};

export const fetchBookMetadata = async (inputQuery) => {
  if (!inputQuery) return null;

  const parsed = parseGoodreadsUrl(inputQuery);
  console.log('Parsed Goodreads input:', parsed);

  // Strategy A: If ISBN detected, search Open Library & Google Books by ISBN
  if (parsed && parsed.type === 'isbn') {
    const isbnBook = await fetchByIsbn(parsed.value);
    if (isbnBook && isbnBook.totalPages > 0) return isbnBook;
  }

  // Strategy B: Search Open Library by Title/Query with Edition details
  const searchQuery = parsed && parsed.titleQuery ? parsed.titleQuery : inputQuery;
  
  try {
    const olResult = await fetchFromOpenLibrary(searchQuery);
    if (olResult && olResult.totalPages > 0) {
      return olResult;
    }
  } catch (err) {
    console.warn('Open Library search warning:', err);
  }

  // Strategy C: Google Books API Fallback
  try {
    const gResult = await fetchFromGoogleBooks(searchQuery);
    if (gResult && gResult.totalPages > 0) {
      return gResult;
    }
  } catch (err) {
    console.warn('Google Books search warning:', err);
  }

  // Strategy D: Fallback object with parsed title so user can adjust page count manually
  const formattedTitle = searchQuery.replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: formattedTitle.length > 2 ? formattedTitle : 'Selected Book',
    author: 'Unknown Author',
    totalPages: 350,
    coverUrl: null,
    source: 'Title Lookup (Set Pages Below)'
  };
};

// Open Library Multi-edition searcher
const fetchFromOpenLibrary = async (query) => {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=title,author_name,edition_key,cover_i,isbn,number_of_pages_median&limit=5`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.docs || data.docs.length === 0) return null;

  for (const doc of data.docs) {
    let pages = doc.number_of_pages_median || 0;
    let coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null;

    // If doc page count missing, check top 3 editions
    if (!pages && doc.edition_key && doc.edition_key.length > 0) {
      for (const edKey of doc.edition_key.slice(0, 3)) {
        try {
          const edRes = await fetch(`https://openlibrary.org/books/${edKey}.json`);
          if (edRes.ok) {
            const edData = await edRes.json();
            if (edData.number_of_pages && edData.number_of_pages > 0) {
              pages = edData.number_of_pages;
              if (!coverUrl && edData.covers && edData.covers[0]) {
                coverUrl = `https://covers.openlibrary.org/b/id/${edData.covers[0]}-M.jpg`;
              }
              break;
            }
          }
        } catch (e) {
          // ignore edition fetch error
        }
      }
    }

    if (pages > 0) {
      return {
        title: doc.title || 'Unknown Title',
        author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
        totalPages: pages,
        coverUrl: coverUrl,
        isbn: doc.isbn ? doc.isbn[0] : null,
        source: 'Open Library'
      };
    }
  }

  // Fallback to first doc even if pages not found directly
  const first = data.docs[0];
  return {
    title: first.title || 'Unknown Title',
    author: first.author_name ? first.author_name.join(', ') : 'Unknown Author',
    totalPages: 350,
    coverUrl: first.cover_i ? `https://covers.openlibrary.org/b/id/${first.cover_i}-M.jpg` : null,
    source: 'Open Library (Set Pages Below)'
  };
};

// Google Books Fallback Searcher
const fetchFromGoogleBooks = async (query) => {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.items || data.items.length === 0) return null;

  const bestItem = data.items.find(item => item.volumeInfo?.pageCount > 0) || data.items[0];
  const info = bestItem.volumeInfo;

  return {
    title: info.title || 'Unknown Title',
    author: info.authors ? info.authors.join(', ') : 'Unknown Author',
    totalPages: info.pageCount || 350,
    coverUrl: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
    isbn: info.industryIdentifiers?.[0]?.identifier || null,
    source: 'Google Books'
  };
};

// ISBN Searcher
const fetchByIsbn = async (isbn) => {
  try {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    if (res.ok) {
      const data = await res.json();
      const key = `ISBN:${isbn}`;
      if (data[key]) {
        const book = data[key];
        return {
          title: book.title || 'Unknown Title',
          author: book.authors ? book.authors.map(a => a.name).join(', ') : 'Unknown Author',
          totalPages: book.number_of_pages || 350,
          coverUrl: book.cover?.medium || null,
          isbn: isbn,
          source: 'Open Library (ISBN)'
        };
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return fetchFromGoogleBooks(`isbn:${isbn}`);
};
