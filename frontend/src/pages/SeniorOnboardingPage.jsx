import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Plus, 
  X, 
  MapPin, 
  Clock, 
  Globe, 
  ArrowRight, 
  ArrowLeft,
  Volume2,
  FileText,
  ShieldCheck,
  Lightbulb,
  ShoppingBag,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import AddServiceModal from '../components/modals/AddServiceModal';
import AddProductModal from '../components/modals/AddProductModal';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SAMPLE_STORIES = {
  en: "I worked as an accountant for 35 years for small retail businesses. I know Excel, GST compliance, and basic bookkeeping. I have also tutored juniors and school students in mathematics and commerce.",
  ta: "நான் 35 வருஷம் அக்கவுண்டன்ட்டா வேலை பார்த்திருக்கேன். சிறு வணிகங்களுக்கு கணக்கு பார்த்திருக்கேன். எக்செல், ஜிஎஸ்டி நல்லா தெரியும். பள்ளி மாணவர்களுக்கு கணக்கு மற்றும் தமிழ் பாடம் சொல்லிக் கொடுத்திருக்கேன்.",
  hi: "मैंने 35 साल तक छोटे व्यवसायों के लिए अकाउंटेंट के रूप में काम किया है। मुझे एक्सेल, जीएसटी और बहीखाता की अच्छी जानकारी है। मैंने बच्चों को गणित और वाणिज्य भी पढ़ाया है।",
  te: "నేను 35 సంవత్సరాలు అకౌంటెంట్‌గా పనిచేశాను. చిన్న వ్యాపారాల లెక్కలు చూశాను. ఎక్సెల్, జీఎస్టీ బాగా వచ్చు. విద్యార్థులకు తెలుగు మరియు లెక్కలు కూడా నేర్పించాను."
};

