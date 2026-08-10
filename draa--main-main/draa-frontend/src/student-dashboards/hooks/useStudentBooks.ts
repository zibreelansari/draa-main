import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import uri from'../../url';

export interface Book {
  purchaseId: string;
  bookId: string;
  book: {
    title: string;
    description: string;
    category: string;
    coverImage: string;
    author: string;
    publisher: string;
    pages: number;
    language: string;
    isbn: string;
    publishedDate: string;
    rating: number;
    reviews: number;
    pdfFile: string;
    format: string;
  };
  purchaseType:"book" |"ebook";
  purchaseDate: string;
  amountPaid: number;
  currency: string;
  status: string;
  paymentStatus: string;
  deliveryStatus?: string;
  downloadCount: number;
  lastDownloaded: string;
  readingProgress: number;
  isFavorite: boolean;
}

export interface BookStats {
  totalBooks: number;
  physicalBooks: number;
  ebooks: number;
  completedBooks: number;
  inProgressBooks: number;
  notStartedBooks: number;
  totalSpent: number;
  totalReadingTime: number;
  averageProgress: number;
  favoriteBooks: number;
}

export const useStudentBooks = (studentId?: string, token?: string) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<BookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async (filters: { category?: string; format?: string; search?: string } = {}) => {
    console.log(' fetchBooks called with:', { studentId, hasToken: !!token });

    if (!studentId || !token) {
      console.log(' fetchBooks aborted: studentId or token missing');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit:"50",
        ...(filters.category && filters.category !=='all' && { category: filters.category }),
        ...(filters.format && filters.format !=='all' && { format: filters.format }),
        ...(filters.search && { search: filters.search })
      });

      const endpoint = `${uri}/student/books/purchase/my-books/${studentId}?${params}`;
      console.log(' Fetching from:', endpoint);

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(' Response status:', response.status);
      const data = await response.json();
      console.log(' Received data:', data);

      if (data.success) {
        setBooks(data.books || []);
        setCategories(data.categories || []);
        setStats(data.stats || null);
      } else {
        throw new Error(data.message ||"Failed to load books");
      }
    } catch (err: any) {
      console.error(' fetchBooks Error:', err);
      setError(err.message ||"Failed to connect to server");
      toast.error("Error loading books");
    } finally {
      setLoading(false);
    }
  }, [studentId, token]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, categories, stats, loading, error, refresh: fetchBooks };
};
