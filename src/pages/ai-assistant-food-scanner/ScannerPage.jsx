import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import CoachPulse from '../../components/CoachPulse';
import { logFood, getFoodLogs, deleteFoodLog } from '../../utils/api/foodApi';
import { getAccountId } from '../../utils/localAccountStorage';
import { buildRecoveryMatch } from '../../utils/recoveryMatch';
import { buildFoodCoachPulse } from '../../utils/coachPulse';
import { normalizeFoodAnalysis, parseFoodAnalysisResponse } from '../../utils/foodAnalysisNormalizer';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/bento-dashboard.css';

const ScannerPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Mahmoud Ayman', profilePicture: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const CHATBOT_API_KEY = import.meta.env.VITE_CHATBOT_API_KEY || '';
  const getUserId = (account = user) => getAccountId(account.principal || account.id || account.email || account.name);

  const formatHistoryItem = (food) => ({
    id: food.id,
    name: food.food_name || food.name || t('scanner.unknownFood'),
    calories: food.calories || 0,
    protein: food.protein || 0,
    carbs: food.carbs ?? food.carbohydrates ?? 0,
    fats: food.fat ?? food.fats ?? 0,
    sugar: food.sugar || 0,
    servingSize: food.portion_size || food.serving_size || food.servingSize || '',
    image: food.image_url || food.image || '',
    recommendation: food.recommendation || '',
    dateLogged: food.date_logged || food.dateLogged || new Date().toISOString(),
    time: new Date(food.date_logged || food.dateLogged || Date.now()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
  });

  const isUsableFoodLog = (food) => {
    const name = String(food?.food_name || food?.name || '').trim().toLowerCase();
    const calories = Number(food?.calories || 0);
    const protein = Number(food?.protein || 0);
    const carbs = Number(food?.carbs ?? food?.carbohydrates ?? 0);
    const fats = Number(food?.fat ?? food?.fats ?? 0);
    return !(name.includes('unknown food') && calories === 0 && protein === 0 && carbs === 0 && fats === 0);
  };

  const showHistoryItem = (item) => {
    setScanResult({ ...item, saved: true });
    setPreviewImage(item.image || null);
  };

  const compressHistoryImage = (dataUrl) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = 720;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

  useEffect(() => {
    document.body.style.backgroundColor = 'var(--bento-bg)';
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.name) setUser(u);

      const loadHistory = async () => {
        const foods = await getFoodLogs(getUserId(u));
        setScanHistory(foods.filter(isUsableFoodLog).map(formatHistoryItem));
      };
      loadHistory();
    } catch (e) { console.error(e); }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-screen');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const toDataUrl = (f) => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(f);
      });
      const imageDataUrl = await toDataUrl(file);
      const imageBase64 = imageDataUrl.split(',')[1];
      const historyImage = await compressHistoryImage(imageDataUrl);
      setPreviewImage(imageDataUrl);

      if (!CHATBOT_API_KEY) {
        throw new Error('Gemini API key is missing. Add a fresh VITE_CHATBOT_API_KEY to .env.');
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${CHATBOT_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: file.type, data: imageBase64 } },
              { text: 'Analyze this food image and return one minified JSON object only. Do not use markdown, code fences, comments, or prose. Estimate all nutrition values for the visible serving; never omit macros. Use numeric grams/kcal only. Required fields: {"name":string,"calories":number,"protein":number,"carbohydrates":number,"fat":number,"sugar":number,"serving_size":string}.' }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json' }
        })
      });

      const data = await response.json();

      if (data?.error) {
        throw new Error(data.error.message || 'Food analysis API error.');
      }

      if (!response.ok) {
        throw new Error(`Food analysis API request failed with status ${response.status}.`);
      }

      let result = null;
      let rawText = '';
      if (data?.candidates?.[0]?.content?.parts) {
        rawText = data.candidates[0].content.parts.map(p => p.text || '').join('\n');
        result = parseFoodAnalysisResponse(rawText);
      }

      if (result) {
        const analyzedMeal = normalizeFoodAnalysis(result, {
          defaultName: t('scanner.unknownFood'),
          image: historyImage,
          dateLogged: new Date().toISOString(),
        });

        if (
          analyzedMeal.name === t('scanner.unknownFood') &&
          analyzedMeal.calories === 0 &&
          analyzedMeal.protein === 0 &&
          analyzedMeal.carbs === 0 &&
          analyzedMeal.fats === 0
        ) {
          throw new Error('The AI response did not include usable nutrition data.');
        }

        setScanResult({ ...analyzedMeal, saved: false });

        try {
          const saved = await logFood(getUserId(), {
            foodName: analyzedMeal.name,
            calories: analyzedMeal.calories,
            protein: analyzedMeal.protein,
            carbs: analyzedMeal.carbs,
            fat: analyzedMeal.fats,
            sugar: analyzedMeal.sugar,
            portionSize: analyzedMeal.servingSize,
            imageUrl: analyzedMeal.image,
            dateLogged: analyzedMeal.dateLogged,
          });
          const savedMeal = { ...formatHistoryItem(saved), saved: true };
          setScanResult(savedMeal);
          setScanHistory(prev => [savedMeal, ...prev.filter(item => String(item.id) !== String(savedMeal.id))]);
        } catch (saveError) {
          console.warn('Food analyzed but could not be saved:', saveError);
        }
      } else {
        throw new Error('The AI response did not include usable nutrition data. Please try a clearer food photo.');
      }
    } catch (error) {
      console.error(error);
      setScanResult({
        name: t('scanner.error'),
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        saved: false,
        errorMessage: error.message || 'Food analysis failed.',
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteHistoryItem = async (itemId) => {
    try {
      await deleteFoodLog(itemId, getUserId());
      setScanHistory(prev => prev.filter(item => String(item.id) !== String(itemId)));
      if (String(scanResult?.id) === String(itemId)) {
        setScanResult(null);
        setPreviewImage(null);
      }
    } catch (e) {
      console.error('Could not delete food history item:', e);
    }
  };

  const recoveryMatch = scanResult && !scanResult.errorMessage ? buildRecoveryMatch(scanResult) : null;
  const coachPulse = buildFoodCoachPulse({ scanResult, recoveryMatch });

  return (
    <div className="bento-root">
      <div className="trail trail-coral" style={{ width: 600, height: 600, top: '-10%', left: '10%', opacity: 0.08 }} />
      <div className="trail trail-olive" style={{ width: 500, height: 500, bottom: '5%', right: '5%', opacity: 0.06 }} />

      <AppHeader
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-24 lg:pl-72 min-h-screen">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">

          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--bento-text)', margin: 0, letterSpacing: '0' }}>{t('scanner.title')}</h1>
            <p style={{ color: 'var(--bento-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>{t('scanner.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* 1. Camera Widget (Spans 7 cols) */}
            <div className="bento-card food-scanner-panel col-span-1 lg:col-span-7">
              <div className="food-scanner-toolbar">
                <div className="food-scanner-toolbar-title">
                  <div className="food-scanner-toolbar-icon">
                    <Icon name="Camera" size={19} color="#FF8A00" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0 }}>{t('scanner.frame')}</h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--bento-muted)', fontWeight: 700, margin: '2px 0 0' }}>{t('scanner.savedScans', { count: scanHistory.length })}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                  <button className="btn-olive" onClick={() => fileInputRef.current?.click()} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    <Icon name="Upload" size={14} /> {t('scanner.upload')}
                  </button>
                </div>
              </div>

              {/* Camera View / Preview */}
              <div className={`food-scanner-stage ${previewImage ? 'has-image' : 'is-empty'} ${isScanning ? 'is-scanning' : ''}`}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="food-scanner-preview" />
                ) : (
                  <div className="food-scanner-empty">
                    <div className="food-scan-core">
                      <Icon name="ScanLine" size={30} color="#FF8A00" />
                    </div>
                    <strong>{t('scanner.emptyTitle')}</strong>
                    <span>{t('scanner.emptyCopy')}</span>
                  </div>
                )}

                {previewImage && isScanning && (
                  <div className="food-image-scan-overlay">
                    <div className="food-image-scan-frame">
                      <span />
                    </div>
                    <div className="food-image-scan-loader">
                      <Icon name="ScanSearch" size={16} color="#FF8A00" />
                      {t('scanner.reading')}
                    </div>
                  </div>
                )}

                {!isScanning && (
                  <div className="food-scanner-status">
                    <span className="food-scanner-status-dot" />
                    {previewImage ? t('scanner.complete') : t('scanner.ready')}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Right Column (Spans 5 cols) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-5">

              {/* Results Widget */}
              <div className="bento-card food-analysis-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0 }}>{t('scanner.result')}</h3>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: scanResult ? '#FF8A00' : '#a7a289', background: scanResult ? 'rgba(255, 138, 0,0.1)' : 'rgba(167,162,137,0.1)', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}>
                    <Icon name={scanResult?.errorMessage ? "AlertTriangle" : scanResult ? "Check" : "CameraOff"} size={12} /> {scanResult ? scanResult.name : t('scanner.noData')}
                  </span>
                </div>

                {scanResult?.errorMessage && (
                  <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(255, 138, 0, .3)', background: 'rgba(255, 138, 0, .08)', color: 'var(--bento-soft-text)', fontSize: '0.78rem', lineHeight: 1.45, fontWeight: 700 }}>
                    {scanResult.errorMessage}
                  </div>
                )}

                <div className="food-calorie-row">
                  <strong style={{ color: scanResult ? '#FF8A00' : 'var(--bento-muted)' }}>{scanResult ? scanResult.calories : '--'}</strong>
                  <span>kcal</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="food-macro-tile">
                    <div style={{ fontSize: '0.7rem', color: '#a7a289', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>{t('scanner.protein')}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--bento-soft-text)' }}>{scanResult ? scanResult.protein : '--'}<span style={{ fontSize: '0.8rem', color: scanResult ? '#FF8A00' : 'var(--bento-muted)' }}>g</span></div>
                  </div>
                  <div className="food-macro-tile">
                    <div style={{ fontSize: '0.7rem', color: '#a7a289', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>{t('scanner.carbs')}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--bento-soft-text)' }}>{scanResult ? scanResult.carbs : '--'}<span style={{ fontSize: '0.8rem', color: scanResult ? '#FF8A00' : 'var(--bento-muted)' }}>g</span></div>
                  </div>
                  <div className="food-macro-tile">
                    <div style={{ fontSize: '0.7rem', color: '#a7a289', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>{t('scanner.fats')}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--bento-soft-text)' }}>{scanResult ? scanResult.fats : '--'}<span style={{ fontSize: '0.8rem', color: scanResult ? '#FF8A00' : 'var(--bento-muted)' }}>g</span></div>
                  </div>
                </div>

                <div style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem 1rem', borderRadius: '18px', border: '1px solid var(--bento-border)', background: scanResult?.saved ? 'rgba(255, 138, 0,0.12)' : 'var(--bento-chip)', color: scanResult?.saved ? '#FF8A00' : 'var(--bento-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                  <Icon name={scanResult?.errorMessage ? "AlertTriangle" : scanResult?.saved ? "CheckCircle" : "History"} size={16} />
                  {scanResult?.errorMessage ? 'Not saved' : scanResult?.saved ? t('scanner.saved') : t('scanner.autoSave')}
                </div>

                {recoveryMatch && (
                  <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(255,138,0,.28)', background: 'linear-gradient(135deg, rgba(255,138,0,.12), var(--bento-chip))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#FF8A00', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          <Icon name="Activity" size={14} />
                          Recovery Match
                        </div>
                        <strong style={{ display: 'block', color: 'var(--bento-text)', fontSize: '1rem', lineHeight: 1.25 }}>{recoveryMatch.verdict}</strong>
                        <span style={{ color: 'var(--bento-muted)', fontSize: '0.78rem' }}>after {recoveryMatch.focus}</span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <strong style={{ display: 'block', color: '#FF8A00', fontSize: '2rem', lineHeight: 1 }}>{recoveryMatch.score}%</strong>
                        <span style={{ color: 'var(--bento-muted)', fontSize: '0.68rem', fontWeight: 800 }}>FIT SCORE</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '0.9rem' }}>
                      {[
                        ['Protein', recoveryMatch.proteinCoverage],
                        ['Carbs', recoveryMatch.carbCoverage],
                        ['Calories', recoveryMatch.calorieCoverage],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bento-muted)', fontSize: '0.66rem', fontWeight: 800, marginBottom: '4px' }}>
                            <span>{label}</span>
                            <span>{value}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 999, background: 'rgba(167,162,137,.18)', overflow: 'hidden' }}>
                            <div style={{ width: `${value}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#FF8A00,#FAB406)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p style={{ color: 'var(--bento-soft-text)', fontSize: '0.8rem', lineHeight: 1.45, margin: 0, fontWeight: 600 }}>{recoveryMatch.nextStep}</p>
                  </div>
                )}
              </div>

              <CoachPulse {...coachPulse} compact />

              {/* History Widget */}
              <div className="bento-card" style={{ padding: '1.5rem', flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0 }}>{t('scanner.recent')}</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scanHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#a7a289', fontSize: '0.8rem', padding: '1rem' }}>{t('scanner.noHistory')}</div>
                  ) : scanHistory.map(item => (
                    <div key={item.id} onClick={() => showHistoryItem(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0.8rem', background: 'var(--bento-chip)', borderRadius: '12px', border: '1px solid var(--bento-border)', cursor: 'pointer' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'var(--bento-field)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="Utensils" size={16} color="var(--bento-muted)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '4px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--bento-soft-text)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.7rem', color: '#a7a289' }}>{item.time}</span>
                      </div>
                      <div style={{ fontWeight: 800, color: '#FF8A00', fontSize: '0.9rem', flexShrink: 0 }}>
                        {item.calories} <span style={{ fontSize: '0.65rem', color: '#a7a289' }}>kcal</span>
                      </div>
                      <button type="button" title={t('scanner.deleteScan')} onClick={(event) => { event.stopPropagation(); handleDeleteHistoryItem(item.id); }} style={{ width: 30, height: 30, borderRadius: '999px', border: '1px solid var(--bento-border)', background: 'transparent', color: 'var(--bento-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScannerPage;
