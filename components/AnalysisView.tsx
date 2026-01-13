import React, { useState, useEffect } from 'react';
import { SeoModuleType, AnalysisResult, AnalysisIssue, FixResult } from '../types';
import { analyzeContent, generateCodeFix } from '../services/geminiService';
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon, ActivityIcon, CodeIcon, DownloadIcon, PhoneIcon } from './IconComponents';
import { CodeBlock } from './CodeBlock';

interface AnalysisViewProps {
  module: SeoModuleType;
  title: string;
  description: string;
  domain: string;
  existingResult?: AnalysisResult;
  allResults: Partial<Record<SeoModuleType, AnalysisResult>>;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const SeverityBadge = ({ severity }: { severity: string }) => {
  switch (severity) {
    case 'CRITICAL':
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-900 text-red-200 border border-red-700 animate-pulse">KRİTİK</span>;
    case 'HIGH':
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-900 text-orange-200 border border-orange-700">YÜKSEK</span>;
    case 'MEDIUM':
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-900 text-yellow-200 border border-yellow-700">ORTA</span>;
    case 'LOW':
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">DÜŞÜK</span>;
    case 'PASSED':
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-900 text-green-200 border border-green-700">GEÇTİ</span>;
    default:
      return null;
  }
};

const IssueCard: React.FC<{ issue: AnalysisIssue, domain: string }> = ({ issue, domain }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    const result = await generateCodeFix(issue, domain);
    setFixResult(result);
    setIsFixing(false);
  };

  const getIcon = () => {
    if (issue.severity === 'PASSED') return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    if (issue.severity === 'CRITICAL' || issue.severity === 'HIGH') return <XCircleIcon className="w-6 h-6 text-red-500" />;
    return <AlertTriangleIcon className="w-6 h-6 text-yellow-500" />;
  };

