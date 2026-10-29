import React, { useState, useEffect, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { User, BorrowRecord } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDisplayDate, getDaysDifference, getEffectiveBorrowStatus } from '../../utils/dates';
import { exportToCsv } from '../../utils/csvExport';
import { isUserRecord } from '../../utils/userRecords';
import {
  Users,
  Search,
  Download,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  Eye,
  UserX,
  UserCheck,
  BookMarked,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const AdminMembersPage: React.FC = () => {
  const { borrowRecords, toggleMemberStatus } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<User | null>(null);
  const [memberToToggle, setMemberToToggle] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>(() => storage.getUsers().filter((u) => u.role === 'member'));

  useEffect(() => {
    api.members.getAll().then((data) => {
      if (data && data.length > 0) {
        setMembers(data);
      }
    }).catch(() => {});
  }, []);

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            (m.studentId && m.studentId.toLowerCase().includes(q)) ||
            (m.department && m.department.toLowerCase().includes(q))
          );
        }
        return true;
      });
  }, [members, search, statusFilter]);

  const handleExportCsv = () => {
    const rows = filteredMembers.map((m) => ({
      ID: m.id,
      Name: m.name,
      RollNo: m.studentId || '',
      Email: m.email,
      Department: m.department || '',
      Session: m.session || '',
      Status: m.status,
      CreatedAt: m.createdAt,
    }));
    exportToCsv('library_registered_members', rows);
  };

  const memberHistoryRecords = selectedMemberForHistory
    ? borrowRecords.filter((r) => isUserRecord(r, selectedMemberForHistory))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Student & Member Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
            Manage university student accounts, active loans, and account status privileges.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 text-forest-900 dark:text-ivory-100 text-xs font-semibold rounded-xl border border-sage-300 dark:border-charcoal-700 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
          <span>Export Members CSV</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, student roll, email, or dept..."
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'suspended'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-forest-700 text-ivory-100'
                  : 'bg-white dark:bg-charcoal-900 text-charcoal-600 dark:text-sage-300 border border-sage-200 dark:border-charcoal-700 hover:bg-sage-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Members Found"
          description="No student accounts match the filter criteria."
        />
      ) : (
        <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage-50/80 dark:bg-charcoal-800/80 text-charcoal-600 dark:text-sage-300 font-bold border-b border-sage-200 dark:border-charcoal-700">
                <tr>
                  <th className="py-3 px-4">Member Info</th>
                  <th className="py-3 px-4">Roll No. / ID</th>
                  <th className="py-3 px-4">Department & Session</th>
                  <th className="py-3 px-4">Active Loans</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100 dark:divide-charcoal-800">
                {filteredMembers.map((member) => {
                  const activeLoans = borrowRecords.filter(
                    (r) => r.userId === member.id && r.status === 'active'
                  );
                  const overdueCount = activeLoans.filter(
                    (r) => getDaysDifference(r.dueDate) < 0
                  ).length;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-sage-50/50 dark:hover:bg-charcoal-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
                            alt={member.name}
                            className="w-9 h-9 rounded-full object-cover border border-sage-200 dark:border-charcoal-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal-900 dark:text-ivory-100 truncate">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-charcoal-500 dark:text-sage-400 truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roll No */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-forest-700 dark:text-amber-400 whitespace-nowrap">
                        {member.studentId || '—'}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-charcoal-700 dark:text-sage-200 whitespace-nowrap">
                        <div className="truncate max-w-xs">{member.department || 'CSE'}</div>
                        <div className="text-[10px] text-charcoal-400">{member.session || '2021-22'}</div>
                      </td>

                      {/* Active Loans */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-charcoal-800 dark:text-ivory-100">
                            {activeLoans.length} books
                          </span>
                          {overdueCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded">
                              {overdueCount} overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={member.status === 'active' ? 'available' : 'suspended'} size="sm">
                          {member.status === 'active' ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedMemberForHistory(member)}
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-forest-700 hover:bg-sage-100 dark:hover:bg-charcoal-800"
                            title="View member borrowing history"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setMemberToToggle(member)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              member.status === 'active'
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={member.status === 'active' ? 'Suspend account' : 'Reactivate account'}
                          >
                            {member.status === 'active' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
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

      {/* Member History Modal */}
      <Modal
        isOpen={Boolean(selectedMemberForHistory)}
        onClose={() => setSelectedMemberForHistory(null)}
        title={`Borrowing History: ${selectedMemberForHistory?.name}`}
        subtitle={`Student Roll: ${selectedMemberForHistory?.studentId || 'Member'} · ${selectedMemberForHistory?.email}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {memberHistoryRecords.length === 0 ? (
            <div className="py-8 text-center text-xs text-charcoal-500 dark:text-sage-400">
              This member has no recorded loans in the system.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-sage-100 dark:divide-charcoal-800">
              {memberHistoryRecords.map((r) => {
                const dynamicStatus = getEffectiveBorrowStatus(r);
                return (
                  <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-charcoal-900 dark:text-ivory-100 truncate">
                        {r.bookTitle}
                      </p>
                      <p className="text-[11px] text-charcoal-500 dark:text-sage-400">
                        Issued: {formatDisplayDate(r.issueDate)} · Due: {formatDisplayDate(r.dueDate)}
                        {r.returnDate && ` · Returned: ${formatDisplayDate(r.returnDate)}`}
                      </p>
                    </div>
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
                      {dynamicStatus}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-sage-100 dark:border-charcoal-800">
            <button
              onClick={() => setSelectedMemberForHistory(null)}
              className="py-2 px-4 bg-forest-700 text-ivory-100 text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Suspend / Reactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(memberToToggle)}
        onClose={() => setMemberToToggle(null)}
        onConfirm={() => {
          if (memberToToggle) {
            toggleMemberStatus(memberToToggle.id);
            setMembers((prev) =>
              prev.map((m) =>
                m.id === memberToToggle.id
                  ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' }
                  : m
              )
            );
          }
        }}
        title={memberToToggle?.status === 'active' ? 'Suspend Student Account' : 'Reactivate Student Account'}
        message={
          memberToToggle?.status === 'active'
            ? `Suspend ${memberToToggle?.name}'s library account? They will be unable to borrow new books while suspended.`
            : `Reactivate ${memberToToggle?.name}'s account and restore borrowing privileges?`
        }
        confirmText={memberToToggle?.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
        type={memberToToggle?.status === 'active' ? 'danger' : 'success'}
      />
    </div>
  );
};
