'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, Loan, ReadingReview, User, ToastMessage } from '../types/library';
import { INITIAL_BOOKS, INITIAL_LOANS, INITIAL_USERS, INITIAL_REVIEWS } from '../data/initial-data';

interface LibraryContextType {
  books: Book[];
  loans: Loan[];
  users: User[];
  reviews: ReadingReview[];
  wishlist: string[];
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  addBook: (bookData: Omit<Book, 'id' | 'addedAt'>) => Book;
  updateBook: (id: string, updatedFields: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  borrowBook: (bookId: string, userId: string, days?: number, notes?: string) => { success: boolean; message: string };
  returnBook: (loanId: string, notes?: string) => { success: boolean; message: string };
  renewLoan: (loanId: string, extraDays?: number) => { success: boolean; message: string };
  toggleWishlist: (bookId: string) => void;
  isWishlisted: (bookId: string) => boolean;
  addReview: (bookId: string, userId: string, userName: string, rating: number, comment: string) => void;
  getBookReviews: (bookId: string) => ReadingReview[];
  getUserLoans: (userId: string) => Loan[];
  getUserActiveLoans: (userId: string) => Loan[];
  getUserPastLoans: (userId: string) => Loan[];
  resetToDefaultData: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'cnviegas_library_books',
  LOANS: 'cnviegas_library_loans',
  USERS: 'cnviegas_library_users',
  REVIEWS: 'cnviegas_library_reviews',
  WISHLIST: 'cnviegas_library_wishlist',
};

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [reviews, setReviews] = useState<ReadingReview[]>(INITIAL_REVIEWS);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      if (savedBooks) setBooks(JSON.parse(savedBooks));

      const savedLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (savedLoans) setLoans(JSON.parse(savedLoans));

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (savedReviews) setReviews(JSON.parse(savedReviews));

