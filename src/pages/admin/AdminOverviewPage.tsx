import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  formatDisplayDate,
  getDaysDifference,
  getEffectiveBorrowStatus,
  calculateOverdueFine,
} from '../../utils/dates';
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  Tags,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const AdminOverviewPage: React.FC = () => {
  const { books, categories, borrowRecords, settings, returnBook } = useLibrary();
  const { currentUser } = useAuth();
  const [memberCount, setMemberCount] = useState<number>(() => storage.getUsers().filter((u) => u.role === 'member').length);

  useEffect(() => {
    api.members.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setMemberCount(data.length);
      }
    }).catch(() => {});
  }, []);

  // Stats calculation
  const totalBooks = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const activeBorrowings = borrowRecords.filter((r) => r.status === 'active');
  const overdueRecords = activeBorrowings.filter((r) => getDaysDifference(r.dueDate) < 0);
  const totalCategories = categories.length;

  // Chart 1: Simulated monthly activity data
  const monthlyActivity = [
    { month: 'Oct', borrows: 14, returns: 11 },
    { month: 'Nov', borrows: 22, returns: 18 },
    { month: 'Dec', borrows: 31, returns: 26 },
    { month: 'Jan', borrows: 28, returns: 25 },
    { month: 'Feb', borrows: 38, returns: 32 },
    { month: 'Mar', borrows: activeBorrowings.length + 15, returns: 22 },
  ];

  // Chart 2: Category distribution
  const categoryData = categories.map((cat) => ({
    name: cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name,
    count:
      cat.bookCount ||
      books.filter((b) => b.category === cat.name || (b as any).categoryId === cat.id || (b as any).categorySlug === cat.slug).length ||
      0,
  }));

  // Recent transactions
  const recentTransactions = [...borrowRecords].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-forest-900 text-ivory-100 rounded-full uppercase tracking-wider">
              Faculty Supervision Console
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Library Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400">
            Overview for {settings.libraryName} · Dept. of Computer Science & Engineering, Islamic University.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/books"
            className="flex items-center gap-1.5 py-2 px-3.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </Link>
          <Link
            to="/admin/borrowings"
            className="flex items-center gap-1.5 py-2 px-3.5 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 text-forest-900 dark:text-ivory-100 font-semibold text-xs rounded-xl border border-sage-300 dark:border-charcoal-700 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
            <span>Borrowing Logs</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Books */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between text-forest-700 dark:text-sage-300 mb-2">
            <span className="text-xs font-semibold text-charcoal-500 dark:text-sage-400">Total Titles</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
            {totalBooks}
          </div>
          <p className="text-[10px] text-charcoal-400 mt-1">{totalCopies} total copies</p>
        </div>

        {/* Available Copies */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold text-charcoal-500 dark:text-sage-400">In Stacks</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
            {availableCopies}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Ready for loan</p>
        </div>

        {/* Active Borrowings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold text-charcoal-500 dark:text-sage-400">On Loan</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
            {activeBorrowings.length}
          </div>
          <p className="text-[10px] text-charcoal-400 mt-1">Active loans</p>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold text-charcoal-500 dark:text-sage-400">Overdue</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-rose-600 dark:text-rose-400">
            {overdueRecords.length}
          </div>
          <p className="text-[10px] text-rose-500 font-medium mt-1">Requires follow-up</p>
        </div>

        {/* Registered Members */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-semibold text-charcoal-500 dark:text-sage-400">Members</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
            {memberCount}
          </div>
          <p className="text-[10px] text-charcoal-400 mt-1">Enrolled students</p>
        </div>

        {/* Categories */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
            <span className="text-xs font-semibold text-charcoal-500 dark:text-sage-400">Categories</span>
            <Tags className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
            {totalCategories}
          </div>
          <p className="text-[10px] text-charcoal-400 mt-1">Curricula tracks</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Borrowing Activity Trend */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-forest-900 dark:text-ivory-100">
                Borrowing & Return Trends
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-sage-400">
                Semester loan throughput over recent months
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-forest-700 dark:text-sage-200 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-600"></span>
                Issued
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Returned
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173F35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#173F35" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6A75D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D6A75D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2D28',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FAF9F5',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="borrows" stroke="#173F35" strokeWidth={2} fillOpacity={1} fill="url(#colorBorrows)" name="Books Issued" />
                <Area type="monotone" dataKey="returns" stroke="#D6A75D" strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" name="Books Returned" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-forest-900 dark:text-ivory-100">
              Books by Discipline
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-sage-400">
              Distribution of catalogue holdings across departments
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2D28',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FAF9F5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#2B6D5C" radius={[0, 6, 6, 0]} name="Books in Category" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overdue Alerts Section (if any overdue) */}
      {overdueRecords.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Overdue Returns Requiring Administrative Attention ({overdueRecords.length})</span>
            </div>
            <Link
              to="/admin/borrowings"
              className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline"
            >
              View in Borrowing Manager &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueRecords.map((rec) => {
              const diff = Math.abs(getDaysDifference(rec.dueDate));
              const fine = calculateOverdueFine(rec, settings.fineRatePerDay);

              return (
                <div
                  key={rec.id}
                  className="p-3.5 bg-white dark:bg-charcoal-900 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal-900 dark:text-ivory-100 truncate">
                      {rec.bookTitle}
                    </p>
                    <p className="text-[11px] text-charcoal-500 dark:text-sage-400 truncate">
                      Borrower: {rec.userName} ({rec.userStudentId || rec.userEmail})
                    </p>
                    <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                      Overdue by {diff} days · Fine: {settings.currency}{fine}
                    </p>
                  </div>
                  <button
                    onClick={() => returnBook(rec.id)}
                    className="py-1.5 px-3 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold rounded-lg text-xs shrink-0"
                  >
                    Mark Returned
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-forest-900 dark:text-ivory-100">
              Recent Borrowing Transactions
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-sage-400">
              Latest activities processed in the Islamic University library system
            </p>
          </div>
          <Link
            to="/admin/borrowings"
            className="text-xs font-semibold text-forest-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>All Records ({borrowRecords.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sage-50/80 dark:bg-charcoal-800/80 text-charcoal-600 dark:text-sage-300 font-bold border-b border-sage-200 dark:border-charcoal-700">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Book Title</th>
                <th className="py-2.5 px-3">Member</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-charcoal-800">
              {recentTransactions.map((rec) => {
                const dynamicStatus = getEffectiveBorrowStatus(rec);
                return (
                  <tr key={rec.id} className="hover:bg-sage-50/50 dark:hover:bg-charcoal-800/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-charcoal-500 dark:text-sage-400">
                      #{rec.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-charcoal-900 dark:text-ivory-100 truncate max-w-xs">
                      {rec.bookTitle}
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-700 dark:text-sage-200 whitespace-nowrap">
                      {rec.userName} ({rec.userStudentId || 'Member'})
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-charcoal-600 dark:text-sage-300">
                      {formatDisplayDate(rec.issueDate)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-charcoal-600 dark:text-sage-300">
                      {formatDisplayDate(rec.dueDate)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Badge
                        variant={
                          dynamicStatus === 'returned'
                            ? 'default'
                            : dynamicStatus === 'overdue'
                            ? 'overdue'
                            : dynamicStatus === 'due-soon'
                            ? 'due-soon'
                            : 'active'
                        }
                        size="sm"
                      >
                        {dynamicStatus === 'returned'
                          ? 'Returned'
                          : dynamicStatus === 'overdue'
                          ? 'Overdue'
                          : dynamicStatus === 'due-soon'
                          ? 'Due Soon'
                          : 'Active'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
