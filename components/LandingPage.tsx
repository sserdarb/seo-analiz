import React, { useState } from 'react';
import { ActivityIcon, GlobeIcon, ShieldAlertIcon, CodeIcon, LayoutIcon, MapPinIcon } from './IconComponents';

interface LandingPageProps {
  onStartAnalysis: (domain: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalysis }) => {
  const [inputDomain, setInputDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputDomain.trim()) {
      // Basic normalization
      let domain = inputDomain.trim().toLowerCase();
      if (!domain.startsWith('http')) {
        domain = 'https://' + domain;
      }
      onStartAnalysis(domain);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-hidden relative font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-seo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-accent-purple/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-accent-cyan/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        <div className="scan-line z-0"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        
        {/* Logo/Brand */}
        <div className="mb-12 flex items-center gap-3 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className="w-12 h-12 bg-gradient-to-br from-seo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-seo-500/50">
            <ActivityIcon className="text-white w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight leading-none">ProSEO Master AI</span>
            <span className="text-sm text-gray-500 font-mono tracking-wider text-right">by innovmar</span>
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
          Web Sitenizin <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-seo-400 via-accent-cyan to-accent-purple">
            Geleceğini Analiz Et
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl text-center max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          Yapay zeka destekli otonom SEO motoru ile saniyeler içinde site içi, site dışı, teknik ve blackhat risk analizi yapın.
        </p>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-20 animate-in fade-in scale-in-95 duration-700 delay-300">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-seo-500 via-purple-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-dark-card rounded-lg border border-gray-700 p-2 shadow-2xl">
              <div className="pl-4 text-gray-500">
                <GlobeIcon className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Analiz edilecek site (örn: example.com)"
                className="w-full bg-transparent border-none text-white px-4 py-4 focus:ring-0 text-lg placeholder-gray-600 outline-none"
                value={inputDomain}
                onChange={(e) => setInputDomain(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-seo-600 hover:bg-seo-500 text-white px-8 py-4 rounded-md font-bold transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Analizi Başlat
              </button>
            </div>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">
            * Tamamen otomatik tarama. Kredi kartı gerekmez.
          </p>
        </form>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
          <div className="bg-dark-card/50 backdrop-blur border border-gray-800 p-6 rounded-xl hover:border-seo-500/50 transition-colors group">
            <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <LayoutIcon className="text-blue-400 group-hover:text-white w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">On-Page Analiz</h3>
            <p className="text-gray-400 text-sm">HTML yapısı, başlıklar ve içerik uyumluluğunun derinlemesine incelenmesi.</p>
          </div>

          <div className="bg-dark-card/50 backdrop-blur border border-gray-800 p-6 rounded-xl hover:border-seo-500/50 transition-colors group">
            <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
              <CodeIcon className="text-purple-400 group-hover:text-white w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Teknik & Otonom Kod</h3>
            <p className="text-gray-400 text-sm">Hataları sadece bulmaz, sizin için düzelten kod parçacıkları yazar.</p>
          </div>

          <div className="bg-dark-card/50 backdrop-blur border border-gray-800 p-6 rounded-xl hover:border-seo-500/50 transition-colors group">
            <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
              <ShieldAlertIcon className="text-red-400 group-hover:text-white w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Risk & Blackhat</h3>
            <p className="text-gray-400 text-sm">Sitenizi Google cezalarından korumak için spam sinyallerini tarar.</p>
          </div>
        </div>

      </div>
    </div>
  );
};