      const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error('Error loading library data from localStorage', e);
    }
  }, []);

  // Save to localStorage whenever state changes
  const saveBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(newBooks));
    }
  };

  const saveLoans = (newLoans: Loan[]) => {
    setLoans(newLoans);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(newLoans));
    }
  };

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
    }
  };

  const saveReviews = (newReviews: ReadingReview[]) => {
    setReviews(newReviews);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(newReviews));
    }
  };

  const saveWishlist = (newWishlist: string[]) => {
    setWishlist(newWishlist);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(newWishlist));
    }
  };

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addBook = (bookData: Omit<Book, 'id' | 'addedAt'>): Book => {
    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}`,
      addedAt: new Date().toISOString().split('T')[0],
      status: bookData.availableCopies > 0 ? 'available' : 'borrowed',
    };

    const updated = [newBook, ...books];
    saveBooks(updated);
    addToast('Livro Cadastrado!', `"${newBook.title}" foi adicionado com sucesso ao acervo.`);
    return newBook;
  };

  const updateBook = (id: string, updatedFields: Partial<Book>) => {
    const updated = books.map((b) => {
      if (b.id === id) {
        const next = { ...b, ...updatedFields };
        if (next.availableCopies !== undefined) {
          next.status = next.availableCopies > 0 ? 'available' : 'borrowed';
        }
        return next;
      }
      return b;
    });

    saveBooks(updated);
    addToast('Acervo Atualizado', 'As informações do livro foram salvas.');
  };

  const deleteBook = (id: string) => {
    const target = books.find((b) => b.id === id);
    const updated = books.filter((b) => b.id !== id);
    saveBooks(updated);
    addToast('Livro Removido', `O livro "${target?.title || id}" foi removido do catálogo.`, 'info');
  };

  const borrowBook = (bookId: string, userId: string, days: number = 14, notes?: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) {
      addToast('Erro', 'Livro não encontrado no acervo.', 'error');
      return { success: false, message: 'Livro não encontrado' };
    }

    if (book.availableCopies <= 0) {
      addToast('Indisponível', 'Todos os exemplares deste livro já estão emprestados.', 'warning');
      return { success: false, message: 'Sem exemplares disponíveis' };
    }

    const user = users.find((u) => u.id === userId) || {
      id: userId,
      name: 'Leitor Convidado',
      email: 'membro@cnviegas.org',
      role: 'reader' as const,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + days);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCategory: book.category,
      bookCoverColor: book.coverColor,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      borrowedDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'active',
      notes: notes || 'Empréstimo comunitário regular.',
      renewCount: 0,
    };

    // Update book copies
    const updatedBooks = books.map((b) => {
      if (b.id === bookId) {
        const nextAvail = b.availableCopies - 1;
        return {
          ...b,
          availableCopies: nextAvail,
          status: (nextAvail > 0 ? 'available' : 'borrowed') as Book['status'],
        };
      }
      return b;
    });

    saveBooks(updatedBooks);
    saveLoans([newLoan, ...loans]);

    addToast(
      'Empréstimo Concluído!',
      `"${book.title}" emprestado para ${user.name}. Devolução até ${newLoan.dueDate}.`,
      'success'
    );

    return { success: true, message: 'Empréstimo realizado com sucesso' };
  };

  const returnBook = (loanId: string, notes?: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) {
      addToast('Erro', 'Registro de empréstimo não localizado.', 'error');
      return { success: false, message: 'Empréstimo não encontrado' };
    }

    if (loan.status === 'returned') {
      addToast('Aviso', 'Este empréstimo já foi dado como devolvido.', 'info');
      return { success: false, message: 'Já devolvido' };
    }

    const returnDate = new Date().toISOString().split('T')[0];

    // Update loan
    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'returned' as const,
          returnedDate: returnDate,
          notes: notes ? `${l.notes || ''} | ${notes}` : l.notes,
        };
      }
      return l;
    });

    // Restore book copy
    const updatedBooks = books.map((b) => {
      if (b.id === loan.bookId) {
        const nextAvail = Math.min(b.totalCopies, b.availableCopies + 1);
        return {
          ...b,
          availableCopies: nextAvail,
          status: 'available' as const,
        };
      }
      return b;
    });

    saveLoans(updatedLoans);
    saveBooks(updatedBooks);

    addToast('Devolução Confirmada!', `O livro "${loan.bookTitle}" foi devolvido ao acervo.`);
    return { success: true, message: 'Livro devolvido com sucesso' };
  };

  const renewLoan = (loanId: string, extraDays: number = 7) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) {
      addToast('Erro', 'Empréstimo não encontrado.', 'error');
      return { success: false, message: 'Empréstimo não encontrado' };
    }

    if (loan.status === 'returned') {
      addToast('Aviso', 'Não é possível renovar um empréstimo já devolvido.', 'warning');
      return { success: false, message: 'Empréstimo já devolvido' };
    }

    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + extraDays);
    const newDueDate = currentDue.toISOString().split('T')[0];

    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          dueDate: newDueDate,
          status: 'active' as const,
          renewCount: (l.renewCount || 0) + 1,
        };
      }
      return l;
    });

    saveLoans(updatedLoans);
    addToast('Prazo Renovado!', `Data de devolução prorrogada para ${newDueDate}.`);
    return { success: true, message: 'Renovado com sucesso' };
  };

  const toggleWishlist = (bookId: string) => {
    const exists = wishlist.includes(bookId);
    const updated = exists ? wishlist.filter((id) => id !== bookId) : [...wishlist, bookId];
    saveWishlist(updated);

    const book = books.find((b) => b.id === bookId);
    if (exists) {
      addToast('Removido dos Favoritos', `"${book?.title || 'Livro'}" foi removido da sua lista.`, 'info');
    } else {
      addToast('Adicionado aos Favoritos!', `"${book?.title || 'Livro'}" foi salvo na sua lista de desejos.`);
    }
  };

  const isWishlisted = (bookId: string) => wishlist.includes(bookId);

  const addReview = (bookId: string, userId: string, userName: string, rating: number, comment: string) => {
    const newRev: ReadingReview = {
      id: `review-${Date.now()}`,
      bookId,
      userId,
      userName,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newRev, ...reviews];
    saveReviews(updated);
    addToast('Avaliação Publicada!', 'Obrigado por compartilhar suas impressões de leitura com o coletivo.');
  };

  const getBookReviews = (bookId: string) => {
    return reviews.filter((r) => r.bookId === bookId);
  };

  const getUserLoans = (userId: string) => {
    return loans.filter((l) => l.userId === userId);
  };

  const getUserActiveLoans = (userId: string) => {
    return loans.filter((l) => l.userId === userId && l.status !== 'returned');
  };

  const getUserPastLoans = (userId: string) => {
    return loans.filter((l) => l.userId === userId && l.status === 'returned');
  };

  const resetToDefaultData = () => {
    saveBooks(INITIAL_BOOKS);
    saveLoans(INITIAL_LOANS);
    saveUsers(INITIAL_USERS);
    saveReviews(INITIAL_REVIEWS);
    saveWishlist([]);
    addToast('Banco de Dados Restaurado', 'Os dados de exemplo foram restaurados com sucesso.', 'info');
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        loans,
        users,
        reviews,
        wishlist,
        toasts,
        addToast,
        removeToast,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
        renewLoan,
        toggleWishlist,
        isWishlisted,
        addReview,
        getBookReviews,
        getUserLoans,
        getUserActiveLoans,
        getUserPastLoans,
        resetToDefaultData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
