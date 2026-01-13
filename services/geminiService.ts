import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, AnalysisIssue, SeoModuleType, FixResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Sen "ProSEO Master AI" adında, dünya standartlarında bir Kıdemli SEO Analiz Botusun.
Görevin, kullanıcının girdiği ALAN ADINI (Domain) sanki gerçek zamanlı bir tarayıcı (crawler) gibi analiz etmektir.
Gerçekte siteye erişemesen bile, bu sitenin sektörünü, olası yapısını ve yaygın SEO hatalarını bildiğin için, son derece gerçekçi, spesifik ve teknik bir simülasyon raporu oluşturmalısın.

Kurallar:
1. Her zaman Türkçe yanıt ver.
2. Analizlerin genel geçer ("Meta tag eksik olabilir") değil, spesifik ("Ana sayfada H1 etiketi birden fazla kullanılmış: 'Hoşgeldiniz' ve 'Hizmetlerimiz'") gibi görünmeli.
3. Kullanıcının girdiği domain'e (örneğin e-ticaret, blog, kurumsal) uygun senaryolar üret.
4. "Code Snippet" alanlarında, o siteden alınmış gibi görünen HTML/CSS/JS örnekleri uydur ama mantıklı olsun.
5. Kullanıcı sadece domain girecek, sen arka planda HTML'i çekmiş, linkleri taramış ve sunucu yanıtlarını incelemiş gibi davranacaksın.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "0 ile 100 arasında genel SEO puanı" },
    summary: { type: Type.STRING, description: "Analiz sonuçlarının kısa bir özeti (maksimum 2 cümle)" },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING, description: "Sorun başlığı veya kontrol noktası" },
          description: { type: Type.STRING, description: "Sorunun detayı" },
          severity: { type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'PASSED'] },
          recommendation: { type: Type.STRING, description: "Nasıl düzeltileceğine dair öneri" },
          canAutoFix: { type: Type.BOOLEAN, description: "Bu sorun kod ile otomatik düzeltilebilir mi?" },
          codeSnippet: { type: Type.STRING, description: "Sorunlu kod parçası (simüle edilmiş)" }
        },
        required: ["id", "title", "description", "severity", "recommendation", "canAutoFix"]
      }
    }
  },
  required: ["score", "summary", "issues"]
};

