
import React from 'react';
import { FAQS } from '../constants';

const FAQ: React.FC = () => {
  return (
    <div className="bg-slate-50 py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-slate-600 font-medium">Everything you need to know about CareCova medical financing.</p>
        </div>

        <div className="space-y-6">
          {FAQS.map((faq, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex gap-4">
                <span className="text-blue-600">Q.</span>
                {faq.question}
              </h3>
              <p className="text-slate-600 leading-relaxed pl-8">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-600 rounded-[2.5rem] p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-blue-100 mb-8">Our support team is here to help you navigate your healthcare journey.</p>
          <a href="mailto:support@carecova.com" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-black hover:bg-slate-50 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
