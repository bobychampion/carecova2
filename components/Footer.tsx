
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.hash === '#/') {
      const element = document.getElementById('how-it-works');
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('how-it-works');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  return (
    <footer className="bg-slate-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight">CareCova</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-lg">
              Empowering Nigerian families to access elective medical procedures with dignity and financial ease.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-8 text-white">Platform</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/calculator" className="hover:text-blue-400 transition-colors">Repayment Calculator</Link></li>
              <li><Link to="/technology" className="hover:text-blue-400 transition-colors">Technology</Link></li>
              <li><a href="#how-it-works" onClick={handleHowItWorks} className="hover:text-blue-400 transition-colors">How it Works</a></li>
              <li><Link to="/track" className="hover:text-blue-400 transition-colors">Track Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-8 text-white">Get in Touch</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li>
                <a href="mailto:support@carecova.com" className="hover:text-blue-400 transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  support@carecova.com
                </a>
              </li>
              <li>
                <a href="tel:+2348163471359" className="hover:text-blue-400 transition-colors flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  (+234) 816 347 1359
                </a>
              </li>
              <li className="pt-4 leading-relaxed opacity-50">
                15 Rumuola Road, PH<br />
                Ikeja, Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm font-medium">© 2024 CareCova. Built for your health.</p>
          <div className="flex gap-10 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
