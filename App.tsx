import React, { useState } from 'react';
import { SeoModuleType, AnalysisResult } from './types';
import { AnalysisView } from './components/AnalysisView';
import { LandingPage } from './components/LandingPage';
import { 
  LayoutIcon, 
  GlobeIcon, 
  CodeIcon, 
  FileTextIcon, 
  ShieldAlertIcon, 
  MapPinIcon,
  ChevronRightIcon,
  ActivityIcon,
  PhoneIcon
} from './components/IconComponents';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<SeoModuleType>(SeoModuleType.ON_PAGE);
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  
  // Store results for all modules here
  const [results, setResults] = useState<Partial<Record<SeoModuleType, AnalysisResult>>>({});

  const handleStartAnalysis = (domain: string) => {
    setCurrentDomain(domain);
    setResults({}); // Clear previous results on new domain
  };

  const handleReset = () => {
    setCurrentDomain(null);
    setActiveModule(SeoModuleType.ON_PAGE);
    setResults({});
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setResults(prev => ({
      ...prev,
      [activeModule]: result
    }));
  };

  const menuItems = [
    { 
      id: SeoModuleType.ON_PAGE, 
      label: 'Site İçi SEO', 
      icon: <LayoutIcon className="w-5 h-5" />,
      description: 'HTML yapısı, meta etiketler ve başlık analizi' 
    },
    { 
      id: SeoModuleType.OFF_PAGE, 
      label: 'Site Dışı SEO', 
      icon: <GlobeIcon className="w-5 h-5" />,
      description: 'Backlink profili ve otorite analizi' 
    },
    { 
      id: SeoModuleType.TECHNICAL, 
      label: 'Teknik SEO', 
      icon: <CodeIcon className="w-5 h-5" />,
      description: 'Schema, performans ve tarama sorunları' 
    },
    { 
      id: SeoModuleType.CONTENT, 
      label: 'İçerik Analizi', 
      icon: <FileTextIcon className="w-5 h-5" />,
      description: 'Okunabilirlik, anahtar kelime ve özgünlük' 
    },
    { 
      id: SeoModuleType.BLACK_HAT, 
      label: 'Black Hat Dedektörü', 
      icon: <ShieldAlertIcon className="w-5 h-5" />,
      description: 'Riskli ve spam tekniklerin tespiti' 
    },
    { 
      id: SeoModuleType.LOCAL, 
      label: 'Yerel SEO', 
      icon: <MapPinIcon className="w-5 h-5" />,
      description: 'Google Maps ve yerel işletme optimizasyonu' 
    },
  ];

  const activeItem = menuItems.find(i => i.id === activeModule)!;

  // Render Landing Page if no domain is selected
  if (!currentDomain) {
    return <LandingPage onStartAnalysis={handleStartAnalysis} />;
  }

  // Calculate progress
  const completedModules = Object.keys(results).length;
  const progressPercentage = Math.round((completedModules / menuItems.length) * 100);

  // Render Dashboard
  return (
    <div className="flex min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-seo-500 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-72 bg-dark-card border-r border-gray-800 flex-shrink-0 hidden md:flex flex-col fixed h-full z-10 shadow-2xl">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 bg-gradient-to-br from-seo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-seo-500/30 hover:scale-105 transition-transform">
              <ActivityIcon className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">ProSEO Master</h1>
              <span className="text-xs text-seo-500 font-semibold uppercase tracking-wider">by innovmar</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isCompleted = !!results[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                  activeModule === item.id 
                    ? 'bg-seo-900/50 text-seo-500 border border-seo-500/30 shadow-inner' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                {activeModule === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-seo-500 rounded-l-lg"></div>
                )}
                <div className="flex items-center gap-3">
                  <span className={activeModule === item.id ? 'text-seo-500' : isCompleted ? 'text-green-500' : 'text-gray-500 group-hover:text-gray-300'}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isCompleted && activeModule !== item.id && (
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                )}
                {activeModule === item.id && <ChevronRightIcon className="w-4 h-4 text-seo-500" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/30">
          
          <a href="tel:+905415079974" className="w-full mb-4 flex items-center justify-center gap-2 bg-green-700/80 hover:bg-green-600 text-white p-3 rounded-lg transition-all shadow-lg group">
             <PhoneIcon className="w-5 h-5 group-hover:animate-pulse" />
             <div className="text-left">
               <div className="text-[10px] uppercase text-green-200">Innovmar İletişim</div>
               <div className="font-bold text-sm">+90 541 507 99 74</div>
             </div>
          </a>

          <div className="bg-gray-900/50 rounded p-4 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400">Aktif Domain</p>
                <button onClick={handleReset} className="text-[10px] text-red-400 hover:text-red-300 underline">Değiştir</button>
            </div>
            <div className="font-mono text-xs text-seo-400 truncate font-bold mb-3" title={currentDomain}>
                {currentDomain}
            </div>
            
            <p className="text-xs text-gray-500 mb-2">Analiz Tamamlanma</p>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>%{progressPercentage}</span>
              <span>{completedModules}/{menuItems.length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-x-hidden min-h-screen relative">
        {/* Background ambient light for dashboard */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-seo-600/5 rounded-full filter blur-[100px] pointer-events-none"></div>

        {/* Mobile Header */}
        <div className="md:hidden flex flex-col mb-6 pb-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2" onClick={handleReset}>
                <div className="w-8 h-8 bg-seo-500 rounded flex items-center justify-center">
                <ActivityIcon className="text-white w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-lg block leading-none">ProSEO</span>
                  <span className="text-[10px] text-gray-500">by innovmar</span>
                </div>
            </div>
            <div className="flex gap-2">
              <a href="tel:+905415079974" className="bg-green-700 text-white p-2 rounded border border-green-600">
                <PhoneIcon className="w-4 h-4" />
              </a>
              <button onClick={handleReset} className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-300 border border-gray-700">Yeni Analiz</button>
            </div>
          </div>
          
          <select 
            value={activeModule}
            onChange={(e) => setActiveModule(e.target.value as SeoModuleType)}
            className="bg-gray-800 border-gray-700 rounded text-sm p-3 text-white w-full outline-none focus:ring-1 focus:ring-seo-500"
          >
            {menuItems.map(item => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>

        <AnalysisView 
          key={`${activeModule}-${currentDomain}`} // Force re-mount on change
          module={activeModule}
          title={activeItem.label}
          description={activeItem.description}
          domain={currentDomain}
          existingResult={results[activeModule]}
          allResults={results}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </main>
    </div>
  );
};

export default App;