export const analyzeContent = async (
  moduleType: SeoModuleType,
  domain: string
): Promise<AnalysisResult> => {
  
  let promptPrefix = "";
  
  switch (moduleType) {
    case SeoModuleType.ON_PAGE:
      promptPrefix = `GİRİLEN DOMAIN: ${domain}
      
      GÖREV: Bu web sitesi için kapsamlı bir "Site İçi (On-Page) SEO" denetimi simüle et.
      
      KONTROL LİSTESİ:
      - Başlık (Title) ve Meta Açıklama (Description) optimizasyonu.
      - H1, H2, H3 hiyerarşisi.
      - Görsel ALT etiketleri.
      - URL yapısı (dostu URL'ler).
      - İç linkleme stratejisi.
      - HTML anlamsal etiket kullanımı (header, nav, main, footer).
      
      Lütfen bu domain için olası kritik ve orta seviye hataları tespit etmiş gibi raporla.`;
      break;
      
    case SeoModuleType.OFF_PAGE:
      promptPrefix = `GİRİLEN DOMAIN: ${domain}
      
      GÖREV: Bu web sitesi için bir "Site Dışı (Off-Page) SEO" ve Backlink profili analizi simüle et.
      
      KONTROL LİSTESİ:
      - Tahmini Domain Otoritesi (DA) ve Sayfa Otoritesi (PA).
      - Backlink sayısı ve kalitesi (spam link riski).
      - Çapa metni (Anchor text) çeşitliliği.
      - Sosyal medya sinyalleri.
      - Marka bilinirliği.
      
      Gerçekçi verilerle (örneğin 'Toxic Backlink oranı %12') bir rapor oluştur.`;
      break;
      
    case SeoModuleType.TECHNICAL:
      promptPrefix = `GİRİLEN DOMAIN: ${domain}
      
      GÖREV: Bu web sitesi için derinlemesine "Teknik SEO" denetimi simüle et.
      
      KONTROL LİSTESİ:
      - Sayfa yükleme hızı (Core Web Vitals - LCP, CLS, FID).
      - Mobil uyumluluk ve Responsive tasarım hataları.
      - SSL/HTTPS yapılandırması.
      - Robots.txt ve Sitemap.xml durumu.
      - Canonical etiket hataları.
      - 404 sayfaları ve yönlendirme zincirleri (Redirect chains).
      - Javascript render sorunları.`;
      break;
      
    case SeoModuleType.CONTENT:
      promptPrefix = `GİRİLEN DOMAIN: ${domain}
      
      GÖREV: Bu sitenin içerik kalitesini analiz et ("İçerik SEO").
      
      KONTROL LİSTESİ:
      - İçerik özgünlüğü (Duplicate content riski).
      - Anahtar kelime yamyamlığı (Keyword Cannibalization).
      - İçerik uzunluğu ve derinliği (Thin content).
      - Okunabilirlik skoru.
      - E-E-A-T (Deneyim, Uzmanlık, Otorite, Güvenilirlik) sinyalleri.
      - Kullanıcı niyeti (User intent) uyumu.`;
      break;
      
    case SeoModuleType.BLACK_HAT:
      promptPrefix = `GİRİLEN DOMAIN: ${domain}
      
      GÖREV: Bu sitede "Black Hat SEO" veya spam teknikleri kullanılıp kullanılmadığını dedektif gibi araştır.
      
      KONTROL LİSTESİ:
      - Gizli metinler veya linkler (Hidden text/links).
      - Cloaking (Kullanıcıya farklı, bota farklı içerik gösterme).
      - Keyword Stuffing (Anahtar kelime doldurma).
      - Link çiftliklerinden gelen bağlantılar.
      - Otomatik oluşturulmuş içerik (Spammy AI content).
      - Kötü amaçlı yazılım (Malware) sinyalleri.`;
      break;
      
    case SeoModuleType.LOCAL:
      promptPrefix = `GİRİLEN DOMAIN: ${domain}
      
      GÖREV: Bu işletme/site için "Yerel SEO (Local SEO)" analizi yap.
      
      KONTROL LİSTESİ:
      - Google İşletme Profili (Google Business Profile) optimizasyonu durumu.
      - NAP (Name, Address, Phone) tutarlılığı.
      - Yerel anahtar kelimelerin kullanımı (Şehir/Bölge adları).
      - LocalBusiness Schema.org işaretlemesi.
      - Yerel backlinkler.
      - Müşteri yorumları ve yanıtlanma oranları.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptPrefix,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) throw new Error("API boş yanıt döndürdü.");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Analiz simülasyonu sırasında bir hata oluştu.");
  }
};

export const generateCodeFix = async (
  issue: AnalysisIssue,
  domainContext: string
): Promise<FixResult> => {
  const prompt = `
    Aşağıdaki SEO sorunu için düzeltilmiş kodu oluştur.
    
    WEB SİTESİ: ${domainContext}
    SORUN: ${issue.title}
    DETAY: ${issue.description}
    ÖNERİ: ${issue.recommendation}
    SORUNLU KOD PARÇASI: ${issue.codeSnippet || "Belirtilmemiş"}
    
    Lütfen JSON formatında yanıt ver: { "explanation": "Teknik açıklama", "fixedCode": "Düzeltilmiş kod bloğu" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if(!text) throw new Error("Fix generation failed");
    return JSON.parse(text) as FixResult;

  } catch (error) {
    console.error("Fix Generation Error:", error);
    return {
      explanation: "Otomatik düzeltme oluşturulamadı.",
      fixedCode: "// Üzgünüz, bu sorun için otomatik kod oluşturulamadı."
    };
  }
};