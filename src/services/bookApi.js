/**
 * Book API Service
 * Fetches book page counts and metadata from Open Library & Google Books APIs.
 * Supports Goodreads URL parsing, ISBN lookup, and keyword search.
 */

export const parseGoodreadsUrl = (urlStr) => {
  if (!urlStr) return null;
  const cleanUrl = urlStr.trim();

  // Check if direct ISBN-10 or ISBN-13
  const cleanDigits = cleanUrl.replace(/[^0-9X]/gi, '');
  if (cleanDigits.length === 10 || cleanDigits.length === 13) {
    return { type: 'isbn', value: cleanDigits };
  }

  // Extract pattern from Goodreads URLs:
  // e.g., https://www.goodreads.com/book/show/58283080-babel-or-the-necessity-of-violence
  // or https://www.goodreads.com/book/show/9780593356159-iron-flame
  const grMatch = cleanUrl.match(/goodreads\.com\/book\/show\/(\d+)[.-]?([^/?#]*)/i);
  if (grMatch) {
    const idOrIsbn = grMatch[1];
    const slug = grMatch[2];

    // If ID is 10 or 13 digits, it's likely an ISBN
    if (idOrIsbn.length === 10 || idOrIsbn.length === 13) {
      return { type: 'isbn', value: idOrIsbn };
    }

    // Convert slug (e.g. babel-or-the-necessity-of-violence) to search query
    const titleQuery = slug ? slug.replace(/[-_]+/g, ' ').trim() : '';
    return { type: 'gr_slug', grId: idOrIsbn, titleQuery: titleQuery || idOrIsbn };
  }

  // Generic query string fallback
  return { type: 'search', value: cleanUrl };
};

export const fetchBookMetadata = async (inputQuery) => {
  if (!inputQuery) return null;

  const parsed = parseGoodreadsUrl(inputQuery);

  // Strategy 1: If we have an ISBN, query Google Books & Open Library by ISBN
  if (parsed && parsed.type === 'isbn') {
    const isbnResult = await fetchByIsbn(parsed.value);
    if (isbnResult) return isbnResult;
  }

  // Strategy 2: If we have a title query from Goodreads slug or search string
  const searchQuery = parsed && parsed.titleQuery ? parsed.titleQuery : inputQuery;

  // Try Google Books Search
  try {
    const gResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`);
    if (gResponse.ok) {
      const gData = await gResponse.json();
      if (gData.items && gData.items.length > 0) {
        // Find best item with pageCount
        const bestItem = gData.items.find(item => item.volumeInfo?.pageCount > 0) || gData.items[0];
        const info = bestItem.volumeInfo;

        return {
          title: info.title || 'Unknown Title',
          author: info.authors ? info.authors.join(', ') : 'Unknown Author',
          totalPages: info.pageCount || 300,
          coverUrl: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
          isbn: info.industryIdentifiers?.[0]?.identifier || null,
          publisher: info.publisher || '',
          source: 'Google Books API'
        };
      }
    }
  } catch (err) {
    console.warn('Google Books API search error:', err);
  }

  // Strategy 3: Try Open Library Search as secondary fallback
  try {
    const olResponse = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=5`);
    if (olResponse.ok) {
      const olData = await olResponse.json();
      if (olData.docs && olData.docs.length > 0) {
        const doc = olData.docs.find(d => d.number_of_pages_median || d.number_of_pages) || olData.docs[0];
        const pages = doc.number_of_pages_median || doc.number_of_pages || 300;
        const coverId = doc.cover_i;

        return {
          title: doc.title || 'Unknown Title',
          author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
          totalPages: pages,
          coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
          isbn: doc.isbn ? doc.isbn[0] : null,
          source: 'Open Library API'
        };
      }
    }
  } catch (err) {
    console.warn('Open Library API search error:', err);
  }

  return null;
};

const fetchByIsbn = async (isbn) => {
  try {
    const gResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (gResponse.ok) {
      const gData = await gResponse.json();
      if (gData.items && gData.items.length > 0) {
        const info = gData.items[0].volumeInfo;
        if (info.pageCount) {
          return {
            title: info.title || 'Unknown Title',
            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
            totalPages: info.pageCount,
            coverUrl: info.imageLinks?.thumbnail || null,
            isbn: isbn,
            source: 'Google Books (ISBN)'
          };
        }
      }
    }
  } catch (e) {
    console.warn('ISBN Google Books error:', e);
  }

  try {
    const olResponse = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    if (olResponse.ok) {
      const olData = await olResponse.json();
      const key = `ISBN:${isbn}`;
      if (olData[key]) {
        const book = olData[key];
        return {
          title: book.title || 'Unknown Title',
          author: book.authors ? book.authors.map(a => a.name).join(', ') : 'Unknown Author',
          totalPages: book.number_of_pages || 300,
          coverUrl: book.cover?.medium || null,
          isbn: isbn,
          source: 'Open Library (ISBN)'
        };
      }
    }
  } catch (e) {
    console.warn('ISBN Open Library error:', e);
  }

  return null;
};
