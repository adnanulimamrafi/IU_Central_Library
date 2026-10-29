import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, MapPin, Mail, Phone, Clock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-900 text-ivory-100 border-t border-forest-800 transition-colors pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Library Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ivory-100 leading-tight">
                  IU Central Library
                </h3>
                <p className="text-xs text-sage-300">
                  Islamic University, Bangladesh
                </p>
              </div>
            </div>
            <p className="text-xs text-sage-200/80 leading-relaxed">
              Empowering students and researchers through comprehensive physical and digital access to knowledge, cutting-edge software architecture, and academic resources.
            </p>
            <div className="pt-2 text-xs text-amber-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Dept. of Computer Science & Engineering</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 font-mono">
              Library Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-sage-200/90">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Library Homepage
                </Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-amber-400 transition-colors">
                  Search Full Catalogue
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">
                  Member Portal Login
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-amber-400 transition-colors">
                  Staff & Admin Login
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                  Borrowing Rules & Loan Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Project Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 font-mono">
              Academic Project Info
            </h4>
            <div className="text-xs text-sage-200/90 space-y-2">
              <p>
                <strong className="text-white">Course:</strong> CSE 3210 (Software Project)
              </p>
              <p>
                <strong className="text-white">Submitted By:</strong> Tanvir Ahmed
              </p>
              <p className="text-[11px] text-sage-300">
                Roll: 2114028 · Reg: 1093 · Session: 2021-22
              </p>
              <p className="pt-1">
                <strong className="text-white">Supervised By:</strong>
              </p>
              <p className="text-[11px] text-sage-300">
                Md. Mojahidul Islam, Associate Professor, Dept. of CSE, Islamic University
              </p>
            </div>
          </div>

          {/* Col 4: Library Hours & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 font-mono">
              Hours & Front Desk
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-sage-200/90">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Sunday – Thursday: 8:00 AM – 8:00 PM<br />Friday & Saturday: Closed</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-sage-200/90">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Kushtia-7003, Islamic University, Bangladesh</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-sage-200/90">
              <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>library@iu.ac.bd</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-sage-200/90">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>+880 721-12345</span>
            </div>
          </div>
        </div>

        {/* Demo Disclaimer & Ethics Statement */}
        <div className="pt-6 pb-4 border-t border-forest-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-sage-300/70">
          <p>
            &copy; {new Date().getFullYear()} Islamic University Central Library. Built with React & TypeScript.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-amber-400/80">
              Browser Storage Mode (Offline Simulated Persistence)
            </span>
            <a
              href="https://www.iu.ac.bd"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
            >
              iu.ac.bd <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
