import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Category } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  AlertCircle,
  Cpu,
  Brain,
  Layers,
  Binary,
  Feather,
  TrendingUp,
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useLibrary();

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setSelectedCategory(null);
    setName('');
    setDescription('');
    setIconName('BookOpen');
    setFormError('');
    setModalMode('create');
  };

  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setIconName(cat.iconName);
    setFormError('');
    setModalMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    if (modalMode === 'create') {
      await addCategory({
        name: name.trim(),
        description: description.trim() || 'Academic discipline curriculum reference collection.',
        iconName,
      });
    } else if (modalMode === 'edit' && selectedCategory) {
      await updateCategory(selectedCategory.id, {
        name: name.trim(),
        description: description.trim(),
        iconName,
      });
    }

    setModalMode(null);
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Binary':
        return <Binary className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-forest-600 dark:text-forest-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Category & Subject Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
            Organize academic collections into courses, subjects, and engineering domains.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex flex-col justify-between hover:border-forest-600/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-charcoal-800">
                  {getIconComponent(cat.iconName)}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-charcoal-500 hover:text-forest-700 hover:bg-sage-100 dark:hover:bg-charcoal-800"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-ivory-100 mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-sage-400 leading-relaxed mb-4">
                {cat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-sage-100 dark:border-charcoal-800 flex items-center justify-between text-xs font-medium text-forest-700 dark:text-amber-400">
              <span>{cat.bookCount || 0} Books Assigned</span>
              <span className="text-[11px] text-charcoal-400 font-mono">/{cat.slug}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={Boolean(modalMode)}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cybersecurity & Cryptography"
              className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Icon Symbol
            </label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            >
              <option value="Cpu">Cpu / Hardware & Systems</option>
              <option value="Brain">Brain / AI & Machine Learning</option>
              <option value="Layers">Layers / Software Engineering & Architecture</option>
              <option value="Binary">Binary / Mathematics & Algorithms</option>
              <option value="Feather">Feather / Literature & Humanities</option>
              <option value="TrendingUp">TrendingUp / Business & Economics</option>
              <option value="BookOpen">BookOpen / General Academic</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what textbooks and subjects belong here..."
              className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sage-100 dark:border-charcoal-800">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="py-2 px-4 text-xs font-semibold text-charcoal-600 hover:bg-sage-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Modal */}
      <ConfirmationModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={async () => {
          if (categoryToDelete) {
            await deleteCategory(categoryToDelete.id);
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Deletion is blocked if books are currently assigned to it.`}
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
};
