
import React from 'react';

const Technology: React.FC = () => {
  const stackItems = [
    {
      title: "React 19 Framework",
      description: "Built on the latest industry standards for ultra-fast performance, interactive interfaces, and seamless patient experiences.",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Secure Cloud Core",
      description: "Patient data is encrypted end-to-end using bank-grade security protocols and served via globally distributed edge networks.",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "Responsive Design",
      description: "Powered by Tailwind CSS to ensure a consistent, beautiful, and accessible experience across mobile and desktop devices.",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-slate-50 py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-20">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-6">
            The Technology Behind <span className="text-blue-600">CareCova</span>
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed">
            We've built a high-performance infrastructure to ensure that your medical financing 
            is as efficient and secure as the care you receive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {stackItems.map((item, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <div className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
          </div>
          <div className="max-w-2xl relative z-10">
            <h2 className="text-3xl font-extrabold mb-8">Data Privacy Commitment</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Your health and financial information is strictly private. We comply with local data protection regulations (NDPR) to ensure your data is only used for your application and never sold to third parties.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-slate-800 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-400 border border-slate-700">
                AES-256 Encryption
              </div>
              <div className="bg-slate-800 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-400 border border-slate-700">
                NDPR Compliant
              </div>
              <div className="bg-slate-800 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-400 border border-slate-700">
                SSL Secured
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technology;