export default function SeniorOnboardingPage() {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const { selectedCity, selectedLocality } = useLocation();
  const navigate = useNavigate();

  // Wizard Steps: 1 = Input, 2 = AI Extraction, 3 = Review Skills, 4 = Preferences, 5 = Recommendations Hub (Issue #7)
  const [currentStep, setCurrentStep] = useState(1);
  const [inputMode, setInputMode] = useState('voice'); // voice or text
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  
  // Life Story Text
  const [storyText, setStoryText] = useState(SAMPLE_STORIES[language] || SAMPLE_STORIES.en);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // AI Extracted Profile Data
  const [extractedData, setExtractedData] = useState({
    explicit_skills: [],
    inferred_skills: [],
    keywords: [],
    bio: '',
    suggested_service_product_title: '',
    launchpad_service_idea: null,
    launchpad_product_idea: null,
    analysis_engine: 'gemini_flash_nlp'
  });

  // Custom new skill input
  const [newSkillInput, setNewSkillInput] = useState('');
  
  // Preferences
  const [travelRadius, setTravelRadius] = useState('5 km');
  const [workMode, setWorkMode] = useState('both'); // home, online, offline, both
  const [availability, setAvailability] = useState('Evenings & Weekends');
  const [locality, setLocality] = useState(selectedLocality !== 'All Areas' ? selectedLocality : 'Adyar');

  // Modals for Step 5
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalSkillHint, setModalSkillHint] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync sample story when language changes
  useEffect(() => {
    if (SAMPLE_STORIES[language]) {
      setStoryText(SAMPLE_STORIES[language]);
    }
  }, [language]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const langMap = {
        en: 'en-IN',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        pa: 'pa-IN',
        or: 'or-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const fullText = (finalTranscript + interimTranscript).trim();
        if (fullText) {
          setSpokenTranscript(fullText);
          setStoryText(fullText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Audio capture error:', err);
      setError('Microphone access unavailable. You can type or paste your story directly below.');
      setInputMode('text');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      clearInterval(timerIntervalRef.current);
    }
  };

  const reRecord = () => {
    setAudioBlobUrl(null);
    setSpokenTranscript('');
    setRecordingTime(0);
  };

  const handleAnalyzeStory = async () => {
    if (!storyText.trim()) {
      setError('Please tell or write your story first.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.post('/senior/extract-skills', {
        story_text: storyText,
        language
      });
      const rawExplicit = Array.isArray(res.explicit_skills) ? res.explicit_skills : [];
      const rawInferred = Array.isArray(res.inferred_skills) ? res.inferred_skills : [];

      const cleanExplicit = rawExplicit.map(s => typeof s === 'object' ? (s.skill || s.name || 'Core Skill') : String(s));
      const cleanInferred = rawInferred.map(s => {
        if (typeof s === 'object') {
          return { skill: s.skill || s.name || 'Transferable Skill', reason: s.reason || 'Derived from your career background' };
        }
        return { skill: String(s), reason: 'Identified from your life story' };
      });

      setExtractedData({
        explicit_skills: cleanExplicit,
        inferred_skills: cleanInferred,
        keywords: Array.isArray(res.keywords) ? res.keywords : ['Experience', 'Advisory'],
        bio: res.bio || storyText.slice(0, 150),
        suggested_service_product_title: res.suggested_service_product_title || '',
        launchpad_service_idea: res.launchpad_service_idea || null,
        launchpad_product_idea: res.launchpad_product_idea || null,
        analysis_engine: res.analysis_engine || 'gemini_flash_nlp'
      });
      setCurrentStep(3); // Go to Skill Review
    } catch (err) {
      setError(err.message || 'AI skill extraction failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddCustomSkill = () => {
    if (newSkillInput.trim() && !extractedData.explicit_skills.includes(newSkillInput.trim())) {
      setExtractedData(prev => ({
        ...prev,
        explicit_skills: [...prev.explicit_skills, newSkillInput.trim()]
      }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove, isExplicit = true) => {
    if (isExplicit) {
      setExtractedData(prev => ({
        ...prev,
        explicit_skills: prev.explicit_skills.filter(s => s !== skillToRemove)
      }));
    } else {
      setExtractedData(prev => ({
        ...prev,
        inferred_skills: prev.inferred_skills.filter(s => s !== skillToRemove)
      }));
    }
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/senior/profile', {
        story_text: storyText,
        language,
        skills: extractedData.explicit_skills,
        inferred_skills: extractedData.inferred_skills,
        keywords: extractedData.keywords,
        bio: extractedData.bio,
        travel_radius: travelRadius,
        locality,
        city: selectedCity?.name || 'Chennai',
        work_mode: workMode,
        availability
      });

      // Move to Step 5: Recommendations & Launchpad (Issue #7)
      setCurrentStep(5);
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const allSkills = [...extractedData.explicit_skills, ...extractedData.inferred_skills];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Wizard Header & Progress */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Life-to-Skill AI Discovery
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
          Turn Your Life Experience Into Dignified Livelihood
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 max-w-xl mx-auto">
          No complicated resumes. Speak in your mother tongue and our AI extracts your skills, suggests managed tuition packages, and matches local gigs.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${currentStep === 1 ? 'bg-primary text-white' : 'bg-base-300 text-base-content/70'}`}>
            <span>1. Story</span>
          </div>
          <div className="w-4 h-0.5 bg-base-300"></div>
          <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${currentStep === 3 ? 'bg-primary text-white' : 'bg-base-300 text-base-content/70'}`}>
            <span>2. Skills</span>
          </div>
          <div className="w-4 h-0.5 bg-base-300"></div>
          <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${currentStep === 4 ? 'bg-primary text-white' : 'bg-base-300 text-base-content/70'}`}>
            <span>3. Preferences</span>
          </div>
          <div className="w-4 h-0.5 bg-base-300"></div>
          <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${currentStep === 5 ? 'bg-primary text-white' : 'bg-base-300 text-base-content/70'}`}>
            <span>4. Launchpad</span>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* STEP 1: Story Input (Voice / Type) */}
      {currentStep === 1 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-base-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <label className="text-xs font-bold text-base-content">Spoken Language:</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="select select-bordered select-xs text-xs font-semibold rounded-lg"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.native} ({lang.name})</option>
                ))}
              </select>
            </div>

            <div className="join self-start sm:self-auto">
              <button 
                type="button"
                onClick={() => setInputMode('voice')}
                className={`join-item btn btn-xs gap-1 ${inputMode === 'voice' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Mic className="w-3 h-3" /> Voice Recording
              </button>
              <button 
                type="button"
                onClick={() => setInputMode('text')}
                className={`join-item btn btn-xs gap-1 ${inputMode === 'text' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <FileText className="w-3 h-3" /> Type Instead
              </button>
            </div>
          </div>

          {/* Voice Interface */}
          {inputMode === 'voice' && (
            <div className="space-y-6 text-center py-4">
              <div className="relative inline-flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-lg ${
                    isRecording 
                      ? 'bg-error text-white animate-pulse ring-8 ring-error/30' 
                      : 'bg-gradient-to-tr from-primary to-secondary text-white hover:scale-105 ring-4 ring-primary/20'
                  }`}
                  aria-label={isRecording ? "Stop Recording" : "Start Voice Recording"}
                >
                  {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                  <span className="text-[11px] font-extrabold uppercase mt-1">
                    {isRecording ? 'Tap to Stop' : 'Tap to Speak'}
                  </span>
                </button>

                {isRecording && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                    <span className="text-sm font-mono font-bold text-error">{formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-3">
                  <button 
                    type="button"
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="btn btn-sm btn-outline rounded-xl gap-1 text-xs"
                  >
                    {isPaused ? <><Play className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
                  </button>
                  <button 
                    type="button"
                    onClick={stopRecording}
                    className="btn btn-sm btn-error text-white rounded-xl gap-1 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Finish Story
                  </button>
                </div>
              )}

              {audioBlobUrl && !isRecording && (
                <div className="bg-base-200 p-4 rounded-2xl max-w-md mx-auto space-y-2 border border-base-300">
                  <div className="flex items-center justify-between text-xs font-semibold text-base-content/80">
                    <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4 text-primary" /> Audio Recorded</span>
                    <button onClick={reRecord} className="text-error hover:underline flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Re-record
                    </button>
                  </div>
                  <audio controls src={audioBlobUrl} className="w-full h-9" />
                </div>
              )}

              <div className="bg-base-200/60 p-4 rounded-2xl text-left border border-base-300 text-xs text-base-content/75 space-y-1.5">
                <p className="font-bold text-base-content flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-warning" /> What can you talk about?
                </p>
                <ul className="list-disc list-inside space-y-1 text-base-content/70">
                  <li>Your past profession, career, or homemaking experience (e.g. accounting, tailoring, cooking, teaching).</li>
                  <li>Traditional skills, recipes, or regional crafts you know.</li>
                  <li>Languages you speak fluently and willing to tutor.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Spoken Transcript / Text Area */}
          <div className="form-control">
            <label className="label text-xs font-bold text-base-content">
              {inputMode === 'voice' ? 'Live Transcribed Speech (Editable):' : 'Your Life Story & Career:'}
            </label>
            <textarea
              rows={4}
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Tell us about your background, career, cooking, tutoring, tailoring, or accounting experience..."
              className="textarea textarea-bordered w-full text-xs sm:text-sm rounded-2xl font-normal leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAnalyzeStory}
              disabled={analyzing || !storyText.trim()}
              className="btn btn-primary text-white rounded-2xl font-bold gap-2 text-xs sm:text-sm px-6 shadow-md"
            >
              {analyzing ? <span className="loading loading-spinner loading-xs"></span> : <Sparkles className="w-4 h-4" />}
              Discover My Skills with Gemini AI <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: Review & Refine Extracted Skills */}
      {currentStep === 3 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-6 space-y-6">
          
          <div className="border-b border-base-200 pb-3">
            <h2 className="text-lg font-extrabold text-base-content flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI-Identified Skills & Capabilities
            </h2>
            <p className="text-xs text-base-content/60">
              Verified by Gemini AI. Add or remove any skills to fine-tune your matching profile.
            </p>
          </div>

          {/* Primary Core Skills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-base-content">Primary Core Skills:</label>
            <div className="flex flex-wrap gap-2">
              {extractedData.explicit_skills.map((skill) => (
                <span key={skill} className="badge badge-primary badge-lg text-white font-bold gap-1 text-xs py-3 px-3.5 shadow-xs">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill, true)} className="hover:text-error">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Inferred & Transferable Skills */}
          {extractedData.inferred_skills.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content/70">Inferred & Soft Skills:</label>
              <div className="flex flex-wrap gap-2">
                {extractedData.inferred_skills.map((skillItem, idx) => {
                  const skillName = typeof skillItem === 'object' ? (skillItem.skill || skillItem.name) : skillItem;
                  const reason = typeof skillItem === 'object' ? skillItem.reason : '';
                  return (
                    <span key={idx} title={reason} className="badge badge-secondary badge-outline badge-md font-semibold gap-1 text-xs py-3 px-3">
                      {skillName}
                      <button type="button" onClick={() => handleRemoveSkill(skillItem, false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Custom Skill Input */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-base-content/70">Add Another Skill or Hobby:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="e.g. Spoken Telugu, Bespoke Tailoring, GST Reconciliation, Traditional Sweets..."
                className="input input-bordered input-sm flex-1 text-xs rounded-xl"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSkill(); } }}
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="btn btn-sm btn-outline rounded-xl text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Generated Bio */}
          <div className="form-control pt-2">
            <label className="label text-xs font-bold text-base-content">Senior Profile Bio:</label>
            <textarea
              rows={2}
              value={extractedData.bio}
              onChange={(e) => setExtractedData({ ...extractedData, bio: e.target.value })}
              className="textarea textarea-bordered text-xs rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <button 
              type="button" 
              onClick={() => setCurrentStep(1)}
              className="btn btn-sm btn-ghost gap-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Story
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentStep(4)}
              className="btn btn-sm btn-primary text-white rounded-xl font-bold gap-1 text-xs shadow-md"
            >
              Set Preferences <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 4: Preferences & Location */}
      {currentStep === 4 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-6 space-y-6">
          
          <div className="border-b border-base-200 pb-3">
            <h2 className="text-lg font-extrabold text-base-content flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              Work Mode & Travel Preferences
            </h2>
            <p className="text-xs text-base-content/60">
              Control how and where you want to earn. We only suggest opportunities matching these constraints.
            </p>
          </div>

          {/* Travel Radius */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-base-content flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Maximum Travel Distance:
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {['2 km', '5 km', '10 km', 'Remote only'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTravelRadius(r)}
                  className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                    travelRadius === r 
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                      : 'border-base-300 bg-base-200/40 hover:bg-base-200 text-base-content/70'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-base-content flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Preferred Work Type:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'both', label: '🌐 Online or In-Person' },
                { id: 'online', label: '💻 Online Only' },
                { id: 'offline', label: '📍 In-Person Only' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWorkMode(opt.id)}
                  className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                    workMode === opt.id 
                      ? 'border-secondary bg-secondary/10 text-secondary font-bold shadow-xs' 
                      : 'border-base-300 bg-base-200/40 hover:bg-base-200 text-base-content/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-base-content flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" /> Available Timings:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Mornings (9 AM – 1 PM)',
                'Evenings (4 PM – 8 PM)',
                'Weekends Only',
                'Flexible Schedule'
              ].map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setAvailability(slot)}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    availability === slot 
                      ? 'border-accent bg-accent/10 text-accent font-bold shadow-xs' 
                      : 'border-base-300 bg-base-200/40 hover:bg-base-200 text-base-content/70'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Locality in City */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="form-control">
              <label className="label text-xs font-semibold">City</label>
              <input 
                type="text" 
                readOnly
                value={`${selectedCity?.name || 'Chennai'} (${selectedCity?.tier || 'T1'})`} 
                className="input input-bordered input-sm w-full text-xs rounded-xl bg-base-200 font-medium"
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-semibold">Locality / Area</label>
              <select 
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="select select-bordered select-sm w-full text-xs rounded-xl font-medium"
              >
                {(selectedCity?.localities || ['Adyar', 'Mylapore', 'T. Nagar']).map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <button 
              type="button" 
              onClick={() => setCurrentStep(3)}
              className="btn btn-sm btn-ghost gap-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Skills
            </button>
            <button 
              type="button" 
              onClick={handleCompleteOnboarding}
              disabled={saving}
              className="btn btn-sm btn-primary text-white rounded-xl font-bold gap-1 text-xs shadow-md"
            >
              {saving ? <span className="loading loading-spinner loading-xs"></span> : <>Save Profile & View Recommendations <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>

        </div>
      )}

      {/* STEP 5: Recommendations & Launchpad (Issue #7) */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-200">
          
          <div className="bg-gradient-to-r from-success/15 via-base-100 to-primary/15 border border-success/30 rounded-3xl p-6 sm:p-7 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-base-content">
              Your Profile is Live, {user?.full_name || 'Senior Guru'}!
            </h2>
            <p className="text-xs sm:text-sm text-base-content/75 max-w-lg mx-auto">
              Based on your verified skills ({allSkills.slice(0, 3).join(', ')}), here are AI-personalized services & products you can start offering today:
            </p>
            {extractedData.analysis_engine === 'gemini_live' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Powered by Gemini AI
              </span>
            )}
          </div>

          {/* Tailored Service & Product Recommendation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Service Recommendation Card — AI Generated */}
            <div className="card bg-base-100 border-2 border-accent/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="badge badge-accent badge-sm font-bold text-white uppercase text-[10px]">
                  🌟 AI-Recommended Managed Service
                </span>
                <h3 className="font-extrabold text-lg text-base-content">
                  {extractedData.launchpad_service_idea?.title || `1-on-1 Personalized Coaching in ${allSkills[0] || 'Language / Mentoring'}`}
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  {extractedData.launchpad_service_idea?.description || 'Teach students online or in-person. SilverHands manages student bookings, sends WhatsApp reminders, and handles video meeting rooms.'}
                </p>
                <div className="flex items-center gap-3 text-xs font-semibold text-primary pt-1">
                  <span>{extractedData.launchpad_service_idea?.price_range || '₹400–₹800 / session'}</span>
                  <span>•</span>
                  <span>{extractedData.launchpad_service_idea?.duration || '45 mins'}</span>
                  <span>•</span>
                  <span className="capitalize">{extractedData.launchpad_service_idea?.mode || 'online'}</span>
                </div>
                {extractedData.launchpad_service_idea?.category && (
                  <div className="text-[10px] font-medium text-accent/80 pt-0.5">
                    Category: {extractedData.launchpad_service_idea.category}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalSkillHint(extractedData.launchpad_service_idea?.title || allSkills[0] || 'Spoken Telugu Tutoring');
                    setShowServiceModal(true);
                  }}
                  className="btn btn-accent btn-sm rounded-xl text-white font-bold text-xs gap-1.5 w-full shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Launch Managed Service Offering
                </button>
              </div>
            </div>

            {/* Product Recommendation Card — AI Generated */}
            <div className="card bg-base-100 border-2 border-secondary/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="badge badge-secondary badge-sm font-bold text-white uppercase text-[10px]">
                  🛍️ AI-Recommended Product to Sell
                </span>
                <h3 className="font-extrabold text-lg text-base-content">
                  {extractedData.launchpad_product_idea?.title || 'Handcrafted Delicacy / Speciality Box'}
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  {extractedData.launchpad_product_idea?.description || `List your traditional recipes, sweets, pickles, or tailored garments for ${selectedCity?.name || 'Chennai'} customers. AI writes the story and sets price.`}
                </p>
                <div className="flex items-center gap-3 text-xs font-semibold text-secondary pt-1">
                  {extractedData.launchpad_product_idea?.price ? (
                    <>
                      <span>₹{extractedData.launchpad_product_idea.price}</span>
                      <span>•</span>
                      <span>{extractedData.launchpad_product_idea.unit || 'Pack'}</span>
                    </>
                  ) : (
                    <>
                      <span>100% Direct Payout</span>
                      <span>•</span>
                      <span>Zero Listing Fees</span>
                    </>
                  )}
                </div>
                {extractedData.launchpad_product_idea?.category && (
                  <div className="text-[10px] font-medium text-secondary/80 pt-0.5">
                    Category: {extractedData.launchpad_product_idea.category}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalSkillHint(extractedData.launchpad_product_idea?.title || allSkills.find(s => typeof s === 'string' && (s.includes('Cook') || s.includes('Tailor'))) || 'Traditional homemade delicacies');
                    setShowProductModal(true);
                  }}
                  className="btn btn-secondary btn-sm rounded-xl text-white font-bold text-xs gap-1.5 w-full shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> List Product in Marketplace
                </button>
              </div>
            </div>

          </div>

          {/* Go to Deck */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => navigate('/senior')}
              className="btn btn-primary rounded-2xl text-white font-extrabold px-8 gap-2 shadow-md"
            >
              Explore Nearby Opportunity Deck <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Modals */}
      <AddServiceModal
        isOpen={showServiceModal}
        initialSkill={modalSkillHint}
        initialData={extractedData.launchpad_service_idea}
        onClose={() => setShowServiceModal(false)}
        onServiceCreated={() => {
          setToastMsg('Service offering launched successfully!');
          setTimeout(() => setToastMsg(''), 3500);
        }}
      />

      <AddProductModal
        isOpen={showProductModal}
        initialSkill={modalSkillHint}
        initialData={extractedData.launchpad_product_idea}
        onClose={() => setShowProductModal(false)}
        onProductCreated={() => {
          setToastMsg('Homemade product listed in marketplace successfully!');
          setTimeout(() => setToastMsg(''), 3500);
        }}
      />

    </div>
  );
}
