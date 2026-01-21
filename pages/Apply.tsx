
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TREATMENT_CATEGORIES } from '../constants';
import { LoanApplication, LoanStatus } from '../types';

interface ApplyProps {
  onApply: (loan: LoanApplication) => void;
}

const Apply: React.FC<ApplyProps> = ({ onApply }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    clinicName: '',
    treatmentType: '',
    estimatedCost: '',
    repaymentDuration: '3'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newLoan: LoanApplication = {
      id: `LN-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      hospitalId: formData.clinicName, // Now using user input clinic name
      treatmentType: formData.treatmentType,
      estimatedCost: parseFloat(formData.estimatedCost),
      repaymentDuration: parseInt(formData.repaymentDuration),
      status: LoanStatus.PENDING,
      appliedAt: new Date().toISOString()
    };

    setTimeout(() => {
      onApply(newLoan);
      setLoading(false);
      navigate('/track');
    }, 1500);
  };

  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15l-5-5 1.41-1.41L12 15.17l7.59-7.59L21 9l-9 9z"/></svg>
            </div>
            <h1 className="text-3xl font-extrabold relative z-10">Healthcare Financing</h1>
            <p className="mt-2 text-blue-100 relative z-10 font-medium">Apply for elective procedure coverage in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                  placeholder="e.g. Adekunle Johnson"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                  placeholder="name@provider.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  required
                  type="tel"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                  placeholder="0801 234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Medical Clinic Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                  placeholder="Enter hospital/clinic name"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Procedure Category</label>
                <select
                  required
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium bg-white"
                  value={formData.treatmentType}
                  onChange={(e) => setFormData({...formData, treatmentType: e.target.value})}
                >
                  <option value="">Select Elective Type</option>
                  {TREATMENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Cost (₦)</label>
                <input
                  required
                  type="number"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                  placeholder="Amount in Naira"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payment Duration</label>
              <div className="grid grid-cols-3 gap-6">
                {[3, 6, 12].map(months => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setFormData({...formData, repaymentDuration: months.toString()})}
                    className={`py-4 rounded-xl border-2 text-sm font-extrabold transition-all ${
                      formData.repaymentDuration === months.toString()
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                    }`}
                  >
                    {months} Months
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Financing Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Apply;