  return (
    <div className="bg-dark-card border border-gray-700 rounded-lg p-5 mb-4 hover:border-seo-500 transition-all duration-300 hover:shadow-lg hover:shadow-seo-500/10 group">
      <div className="flex items-start gap-4">
        <div className="mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-seo-400 transition-colors">{issue.title}</h3>
            <SeverityBadge severity={issue.severity} />
          </div>
          <p className="text-gray-400 mb-3 text-sm leading-relaxed">{issue.description}</p>
          
          <div className="bg-gray-800/50 rounded p-3 mb-3 border border-gray-700">
            <span className="text-seo-500 font-medium text-xs uppercase block mb-1">Öneri</span>
            <p className="text-gray-300 text-sm">{issue.recommendation}</p>
          </div>

          {issue.codeSnippet && (
            <div className="mb-3">
               <span className="text-red-400 font-medium text-xs uppercase block mb-1">Tespit Edilen Sorunlu Kod</span>
               <div className="bg-black/30 p-2 rounded border border-red-900/30 font-mono text-xs text-red-200/80 break-all">
                  {issue.codeSnippet}
               </div>
            </div>
          )}

          {issue.severity !== 'PASSED' && issue.canAutoFix && (
            <div className="mt-4">
              {!fixResult ? (
                <button 
                  onClick={handleFix}
                  disabled={isFixing}
                  className="flex items-center gap-2 px-4 py-2 bg-seo-600 hover:bg-seo-500 text-white rounded text-sm font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFixing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Yapay Zeka Çözümlüyor...
                    </>
                  ) : (
                    <>
                      <CodeIcon className="w-4 h-4" />
                      Otomatik Düzelt & Kod Yaz
                    </>
                  )}
                </button>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                    <div className="text-green-400 text-sm mb-2 flex items-center gap-2 font-semibold">
                      <CheckCircleIcon className="w-4 h-4" />
                      Çözüm Hazırlandı
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{fixResult.explanation}</p>
                    <CodeBlock code={fixResult.fixedCode} title="DÜZELTİLMİŞ KOD ÇIKTISI" />
                    <button 
                      onClick={() => setFixResult(null)}
                      className="mt-3 text-xs text-gray-500 hover:text-white underline transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  module, 
  title, 
  description, 
  domain,
  existingResult,
  allResults,
  onAnalysisComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(existingResult || null);
  const [scanStep, setScanStep] = useState<string>("");

  useEffect(() => {
    // If we already have a result for this module in the props, use it and don't re-analyze
    if (existingResult) {
      setResult(existingResult);
      return;
    }

    // Automatically trigger analysis when module or domain changes AND no existing result
    const runAnalysis = async () => {
      setLoading(true);
      setResult(null);
      
      const steps = [
        `Connecting to ${domain}...`,
        "Parsing HTML structure...",
        "Analyzing meta tags and headers...",
        "Checking server response headers...",
        "Evaluating content quality...",
        "Running AI heuristics..."
      ];
      
      for (const step of steps) {
        setScanStep(step);
        await new Promise(r => setTimeout(r, 400));
      }

      try {
        const data = await analyzeContent(module, domain);
        setResult(data);
        onAnalysisComplete(data);
      } catch (e) {
        setResult({
            score: 0,
            summary: "Analiz sırasında bir bağlantı hatası oluştu. Lütfen tekrar deneyin.",
            issues: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (domain) {
      runAnalysis();
    }
  }, [module, domain, existingResult]); // Added existingResult dependency

  const handleDownloadReport = () => {
    if (Object.keys(allResults).length === 0) return;

    // Calculate total score average
    const resultsArray = Object.values(allResults).filter((r): r is AnalysisResult => r !== undefined && r !== null);
    
    if (resultsArray.length === 0) return;

    const totalAvgScore = Math.round(resultsArray.reduce((acc, curr) => acc + curr.score, 0) / resultsArray.length);

    const getSeverityClass = (s: string) => {
        switch(s) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PASSED': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getModuleTitle = (key: string) => {
      switch(key) {
        case 'ON_PAGE': return 'Site İçi (On-Page) SEO';
        case 'OFF_PAGE': return 'Site Dışı (Off-Page) SEO';
        case 'TECHNICAL': return 'Teknik SEO';
        case 'CONTENT': return 'İçerik Analizi';
        case 'BLACK_HAT': return 'Black Hat & Güvenlik';
        case 'LOCAL': return 'Yerel (Local) SEO';
        default: return key;
      }
    };

    let modulesHtml = '';
    
    // Generate HTML for each module
    Object.entries(allResults).forEach(([key, val]) => {
      const res = val as AnalysisResult | undefined;
      if (!res) return;
      
      modulesHtml += `
        <div class="mb-12 border-b-4 border-slate-200 pb-8">
          <div class="flex items-center justify-between mb-6 bg-slate-100 p-4 rounded-lg">
             <h2 class="text-2xl font-bold text-slate-800">${getModuleTitle(key)}</h2>
             <div class="text-xl font-bold ${res.score >= 80 ? 'text-green-600' : res.score >= 50 ? 'text-orange-500' : 'text-red-600'}">
                Skor: ${res.score}/100
             </div>
          </div>
          
          <div class="mb-6 p-4 bg-white border-l-4 border-blue-500 italic text-gray-600">
             ${res.summary}
          </div>

          <div class="space-y-6">
            ${res.issues.map(issue => `
              <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm break-inside-avoid">
                <div class="flex justify-between items-start mb-3">
                  <h4 class="text-lg font-bold text-gray-900">${issue.title}</h4>
                  <span class="px-2 py-1 rounded text-xs font-bold border ${getSeverityClass(issue.severity)}">
                    ${issue.severity}
                  </span>
                </div>
                <p class="text-gray-600 mb-4">${issue.description}</p>
                <div class="bg-slate-50 p-4 rounded border border-slate-200">
                  <div class="text-xs font-bold text-slate-500 uppercase mb-1">Öneri</div>
                  <p class="text-slate-800 text-sm font-medium">${issue.recommendation}</p>
                </div>
                ${issue.codeSnippet ? `
                <div class="mt-4">
                  <div class="text-xs font-bold text-red-500 uppercase mb-1">Tespit Edilen Kod</div>
                  <pre class="bg-gray-900 text-gray-300 p-3 rounded text-xs font-mono overflow-x-auto">${issue.codeSnippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEO Raporu - ${domain} - by Innovmar</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body class="bg-gray-50 text-gray-900 p-8">
  <div class="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden relative">
    
    <div class="bg-slate-900 text-white p-10 relative overflow-hidden">
      <!-- Innovmar Signature -->
      <div class="absolute top-0 right-0 p-2 opacity-10 font-bold text-4xl">
        by innovmar
      </div>

      <div class="flex justify-between items-start relative z-10">
        <div>
          <h1 class="text-4xl font-bold mb-2">ProSEO Master AI</h1>
          <h2 class="text-xl text-gray-400">Kapsamlı Analiz Raporu</h2>
          <div class="mt-4 flex items-center gap-4">
             <div class="inline-block bg-slate-800 px-4 py-2 rounded border border-slate-700 font-mono text-blue-400">
               ${domain}
             </div>
             <a href="tel:+905415079974" class="no-print inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                İletişim: +90 541 507 99 74
             </a>
          </div>
        </div>
        <div class="text-center bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div class="text-sm text-gray-400 uppercase tracking-wider mb-2">Genel Ortalama</div>
          <div class="text-6xl font-bold ${totalAvgScore >= 80 ? 'text-green-400' : totalAvgScore >= 50 ? 'text-yellow-400' : 'text-red-400'}">${totalAvgScore}</div>
        </div>
      </div>
      <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
         <div class="bg-slate-800/50 p-3 rounded">
            <div class="text-xs text-gray-500">Tamamlanan Modüller</div>
            <div class="text-xl font-bold">${resultsArray.length}</div>
         </div>
         <div class="bg-slate-800/50 p-3 rounded">
             <div class="text-xs text-gray-500">Tespit Edilen Sorunlar</div>
             <div class="text-xl font-bold">${resultsArray.reduce((acc, r) => acc + r.issues.length, 0)}</div>
         </div>
         <div class="bg-slate-800/50 p-3 rounded">
             <div class="text-xs text-gray-500">Kritik Hatalar</div>
             <div class="text-xl font-bold text-red-400">${resultsArray.reduce((acc, r) => acc + r.issues.filter(i => i.severity === 'CRITICAL').length, 0)}</div>
         </div>
         <div class="bg-slate-800/50 p-3 rounded">
             <div class="text-xs text-gray-500">Tarih</div>
             <div class="text-xl font-bold">${new Date().toLocaleDateString('tr-TR')}</div>
         </div>
      </div>
    </div>

    <div class="p-10">
      ${modulesHtml}
    </div>
    
    <div class="bg-slate-900 text-gray-400 p-8 text-center border-t border-slate-800">
      <div class="flex flex-col items-center justify-center gap-4">
        <p class="text-sm">ProSEO Master AI Tarafından Otomatik Oluşturulmuştur</p>
        <div class="flex items-center gap-2 text-xl font-bold text-white">
           <span>by innovmar</span>
        </div>
        <a href="tel:+905415079974" class="text-green-400 hover:text-green-300 transition-colors font-mono">
           +90 541 507 99 74
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-rapor-innovmar-${domain.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-seo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-seo-900/20 rounded-full animate-pulse"></div>
          <ActivityIcon className="absolute inset-0 m-auto w-8 h-8 text-seo-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-mono font-bold text-white mb-2 animate-pulse">SİSTEM TARANIYOR</h2>
        <p className="text-seo-400 font-mono text-sm">{scanStep}</p>
        <div className="w-64 h-1 bg-gray-800 rounded mt-6 overflow-hidden">
          <div className="h-full bg-seo-500 animate-scan w-full" style={{ width: '30%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8 border-b border-gray-800 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                <p className="text-gray-400">{description}</p>
            </div>
            <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <div className="text-xs text-gray-500 uppercase tracking-wider hidden md:block">Hedef Site</div>
                <div className="text-lg font-mono text-seo-400 font-bold bg-seo-900/20 px-3 py-1 rounded border border-seo-900/50 mb-2 md:mb-0 text-center md:text-right">
                    {domain}
                </div>
                <div className="flex items-center gap-2">
                    <a 
                      href="tel:+905415079974"
                      className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-2 rounded border border-green-600 transition-colors shadow-lg"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span className="hidden md:inline">İletişim</span>
                    </a>
                    {result && (
                      <button 
                        onClick={handleDownloadReport}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded border border-gray-600 transition-colors shadow-lg"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Raporu İndir
                      </button>
                    )}
                </div>
            </div>
        </div>
      </header>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-card p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-seo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">SEO Skoru</span>
              <div className="relative z-10">
                 <div className={`text-6xl font-bold tracking-tighter ${result.score >= 80 ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]' : result.score >= 50 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]'}`}>
                    {result.score}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">/ 100</div>
              </div>
            </div>
            <div className="md:col-span-2 bg-dark-card p-6 rounded-xl border border-gray-700 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ActivityIcon className="w-24 h-24 text-white" />
               </div>
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">AI Yönetici Özeti</span>
              <p className="text-white text-lg leading-relaxed">{result.summary}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-gray-800 flex-1"></div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ActivityIcon className="text-seo-500 w-5 h-5" />
                Tespit Edilen Bulgular
                </h2>
                <div className="h-px bg-gray-800 flex-1"></div>
            </div>
            
            {result.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} domain={domain} />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col items-center justify-center text-gray-500">
              <span className="text-sm font-mono tracking-widest opacity-50 uppercase">by innovmar</span>
          </div>
        </div>
      )}
    </div>
  );
};