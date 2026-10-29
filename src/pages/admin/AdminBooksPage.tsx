import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { BookCover } from '../../components/books/BookCover';
import { exportToCsv } from '../../utils/csvExport';
import { isRecordForBook } from '../../utils/userRecords';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  BookOpen,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminBooksPage: React.FC = () => {
  const { books, categories, addBook, updateBook, deleteBook, borrowRecords } = useLibrary();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('');
  const [publicationYear, setPublicationYear] = useState(2023);
  const [totalCopies, setTotalCopies] = useState(5);
  const [availableCopies, setAvailableCopies] = useState(5);
  const [shelfLocation, setShelfLocation] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Sample curated cover images for 1-click select
  const sampleCovers = [
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  ];

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [books, search, categoryFilter]);

  const openCreateModal = () => {
    setSelectedBook(null);
    setTitle('');
    setAuthor('');
    setIsbn(`978-${Math.floor(100000000 + Math.random() * 900000000)}`);
    setCategory(categories[0]?.name || 'Computer Science & Engineering');
    setPublicationYear(new Date().getFullYear());
    setTotalCopies(6);
    setAvailableCopies(6);
    setShelfLocation('CSE-Shelf-A1');
    setCoverImage(sampleCovers[0]);
    setDescription('');
    setFormError('');
    setModalMode('create');
  };

  const openEditModal = (b: Book) => {
    setSelectedBook(b);
    setTitle(b.title);
    setAuthor(b.author);
    setIsbn(b.isbn);
    setCategory(b.category);
    setPublicationYear(b.publicationYear);
    setTotalCopies(b.totalCopies);
    setAvailableCopies(b.availableCopies);
    setShelfLocation(b.shelfLocation || 'Dept. Stack');
    setCoverImage(b.coverImage);
    setDescription(b.description);
    setFormError('');
    setModalMode('edit');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !author.trim() || !isbn.trim()) {
      setFormError('Please fill in Title, Author, and ISBN.');
      return;
    }

    // Check duplicate ISBN (excluding current book if editing)
    const duplicateIsbn = books.some(
      (b) => b.isbn.trim().toLowerCase() === isbn.trim().toLowerCase() && b.id !== selectedBook?.id
    );
    if (duplicateIsbn) {
      setFormError('A book with this ISBN already exists in the catalogue.');
      return;
    }

    if (availableCopies > totalCopies) {
      setFormError('Available copies cannot exceed total copies.');
      return;
    }

    if (modalMode === 'create') {
      await addBook({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category,
        publicationYear: Number(publicationYear),
        totalCopies: Number(totalCopies),
        availableCopies: Number(availableCopies),
        shelfLocation: shelfLocation.trim(),
        coverImage: coverImage.trim() || sampleCovers[0],
        description: description.trim() || 'Academic course reference material for Islamic University curriculum.',
        rating: 4.8,
        featured: false,
      });
    } else if (modalMode === 'edit' && selectedBook) {
      await updateBook(selectedBook.id, {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category,
        publicationYear: Number(publicationYear),
        totalCopies: Number(totalCopies),
        availableCopies: Number(availableCopies),
        shelfLocation: shelfLocation.trim(),
        coverImage: coverImage.trim(),
        description: description.trim(),
      });
    }

    setModalMode(null);
  };

  const handleExportCsv = () => {
    const rows = filteredBooks.map((b) => ({
      ID: b.id,
      Title: b.title,
      Author: b.author,
      ISBN: b.isbn,
      Category: b.category,
      Year: b.publicationYear,
      TotalCopies: b.totalCopies,
      AvailableCopies: b.availableCopies,
      Shelf: b.shelfLocation,
      Rating: b.rating,
    }));
    exportToCsv('library_books_inventory', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Book Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
            Add, update, track copies, and manage library textbook holdings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 text-forest-900 dark:text-ivory-100 text-xs font-semibold rounded-xl border border-sage-300 dark:border-charcoal-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
          >
            <option value="all">All Categories ({books.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No Books Found"
          description="Try modifying your search or adding a new book."
          actionText="Add Book"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage-50/80 dark:bg-charcoal-800/80 text-charcoal-600 dark:text-sage-300 font-bold border-b border-sage-200 dark:border-charcoal-700">
                <tr>
                  <th className="py-3 px-4">Book Title & Cover</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Total / Free</th>
                  <th className="py-3 px-4">Shelf</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100 dark:divide-charcoal-800">
                {filteredBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  const activeLoansCount = borrowRecords.filter(
                    (r) => isRecordForBook(r, book.id, book.title) && r.status === 'active'
                  ).length;

                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-sage-50/50 dark:hover:bg-charcoal-800/40 transition-colors"
                    >
                      {/* Cover & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 shrink-0 rounded overflow-hidden shadow-2xs border border-sage-200 dark:border-charcoal-700">
                            <BookCover
                              src={book.coverImage}
                              title={book.title}
                              author={book.author}
                              category={book.category}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal-900 dark:text-ivory-100 truncate max-w-xs">
                              {book.title}
                            </p>
                            <p className="text-[11px] text-charcoal-500 dark:text-sage-400 truncate">
                              by {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-forest-700 dark:text-amber-400 font-medium">
                        {book.category}
                      </td>

                      {/* ISBN */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-600 dark:text-sage-300 whitespace-nowrap">
                        {book.isbn}
                      </td>

                      {/* Year */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-700 dark:text-sage-200">
                        {book.publicationYear}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={isAvailable ? 'available' : 'borrowed'} size="sm">
                            {book.availableCopies} free
                          </Badge>
                          <span className="text-charcoal-400">/ {book.totalCopies}</span>
                        </div>
                      </td>

                      {/* Shelf */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-600 dark:text-sage-300">
                        {book.shelfLocation || 'Dept. Stack'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-forest-700 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
                            title="Edit book details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete book from catalogue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Book Modal */}
      <Modal
        isOpen={Boolean(modalMode)}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Add New Book to Catalogue' : 'Edit Book Record'}
        subtitle="Islamic University Library Management System"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Operating Systems"
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Author(s) *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Andrew S. Tanenbaum"
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                ISBN *
              </label>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-013..."
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 font-mono focus:outline-hidden focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Publication Year
              </label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(Number(e.target.value))}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Total Copies
              </label>
              <input
                type="number"
                min="1"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Available Copies
              </label>
              <input
                type="number"
                min="0"
                max={totalCopies}
                value={availableCopies}
                onChange={(e) => setAvailableCopies(Number(e.target.value))}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Shelf Location
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. CSE-Shelf-B4"
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            />
            {/* Quick sample pickers */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-charcoal-400">Presets:</span>
              {sampleCovers.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCoverImage(img)}
                  className={`w-6 h-8 rounded overflow-hidden border ${coverImage === img ? 'ring-2 ring-forest-700' : 'opacity-70'}`}
                >
                  <img src={img} alt="cover preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Description & Syllabus Coverage
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter synopsis, chapter summary, and subject relevance..."
              className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage-100 dark:border-charcoal-800">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="py-2.5 px-4 text-xs font-semibold text-charcoal-600 dark:text-sage-300 hover:bg-sage-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs"
            >
              {modalMode === 'create' ? 'Add Book to Catalogue' : 'Save Modifications'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(bookToDelete)}
        onClose={() => setBookToDelete(null)}
        onConfirm={async () => {
          if (bookToDelete) {
            await deleteBook(bookToDelete.id);
          }
        }}
        title="Delete Book Record"
        message={`Are you sure you want to delete "${bookToDelete?.title}" from the library? This action will permanently remove it from the catalogue.`}
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
};
