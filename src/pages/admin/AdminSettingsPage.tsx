import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import {
  Settings,
  Building2,
  Clock,
  BookMarked,
  DollarSign,
  Mail,
  Phone,
  RotateCcw,
  Save,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useLibrary();

  const [libraryName, setLibraryName] = useState(settings.libraryName);
  const [institutionName, setInstitutionName] = useState(settings.institutionName);
  const [departmentName, setDepartmentName] = useState(settings.departmentName);
  const [defaultLoanDurationDays, setDefaultLoanDurationDays] = useState(settings.defaultLoanDurationDays);
  const [maxBorrowLimit, setMaxBorrowLimit] = useState(settings.maxBorrowLimit);
  const [fineRatePerDay, setFineRatePerDay] = useState(settings.fineRatePerDay);
  const [currency, setCurrency] = useState(settings.currency);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [maxRenewals, setMaxRenewals] = useState(settings.maxRenewals);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings({
      libraryName: libraryName.trim(),
      institutionName: institutionName.trim(),
      departmentName: departmentName.trim(),
      defaultLoanDurationDays: Number(defaultLoanDurationDays),
      maxBorrowLimit: Number(maxBorrowLimit),
      fineRatePerDay: Number(fineRatePerDay),
      currency: currency.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      maxRenewals: Number(maxRenewals),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
          Library System Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
          Configure circulation policies, institutional parameters, and browser storage states.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Institutional Identity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-forest-900 dark:text-ivory-100 pb-2 border-b border-sage-100 dark:border-charcoal-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-forest-600" />
            <span>Institutional Identity & Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Library Name
              </label>
              <input
                type="text"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                University Institution
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Official Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Loan Policies */}
        <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-forest-900 dark:text-ivory-100 pb-2 border-b border-sage-100 dark:border-charcoal-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-600" />
            <span>Circulation & Loan Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Default Loan Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={defaultLoanDurationDays}
                onChange={(e) => setDefaultLoanDurationDays(Number(e.target.value))}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
              <span className="text-[10px] text-charcoal-400 mt-0.5 block">Applied to new loans</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Borrowing Limit per Member
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxBorrowLimit}
                onChange={(e) => setMaxBorrowLimit(Number(e.target.value))}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
              <span className="text-[10px] text-charcoal-400 mt-0.5 block">Simultaneous active books</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Overdue Fine Rate / Day
              </label>
              <input
                type="number"
                min="0"
                value={fineRatePerDay}
                onChange={(e) => setFineRatePerDay(Number(e.target.value))}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
              <span className="text-[10px] text-charcoal-400 mt-0.5 block">Per late day charge</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              />
              <span className="text-[10px] text-charcoal-400 mt-0.5 block">e.g. ৳ or $</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-6 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>

      {/* Card 3: Danger Zone / Demo Data Reset */}
      <div className="p-6 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Demo Data Reset Zone</span>
        </h3>

        <p className="text-xs text-charcoal-600 dark:text-sage-300 leading-relaxed">
          If you want to return the application back to its pristine initial demonstration state (re-seeding all 16 sample textbooks, demo student borrowing records, active loans, and default settings), click below.
        </p>

        <button
          type="button"
          onClick={() => setResetConfirmOpen(true)}
          className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Fresh Demo Seed Data</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setLibraryName('IU Central Library');
          setInstitutionName('Islamic University, Bangladesh');
          setDefaultLoanDurationDays(14);
          setMaxBorrowLimit(5);
          setFineRatePerDay(10);
        }}
        title="Confirm Reset Demo Data"
        message="This will reset all books, borrowing records, members, and custom settings in localStorage back to the initial demo values. Continue?"
        confirmText="Confirm Reset"
        type="danger"
      />
    </div>
  );
};
