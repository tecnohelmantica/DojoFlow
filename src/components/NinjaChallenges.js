import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { supabase } from '../lib/supabaseClient';
import { 
  CODE_MODERN_COURSES, 
  CODE_HOUR_OF_CODE, 
  CODE_HOUR_OF_AI
} from '../lib/code';
import { 
  HTML_CODE_ORG, 
  JS_LEARN_COURSE, 
  FCC_HTML_COURSE,
  FCC_JS_COURSE,
  RASPBERRY_WEB_LEVEL_1, 
  RASPBERRY_WEB_LEVEL_2, 
  RASPBERRY_WEB_LEVEL_3 
} from '../lib/html';
import { 
  ARDUINO_CHALLENGES, 
  ARDUINO_TUTORIALS 
} from '../lib/arduino';
import { 
  TINKERCAD_3D_ACADEMY, 
  TINKERCAD_3D_CHALLENGES, 
  TINKERCAD_CODEBLOCKS_CHALLENGES, 
  BLOCKSCAD_CHALLENGES 
} from '../lib/tinkercad';
import { 
  ML_LEARNINGML, 
  ML_FOR_KIDS 
} from '../lib/machinelearning';
import { 
  PYTHON_ACADEMIA, 
  PYTHON_RASPBERRY_INTRO,
  PYTHON_RASPBERRY_MORE,
  PYTHON_CODING_KIDS, 
  PYTHON_CODEDEX_BEGINNER, 
  PYTHON_CODEDEX_INTERMEDIATE, 
  PYTHON_CODEDEX_ADVANCED, 
  PYTHON_FREECODECAMP, 
  PYTHON_PICUINO 
} from '../lib/python';
import { 
  RASPBERRY_SCRATCH_L1, 
  RASPBERRY_SCRATCH_L2, 
  RASPBERRY_SCRATCH_CHALLENGES 
} from '../lib/raspberry';
import { ROBOTIX_CHALLENGES } from '../lib/robotix';
import { 
  SCRATCH_TUTORIALS, 
  MICROBIT_TUTORIALS, 
  ARCADE_TUTORIALS, 
  TINKERCAD_3D_TUTORIALS, 
  TINKERCAD_CODEBLOCKS_TUTORIALS, 
  BLOCKSCAD_TUTORIALS, 
  HTML_TUTORIALS 
} from '../lib/tutorials';
import { 
  MICROBIT_CHALLENGES 
} from '../lib/microbit';
import { 
  ARCADE_CHALLENGES 
} from '../lib/arcade';
import { 
  APP_INVENTOR_ACADEMIA,
  APP_INVENTOR_SOCIAL
} from '../lib/appinventor';
import {
  SQL_BEGINNER,
  SQL_INTERMEDIATE,
  SQL_ADVANCED
} from '../lib/sql';
import { PLANETS } from '../lib/planets';
import { 
  Medal, Clock, CheckCircle2, Zap, Star, Trophy,
  ArrowRight, BookOpen, Loader2, Sparkles, AlertTriangle, Upload, X, Paperclip, FileText, XCircle, ExternalLink,
  Code, Globe, Layout, Smartphone, Cpu, Brain, Rocket, ClipboardCheck
} from 'lucide-react';

import { getPlanetById } from '../lib/planets';

export default function NinjaChallenges({ planetId, userId, accentColor = '#0dcfcf', targetLevel = 'Junior', onValidateChallenge, isAutodidact = true, itinerary, setItinerary, refreshTrigger, assessmentCompleted, studentLevel, activeActivities = null }) {
  const pid = planetId === 'tinkercad-arduino' ? 'arduino' : (planetId === 'makecode-microbit' ? 'microbit' : (planetId || '').toLowerCase());
  const searchParams = useSearchParams();
  const [challenges, setChallenges] = useState([]);
  const [expertChallenges, setExpertChallenges] = useState([]);
  const [raspberryL1, setRaspberryL1] = useState([]);
  const [raspberryL2, setRaspberryL2] = useState([]);
  const [codeModern, setCodeModern] = useState([]);
  const [codeHourOfCode, setCodeHourOfCode] = useState([]);
  const [codeHourOfAI, setCodeHourOfAI] = useState([]);
  const [pythonSilent, setPythonSilent] = useState([]);
  const [pythonAcademia, setPythonAcademia] = useState([]);
  const [pythonRetos, setPythonRetos] = useState([]);
  const [pythonRaspberryIntro, setPythonRaspberryIntro] = useState([]);
  const [pythonRaspberryMore, setPythonRaspberryMore] = useState([]);
  const [pythonCodingKids, setPythonCodingKids] = useState([]);
  const [pythonCodedexBeginner, setPythonCodedexBeginner] = useState([]);
  const [pythonCodedexIntermediate, setPythonCodedexIntermediate] = useState([]);
  const [pythonFreeCodeCamp, setPythonFreeCodeCamp] = useState([]);
  const [pythonPicuino, setPythonPicuino] = useState([]);
  const [appInventorAcademia, setAppInventorAcademia] = useState([]);
  const [appInventorSocial, setAppInventorSocial] = useState([]);
  const [mlForKids, setMlForKids] = useState([]);
  const [learningML, setLearningML] = useState([]);
  const [sqlBeginner, setSqlBeginner] = useState([]);
  const [sqlIntermediate, setSqlIntermediate] = useState([]);
  const [sqlAdvanced, setSqlAdvanced] = useState([]);
  const [arduinoBeginner, setArduinoBeginner] = useState([]);
  const [arduinoIntermediate, setArduinoIntermediate] = useState([]);
  const [arduinoAdvanced, setArduinoAdvanced] = useState([]);
  const [arduinoTutorials, setArduinoTutorials] = useState([]);
  const [microbitBeginner, setMicrobitBeginner] = useState([]);
  const [microbitIntermediate, setMicrobitIntermediate] = useState([]);
  const [microbitAdvanced, setMicrobitAdvanced] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [htmlCodeOrg, setHtmlCodeOrg] = useState([]);
  const [jsCourse, setJsCourse] = useState([]);
  const [fccHtml, setFccHtml] = useState([]);
  const [fccJs, setFccJs] = useState([]);
  const [learningML, setLearningML] = useState([]);
  const [tinkercad3d, setTinkercad3d] = useState([]);
  const [tinkercad3dChallenges, setTinkercad3dChallenges] = useState([]);
  const [tinkercadCodeblocks, setTinkercadCodeblocks] = useState([]);
  const [tinkercadCodeblocksTutorials, setTinkercadCodeblocksTutorials] = useState([]);
  const [blockscad, setBlockscad] = useState([]);
  const [blockscadTutorials, setBlockscadTutorials] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');
  const [difficultyChallenges, setDifficultyChallenges] = useState(null);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [mlfkChallengeName, setMlfkChallengeName] = useState('');
  const [mlfkDifficulty, setMlfkDifficulty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [milestoneProgress, setMilestoneProgress] = useState({});
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    if (pid && userId) {
      loadData();
    }
    if (pid === 'tinkercad' && (itinerary === 'codeblocks' || itinerary === 'blockscad') && activeTab === 'tutorials') {
      setActiveTab('challenges');
    }
  }, [pid, userId, difficultyLevel, itinerary, refreshTrigger, searchParams]);

  // Sync activeTab when itinerary or planet changes
  useEffect(() => {
    if (pid === 'python') {
      if (itinerary === 'raspberry') {
        if (!activeTab.startsWith('python_raspberry')) setActiveTab('python_raspberry_intro');
      }
      else if (itinerary === 'kids') setActiveTab('python_kids');
      else if (itinerary === 'codedex') {
        if (!activeTab.startsWith('codedex_')) setActiveTab('codedex_beginner');
      }
      else if (itinerary === 'picuino') setActiveTab('python_picuino');
      else if (itinerary === 'freecodecamp') setActiveTab('python_fcc');
      else if (itinerary === 'academy') setActiveTab('python_silent');
    } else if (pid === 'tinkercad' || pid === '3d') {
      if (itinerary === 'codeblocks') setActiveTab('tinkercad-codeblocks');
      else if (itinerary === 'blockscad') setActiveTab('blockscad');
      else if (itinerary === '3d-design') setActiveTab('3d-design');
    } else if (pid === 'ia') {
      if (itinerary === 'mlforkids') setActiveTab('mlfk_challenges');
      else setActiveTab('learningml-challenges');
    }
  }, [pid, itinerary]);

  // DEEP LINKING: Abrir reto desde notificación
  useEffect(() => {
    const targetId = searchParams.get('challengeId');
    
    if (targetId && !loading && Object.keys(userProgress).length > 0) {
      const findAndOpen = (list, isTutorial = false) => {
        if (!list || !Array.isArray(list)) return false;
        const item = list.find(it => {
          const itemId = it.id || it.numero;
          const cid = isTutorial ? `${pid}-tutorial-${itemId}` : `${pid}-reto-${itemId}`;
          return cid === targetId;
        });
        
        if (item) {
          setSelectedTutorial(item);
          return true;
        }
        return false;
      };

      const found = findAndOpen(challenges) || 
                    findAndOpen(tutorials, true) ||
                    findAndOpen(codeModern) ||
                    findAndOpen(codeHourOfCode) ||
                    findAndOpen(codeHourOfAI) ||
                    findAndOpen(raspberryL1) ||
                    findAndOpen(raspberryL2) ||
                    findAndOpen(expertChallenges);

      if (found) {
        const newUrl = window.location.pathname + (window.location.search.replace(/&?challengeId=[^&]*/, '').replace(/^\?$/, ''));
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [loading, userProgress, challenges]);

  useEffect(() => {
    if (!pid) return;

    // Si el diagnóstico no está hecho, y el planeta tiene diagnóstico, la pestaña por defecto es 'assessment'
    if (['scratch', 'microbit', 'makecode-microbit', 'arcade', 'makecode-arcade', 'arduino', 'tinkercad-arduino', 'sql'].includes(pid) && !assessmentCompleted) {
      setActiveTab('assessment');
      return;
    }

    // Sincronización de Pestaña Activa según Planeta e Itinerario
    if (pid === 'html') {
      if (itinerary === 'raspberry') {
        if (!activeTab || (!activeTab.startsWith('raspberry_') && activeTab !== 'expert')) {
          setActiveTab('raspberry_l1');
        }
      } else if (itinerary === 'javascript') {
        setActiveTab('js_basics');
      } else if (itinerary === 'freecodecamp' || itinerary === 'fcc') {
        setActiveTab('fcc_html');
      } else {
        setActiveTab('html_academy');
      }
    } 
    else if (pid === 'python') {
      if (itinerary === 'raspberry') {
        setActiveTab('python_raspberry_intro');
      } else if (itinerary === 'codedex') {
        setActiveTab('codedex_beginner');
      } else if (itinerary === 'kids') {
        setActiveTab('python_kids');
      } else if (itinerary === 'picuino') {
        setActiveTab('python_picuino');
      } else if (itinerary === 'freecodecamp') {
        setActiveTab('python_fcc');
      } else if (itinerary === 'academy' || !itinerary) {
        setActiveTab('python_silent');
      } else {
        setActiveTab('python_silent');
      }
    }
    else if (pid === 'ia') {
      if (itinerary === 'mlforkids') {
        setActiveTab('mlfk_challenges');
      } else {
        setActiveTab('challenges');
      }
    }
    else if (pid === 'appinventor') {
      setActiveTab('challenges');
    }
    else if (pid === 'code' || pid === 'code-org') {
      setActiveTab('modern_courses');
    }
    else if (pid === 'scratch') {
      setActiveTab('scratch_academia');
    }
    else if (pid === 'arduino' || pid === 'tinkercad-arduino') {
      setActiveTab('arduino_beginner');
    }
    else if (pid.includes('microbit')) {
      setActiveTab('microbit_beginner');
    }
    else if (pid === 'arcade' || pid === 'makecode-arcade') {
      setActiveTab('challenges');
    }
    else if (pid === 'tinkercad' || pid === '3d') {
      setActiveTab('challenges');
    }
    else if (pid === 'sql') {
      setActiveTab('sql_beginner');
    }
    else {
      // Fallback genérico
      if (tutorials && tutorials.length > 0) {
        setActiveTab('tutorials');
      } else {
        setActiveTab('challenges');
      }
    }
  }, [pid, planetId, itinerary, tutorials, assessmentCompleted]);

  const loadData = async () => {
    setLoading(true);
    const sortFn = (a, b) => {
      const aVal = typeof a.order_index === 'number' ? a.order_index : (typeof a.numero === 'number' ? a.numero : 999);
      const bVal = typeof b.order_index === 'number' ? b.order_index : (typeof b.numero === 'number' ? b.numero : 999);
      return aVal - bVal;
    };

    const filterActive = (list) => {
      if (!list || !Array.isArray(list)) return [];
      if (!activeActivities || activeActivities.length === 0) return list; // If null/empty array, everything is allowed by default
      return list.filter(item => {
        const itemId = item.id?.toString() || item.numero?.toString();
        return activeActivities.includes(itemId);
      });
    };

    const resetLists = () => {
      setHtmlCodeOrg([]);
      setJsCourse([]);
      setFccHtml([]);
      setFccJs([]);
      setLearningML([]);
      setDifficultyChallenges(null);
      setChallenges([]);
      setTutorials([]);
      setExpertChallenges([]);
      setRaspberryL1([]);
      setRaspberryL2([]);
      setTinkercad3d([]);
      setTinkercad3dChallenges([]);
      setTinkercadCodeblocks([]);
      setTinkercadCodeblocksTutorials([]);
      setBlockscad([]);
      setBlockscadTutorials([]);
      setArduinoTutorials([]);
      setPythonSilent([]);
      setPythonAcademia([]);
      setPythonRetos([]);
      setPythonRaspberryIntro([]);
      setPythonRaspberryMore([]);
      setPythonCodingKids([]);
      setPythonCodedexBeginner([]);
      setPythonCodedexIntermediate([]);
      setPythonFreeCodeCamp([]);
      setPythonPicuino([]);
      setAppInventorAcademia([]);
      setAppInventorSocial([]);
      setMlForKids([]);
      setSqlBeginner([]);
      setSqlIntermediate([]);
      setSqlAdvanced([]);
    };

    resetLists();

    if (userId === 'guest_user') {
      // Invitado no tiene progreso en DB, cargar solo locales
      setLoading(true);
      if (pid === 'code') {
        setChallenges(CODE_MODERN_COURSES); setCodeModern(CODE_MODERN_COURSES); setCodeHourOfCode(CODE_HOUR_OF_CODE); setCodeHourOfAI(CODE_HOUR_OF_AI);
      } else if (pid === 'html') {
          setHtmlCodeOrg(filterActive(HTML_CODE_ORG)); 
          setJsCourse(filterActive(JS_LEARN_COURSE)); 
          setFccHtml(filterActive(FCC_HTML_COURSE));
          setFccJs(filterActive(FCC_JS_COURSE));
          setRaspberryL1(filterActive(RASPBERRY_WEB_LEVEL_1)); 
          setRaspberryL2(filterActive(RASPBERRY_WEB_LEVEL_2)); 
          setExpertChallenges(filterActive(RASPBERRY_WEB_LEVEL_3)); 
          setChallenges(filterActive(HTML_CODE_ORG));
      } else if (pid === 'scratch') {
        setChallenges(ROBOTIX_CHALLENGES); setRaspberryL1(RASPBERRY_SCRATCH_L1); setRaspberryL2(RASPBERRY_SCRATCH_L2); setExpertChallenges(RASPBERRY_SCRATCH_CHALLENGES); setTutorials(SCRATCH_TUTORIALS);
      } else if (pid === 'tinkercad' || pid === '3d') {
        setDifficultyChallenges(null);
        setTinkercad3d(TINKERCAD_3D_ACADEMY); 
        setTinkercad3dChallenges(TINKERCAD_3D_CHALLENGES); 
        setTinkercadCodeblocks(TINKERCAD_CODEBLOCKS_CHALLENGES.beginner || []); 
        setBlockscad(BLOCKSCAD_CHALLENGES); 
        
        if (itinerary === 'blockscad') {
          setChallenges(BLOCKSCAD_CHALLENGES);
        } else {
          setChallenges(TINKERCAD_3D_CHALLENGES);
        }
      } else if (pid === 'python') {
        setPythonSilent(PYTHON_ACADEMIA);
        setPythonRaspberryIntro(PYTHON_RASPBERRY_INTRO);
        setPythonRaspberryMore(PYTHON_RASPBERRY_MORE);
        setPythonCodingKids(PYTHON_CODING_KIDS);
        setPythonCodedexBeginner(PYTHON_CODEDEX_BEGINNER);
        setPythonCodedexIntermediate(PYTHON_CODEDEX_INTERMEDIATE);
        setPythonFreeCodeCamp(PYTHON_FREECODECAMP);
        setPythonPicuino(PYTHON_PICUINO);
        setChallenges(PYTHON_ACADEMIA);
        setActiveTab('python_silent');
      } else if (pid === 'appinventor') {
        setAppInventorAcademia(APP_INVENTOR_ACADEMIA); 
        setAppInventorSocial(APP_INVENTOR_SOCIAL); 
        setChallenges(itinerary === 'social' ? APP_INVENTOR_SOCIAL : APP_INVENTOR_ACADEMIA);
      } else if (pid === 'ia') {
        setLearningML(ML_LEARNINGML); setMlForKids(ML_FOR_KIDS); setChallenges(ML_LEARNINGML);
      } else if (pid === 'arduino' || pid === 'tinkercad-arduino') {
        setDifficultyChallenges(ARDUINO_CHALLENGES);
        setArduinoBeginner(ARDUINO_CHALLENGES.beginner);
        setArduinoIntermediate(ARDUINO_CHALLENGES.intermediate);
        setArduinoAdvanced(ARDUINO_CHALLENGES.advanced);
        setChallenges(ARDUINO_CHALLENGES.beginner);
        setTutorials(ARDUINO_TUTORIALS);
      } else if (pid === 'microbit' || pid === 'makecode-microbit') {
        setDifficultyChallenges(MICROBIT_CHALLENGES);
        setMicrobitBeginner(MICROBIT_CHALLENGES.beginner);
        setMicrobitIntermediate(MICROBIT_CHALLENGES.intermediate);
        setMicrobitAdvanced(MICROBIT_CHALLENGES.advanced);
        setChallenges(MICROBIT_CHALLENGES.beginner);
        setTutorials(MICROBIT_TUTORIALS);
      } else if (pid === 'makecode-arcade') {
        setChallenges(ARCADE_CHALLENGES); 
        setTutorials(ARCADE_TUTORIALS);
      } else if (pid === 'sql') {
        setSqlBeginner(SQL_BEGINNER);
        setSqlIntermediate(SQL_INTERMEDIATE);
        setSqlAdvanced(SQL_ADVANCED);
        setChallenges(SQL_BEGINNER);
        setActiveTab('sql_beginner');
      }
      
      // Intentar recuperar progreso local de invitados si existe
      try {
        const localProg = JSON.parse(localStorage.getItem('guest_user_challenges') || '[]');
        const progressMap = {};
        localProg.forEach(p => {
          if (p.challenge_id) progressMap[p.challenge_id] = p;
        });
        setUserProgress(progressMap);
      } catch (e) {
        console.error("Error cargando progreso local de invitado", e);
      }

      setLoading(false);
      return;
    }

    try {
      const dbPlanetId = pid === 'ia' ? 'machinelearning' : 
                         (pid === '3d' ? 'tinkercad' : 
                         (pid === 'makecode-microbit' ? 'microbit' : pid));

      let progressData = [];
      let milestoneData = [];
      let dbChallengesRaw = [];
      let dbTutorialsRaw = [];

      if (userId === 'guest_user') {
        progressData = JSON.parse(localStorage.getItem('guest_user_challenges') || '[]');
        milestoneData = JSON.parse(localStorage.getItem('guest_explore_progress') || '[]');
        
        const [
          { data: dbCRaw },
          { data: dbTRaw }
        ] = await Promise.all([
          supabase.from('retos').select('*').eq('planet_id', dbPlanetId).order('order_index', { ascending: true }),
          supabase.from('tutoriales').select('*').eq('planet_id', dbPlanetId).order('order_index', { ascending: true })
        ]);
        dbChallengesRaw = dbCRaw;
        dbTutorialsRaw = dbTRaw;
      } else {
        const [
          { data: pData },
          { data: mData },
          { data: cRaw },
          { data: tRaw }
        ] = await Promise.all([
          supabase.from('user_challenges').select('*').eq('student_id', userId).eq('planet_id', pid),
          supabase.from('explore_progress').select('*').eq('student_id', userId).eq('planet_id', pid),
          supabase.from('retos').select('*').eq('planet_id', dbPlanetId).order('order_index', { ascending: true }),
          supabase.from('tutoriales').select('*').eq('planet_id', dbPlanetId).order('order_index', { ascending: true })
        ]);
        progressData = pData;
        milestoneData = mData;
        dbChallengesRaw = cRaw;
        dbTutorialsRaw = tRaw;
      }

      const dbChallenges = (dbChallengesRaw || []).map(c => ({
        ...c,
        metadata: typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata
      }));
      const dbTutorials = (dbTutorialsRaw || []).map(t => ({
        ...t,
        metadata: typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata
      }));

      // Map progress
      const progressMap = {};
      progressData?.forEach(p => { progressMap[p.challenge_id] = p; });
      setUserProgress(progressMap);

      const milestoneMap = {};
      milestoneData?.forEach(m => { milestoneMap[m.milestone_name] = m; });
      setMilestoneProgress(milestoneMap);

      // Population Helper
      const populateState = (setter, list, category, localFallback, level = null) => {
        // 1. Enriquecer la lista de la DB con campos consistentes
        const enrichedDB = (list || []).map(item => ({
          ...item,
          titulo: item.titulo || item.title || item.name,
          id: item.id || item.slug || item.numero || item.order_index,
          category: item.category || item.categoria || 'General'
        }));

        // 2. Filtrar DB por categoría/nivel
        const filteredDB = enrichedDB.filter(item => {
          const catMatch = !category || item.category === category;
          const levelMatch = !level || item.level === level;
          return catMatch && levelMatch;
        });

        // 3. Empezar con el localFallback como base para asegurar que NUNCA desaparezcan los retos locales
        let finalResult = (localFallback || []).map((localItem, idx) => {
          const dbMatch = filteredDB.find(db => 
            (localItem.id && (String(localItem.id) === String(db.slug) || String(localItem.id) === String(db.id))) || 
            ((localItem.titulo || localItem.title) && db.titulo && (localItem.titulo || localItem.title).toLowerCase().trim() === db.titulo.toLowerCase().trim())
          );

          if (dbMatch) {
            const isRaspberry = category?.includes('raspberry');
            const pMatch = progressData.find(p => p.challenge_id === dbMatch.id);
            
            return {
              ...dbMatch,
              titulo: (isRaspberry && localItem.titulo) ? localItem.titulo : (dbMatch.titulo || localItem.titulo),
              metadata: { 
                ...(typeof dbMatch.metadata === 'string' ? JSON.parse(dbMatch.metadata) : (dbMatch.metadata || {})),
                ...localItem
              },
              ...pMatch,
              completado: !!pMatch
            };
          }

          return {
            ...localItem,
            id: localItem.id || localItem.slug || `local-${idx}`,
            titulo: localItem.titulo || localItem.title,
            metadata: { ...localItem },
            isLocalOnly: true,
            category: category || localItem.category || 'General',
            completado: false
          };
        });

        filteredDB.forEach(db => {
          const alreadyExists = finalResult.some(r => 
            (String(r.id) === String(db.id)) || 
            ((r.titulo || r.title) && db.titulo && (r.titulo || r.title).toLowerCase().trim() === db.titulo.toLowerCase().trim())
          );

          if (!alreadyExists) {
            const pMatch = progressData.find(p => p.challenge_id === db.id);
            finalResult.push({
              ...db,
              metadata: typeof db.metadata === 'string' ? JSON.parse(db.metadata) : (db.metadata || {}),
              ...pMatch,
              completado: !!pMatch
            });
          }
        });

        // 5. Ordenar y Guardar (Filter out Socratic Tutor items as they have their own dedicated UI)
        const sortedResult = finalResult
          .filter(it => it.id !== 'socratic-tutor' && !it.isIA)
          .sort(sortFn);
        setter(sortedResult);
        return sortedResult;
      };

      if (dbChallenges.length === 0 && dbTutorials.length === 0) {
        // Full local fallback
        if (pid === 'code') {
          setChallenges(CODE_MODERN_COURSES); setCodeModern(CODE_MODERN_COURSES); setCodeHourOfCode(CODE_HOUR_OF_CODE); setCodeHourOfAI(CODE_HOUR_OF_AI);
        } else if (pid === 'html') {
          setHtmlCodeOrg(filterActive(HTML_CODE_ORG)); 
          setJsCourse(filterActive(JS_LEARN_COURSE)); 
          setFccHtml(filterActive(FCC_HTML_COURSE));
          setFccJs(filterActive(FCC_JS_COURSE));
          setRaspberryL1(filterActive(RASPBERRY_WEB_LEVEL_1)); 
          setRaspberryL2(filterActive(RASPBERRY_WEB_LEVEL_2)); 
          setExpertChallenges(filterActive(RASPBERRY_WEB_LEVEL_3)); 
          setChallenges(filterActive(HTML_CODE_ORG));
        } else if (pid === 'scratch') {
          setChallenges(ROBOTIX_CHALLENGES); setRaspberryL1(RASPBERRY_SCRATCH_L1); setRaspberryL2(RASPBERRY_SCRATCH_L2); setExpertChallenges(RASPBERRY_SCRATCH_CHALLENGES); setTutorials(SCRATCH_TUTORIALS);
        } else if (pid === 'tinkercad' || pid === '3d') {
          const c3d = TINKERCAD_3D_CHALLENGES;
          const ccb = TINKERCAD_CODEBLOCKS_CHALLENGES[difficultyLevel] || [];
          const cbc = BLOCKSCAD_CHALLENGES;
          
          setTinkercad3d(TINKERCAD_3D_ACADEMY); 
          setTinkercad3dChallenges(c3d); 
          setTinkercadCodeblocks(ccb); 
          setBlockscad(cbc);
          
          if (itinerary === 'blockscad') setChallenges(cbc);
          else setChallenges(c3d);
          
          if (itinerary === 'codeblocks') setDifficultyChallenges(TINKERCAD_CODEBLOCKS_CHALLENGES);
          else if (itinerary === 'blockscad') setDifficultyChallenges(null);
          else setDifficultyChallenges(null);
          
        } else if (pid === 'python') {
          setChallenges(PYTHON_ACADEMIA);
          setPythonRaspberryIntro(PYTHON_RASPBERRY_INTRO);
          setPythonRaspberryMore(PYTHON_RASPBERRY_MORE);
          setPythonCodingKids(PYTHON_CODING_KIDS);
          setPythonCodedexBeginner(PYTHON_CODEDEX_BEGINNER);
          setPythonCodedexIntermediate(PYTHON_CODEDEX_INTERMEDIATE);
          setPythonFreeCodeCamp(PYTHON_FREECODECAMP);
          setPythonPicuino(PYTHON_PICUINO);
        } else if (pid === 'appinventor') {
          setAppInventorBasic(APP_INVENTOR_BASIC); setAppInventorIntermediate(APP_INVENTOR_INTERMEDIATE); setAppInventorSocial(APP_INVENTOR_SOCIAL); 
          setChallenges(itinerary === 'social' ? APP_INVENTOR_SOCIAL : (itinerary === 'intermediate' ? APP_INVENTOR_INTERMEDIATE : APP_INVENTOR_BASIC));
        } else if (pid === 'ia') {
          setLearningML(ML_LEARNINGML); setMlForKids(ML_FOR_KIDS); setChallenges(ML_LEARNINGML);
        } else if (pid === 'arduino') {
          setDifficultyChallenges(ARDUINO_CHALLENGES);
          setArduinoTutorials(ARDUINO_TUTORIALS);
          setTutorials(ARDUINO_TUTORIALS);
          setArduinoBeginner(ARDUINO_CHALLENGES.beginner);
          setArduinoIntermediate(ARDUINO_CHALLENGES.intermediate);
          setArduinoAdvanced(ARDUINO_CHALLENGES.advanced);
          const currentLevelList = ARDUINO_CHALLENGES[difficultyLevel] || ARDUINO_CHALLENGES.beginner;
          setChallenges(currentLevelList);
        } else if (pid.includes('microbit')) {
          setDifficultyChallenges(MICROBIT_CHALLENGES);
          setTutorials(MICROBIT_TUTORIALS);
          setChallenges(MICROBIT_CHALLENGES.beginner);
          setMicrobitBeginner(MICROBIT_CHALLENGES.beginner);
          setMicrobitIntermediate(MICROBIT_CHALLENGES.intermediate);
          setMicrobitAdvanced(MICROBIT_CHALLENGES.advanced);
        } else if (pid === 'makecode-arcade' || pid === 'arcade') {
          setChallenges(ARCADE_CHALLENGES);
          setTutorials(ARCADE_TUTORIALS);
        } else if (pid === 'sql') {
          setChallenges(SQL_BEGINNER);
          setSqlBeginner(SQL_BEGINNER);
          setSqlIntermediate(SQL_INTERMEDIATE);
          setSqlAdvanced(SQL_ADVANCED);
        }
      } else {
        // Map based on Planet
        if (pid === 'makecode-microbit' || pid === 'microbit') {
          populateState(setMicrobitBeginner, dbChallenges, 'microbit-beginner', MICROBIT_CHALLENGES.beginner);
          populateState(setMicrobitIntermediate, dbChallenges, 'microbit-intermediate', MICROBIT_CHALLENGES.intermediate);
          populateState(setMicrobitAdvanced, dbChallenges, 'microbit-advanced', MICROBIT_CHALLENGES.advanced);
          populateState(setTutorials, dbTutorials, 'microbit-tutorial', MICROBIT_TUTORIALS);
        } else if (pid === 'makecode-arcade' || pid === 'arcade') {
          populateState(setChallenges, dbChallenges, 'arcade-challenges', ARCADE_CHALLENGES);
          populateState(setTutorials, dbTutorials, 'arcade-tutorial', ARCADE_TUTORIALS);
        } else if (pid === 'scratch') {
          populateState(setChallenges, dbChallenges, 'robotix', ROBOTIX_CHALLENGES);
          populateState(setRaspberryL1, dbChallenges, 'raspberry-l1', RASPBERRY_SCRATCH_L1);
          populateState(setRaspberryL2, dbChallenges, 'raspberry-l2', RASPBERRY_SCRATCH_L2);
          populateState(setExpertChallenges, dbChallenges, 'raspberry-l3', RASPBERRY_SCRATCH_CHALLENGES);
          populateState(setTutorials, dbTutorials, null, SCRATCH_TUTORIALS);
        } else if (pid === 'tinkercad' || pid === '3d') {
          const list3d = populateState(setTinkercad3dChallenges, dbChallenges, '3d-design', TINKERCAD_3D_CHALLENGES);
          const listBc = populateState(setBlockscad, dbChallenges, 'blockscad', BLOCKSCAD_CHALLENGES);
          
          if (itinerary === 'blockscad') {
            setChallenges(listBc);
          } else {
            setChallenges(list3d);
          }
          
          setDifficultyChallenges(null);
          setTutorials([]);
        } else if (pid === 'python') {
          populateState(setPythonSilent, dbChallenges, 'silent-teacher', PYTHON_ACADEMIA);
          populateState(setPythonAcademia, dbChallenges, 'academia', []);
          populateState(setPythonRetos, dbChallenges, 'retos', []);
          populateState(setPythonRaspberryIntro, dbChallenges, 'raspberry-intro', PYTHON_RASPBERRY_INTRO);
          populateState(setPythonRaspberryMore, dbChallenges, 'raspberry-more', PYTHON_RASPBERRY_MORE);
          populateState(setPythonCodingKids, dbChallenges, 'coding-for-kids', PYTHON_CODING_KIDS);
          populateState(setPythonCodedexBeginner, dbChallenges, 'codedex', PYTHON_CODEDEX_BEGINNER, 'beginner');
          populateState(setPythonCodedexIntermediate, dbChallenges, 'codedex', PYTHON_CODEDEX_INTERMEDIATE, 'intermediate');
          populateState(setPythonFreeCodeCamp, dbChallenges, 'freecodecamp', PYTHON_FREECODECAMP);
          populateState(setPythonPicuino, dbChallenges, 'picuino', PYTHON_PICUINO);
          setChallenges(PYTHON_ACADEMIA); // Fallback generic list
        } else if (pid === 'appinventor') {
          const academia = populateState(setAppInventorAcademia, dbChallenges, 'academia', APP_INVENTOR_ACADEMIA);
          const social = populateState(setAppInventorSocial, dbChallenges, 'social', APP_INVENTOR_SOCIAL);
          setChallenges(itinerary === 'social' ? social : academia);
        } else if (pid === 'sql') {
          populateState(setSqlBeginner, dbChallenges, 'sql-beginner', SQL_BEGINNER);
          populateState(setSqlIntermediate, dbChallenges, 'sql-intermediate', SQL_INTERMEDIATE);
          populateState(setSqlAdvanced, dbChallenges, 'sql-advanced', SQL_ADVANCED);
          populateState(setChallenges, dbChallenges, 'sql-beginner', SQL_BEGINNER);
        } else if (pid === 'ia') {
          populateState(setLearningML, dbChallenges, 'learningml', ML_LEARNINGML);
          populateState(setMlForKids, dbChallenges, 'mlforkids', ML_FOR_KIDS);
        } else if (pid === 'arduino') {
          setDifficultyChallenges(ARDUINO_CHALLENGES);
          populateState(setArduinoTutorials, dbTutorials, 'arduino-tutorial', ARDUINO_TUTORIALS);
          populateState(setTutorials, dbTutorials, 'arduino-tutorial', ARDUINO_TUTORIALS);
          populateState(setArduinoBeginner, dbChallenges, 'arduino-beginner', ARDUINO_CHALLENGES.beginner, 'beginner');
          populateState(setArduinoIntermediate, dbChallenges, 'arduino-intermediate', ARDUINO_CHALLENGES.intermediate, 'intermediate');
          populateState(setArduinoAdvanced, dbChallenges, 'arduino-advanced', ARDUINO_CHALLENGES.advanced, 'advanced');
          const currentLevelList = ARDUINO_CHALLENGES[difficultyLevel] || ARDUINO_CHALLENGES.beginner;
          populateState(setChallenges, dbChallenges, 'arduino-beginner', currentLevelList, difficultyLevel);
        } else if (pid === 'makecode-arcade' || pid === 'arcade') {
          populateState(setChallenges, dbChallenges, 'arcade-challenges', ARCADE_CHALLENGES);
          populateState(setTutorials, dbTutorials, 'arcade-tutorial', ARCADE_TUTORIALS);
        } else {
          populateState(setChallenges, dbChallenges, null, challenges);
          populateState(setTutorials, dbTutorials, null, tutorialsList);
        }
      }
    } catch (err) {
      console.error("Error loading DojoFlow data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeUrl = (item, tab) => {
    if (!item) return '#';
    const pid = (planetId || '').toLowerCase();
    
    // 1. Prioridad absoluta: externalUrl en metadata
    const meta = item.metadata || {};
    const detectedSlug = item.slug || meta.id || (typeof item.id === 'string' && item.id.length < 30 ? item.id : null);

    const externalUrl = meta.externalUrl || meta.external_url || item.externalUrl || item.external_url || meta.url || meta.url_guide;
    if (externalUrl) return externalUrl;

    // 2. Raspberry Pi Projects (Scratch / Python / HTML)
    const itemCategory = item.category || '';
    const isRaspberryItem = itemCategory.includes('raspberry') || pid.includes('raspberry') || tab?.includes('raspberry') || tab === 'expert' || tab?.startsWith('scratch_raspberry');
    
    if ((pid.includes('scratch') || pid.includes('raspberry') || pid === 'html' || pid === 'python') && isRaspberryItem) {
      const slugToUse = item.id || item.slug || meta.id;
      if (slugToUse && typeof slugToUse === 'string' && slugToUse.length > 3) {
         // Limpieza agresiva de prefijos
         const cleanSlug = slugToUse.replace(/^raspberry-/, '').replace(/^scratch-/, '').replace(/^python-/, '').replace(/^html-/, '');
         // Forzamos es-ES para proyectos de Raspberry Pi
         return `https://projects.raspberrypi.org/es-ES/projects/${cleanSlug}`;
      }
    }
    
    // 3. Microbit Projects
    if (pid.includes('microbit')) {
      if (detectedSlug && typeof detectedSlug === 'string') {
        // Si parece un share code de MakeCode (ej: _12345)
        if (detectedSlug.startsWith('_') || (detectedSlug.length >= 12 && !detectedSlug.includes('-'))) {
          return `https://makecode.microbit.org/${detectedSlug.startsWith('_') ? '' : '_'}${detectedSlug}`;
        }
        // Si es un tutorial de MakeCode
        if (tab?.startsWith('tutorials')) {
           return `https://makecode.microbit.org/#tutorial:/projects/${detectedSlug}`;
        }
        // Reto estándar en microbit.org
        const cleanMbSlug = detectedSlug.toLowerCase().replace(/^mb-/, '');
        return `https://microbit.org/projects/make-it-code-it/${cleanMbSlug}/?lang=es`;
      }
      return 'https://makecode.microbit.org/';
    }

    // 4. Scratch Planet (Standard Robotix / Academia)
    if (pid === 'scratch' && !isRaspberryItem) {
      if (detectedSlug && detectedSlug.length > 3) {
        return `https://scratch.mit.edu/projects/${detectedSlug}/editor`;
      }
      return 'https://scratch.mit.edu/projects/editor';
    }

    // 5. MakeCode Arcade
    if (pid === 'makecode-arcade') {
      if (tab?.startsWith('tutorials')) {
        return `https://arcade.makecode.com/#tutorial:${detectedSlug}`;
      }
      if (detectedSlug) return `https://arcade.makecode.com/${detectedSlug.startsWith('_') ? '' : '_'}${detectedSlug}`;
      return 'https://arcade.makecode.com/';
    }

    // 6. Tinkercad
    if (pid?.startsWith('tinkercad') || pid === '3d') {
      if (item.url) return item.url;
      if (itinerary === 'codeblocks') return "https://www.tinkercad.com/codeblocks";
      return "https://www.tinkercad.com/dashboard";
    }
    
    // 7. Fallbacks generales
    if (item.url_guide) return item.url_guide;
    if (item.url_sandbox) return item.url_sandbox;
    if (item.url) return item.url;
    if (item.editorUrl) return item.editorUrl;
    if (item.link) return item.link;
    
    return '#';
  };

  const handleAction = async (challenge, type = 'challenge') => {
    // IMPORTANTE: Para mantener compatibilidad con el progreso guardado, 
    // usamos order_index si es un número original, o el id si es UUID
    const originalId = challenge.order_index || challenge.id;
    const idSuffix = type === 'tutorial' ? `tutorial-${originalId}` : `reto-${originalId}`;
    const challengeId = `${planetId}${itinerary ? '-' + itinerary : ''}-${idSuffix}`;
    const currentStatus = userProgress[challengeId]?.status || 'No iniciado';

    if (currentStatus === 'Validado') return;
    // Determine the URL to open
    let urlToOpen = '';
    if (type === 'open_only' || type === 'open_submit' || type === 'tutorial') {
      urlToOpen = getChallengeUrl(challenge, activeTab);
    }

    if (type === 'open_only' && urlToOpen) {
      window.open(urlToOpen, '_blank');
      return;
    }

    if (!userId) {
      alert("Debes iniciar sesión para guardar tu progreso.");
      return;
    }

    // La evidencia es obligatoria (URL o Archivo) para todos.
    if (!evidenceUrl && !evidenceFile) {
      alert("Por favor, pega el enlace de tu proyecto o adjunta un archivo para poder validar el reto.");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedFileUrl = null;
      
      if (userId === 'guest_user') {
        if (evidenceFile) {
          uploadedFileUrl = URL.createObjectURL(evidenceFile);
        }
        
        const guestChallenges = JSON.parse(localStorage.getItem('guest_user_challenges') || '[]');
        const existingIdx = guestChallenges.findIndex(c => c.challenge_id === challengeId);
        const newChallenge = {
          student_id: userId,
          planet_id: planetId,
          challenge_id: challengeId,
          status: 'En revisión',
          evidence_url: evidenceUrl,
          evidence_file_url: uploadedFileUrl || userProgress[challengeId]?.evidence_file_url,
          updated_at: new Date().toISOString()
        };
        
        if (existingIdx >= 0) {
          guestChallenges[existingIdx] = newChallenge;
        } else {
          guestChallenges.push(newChallenge);
        }
        
        localStorage.setItem('guest_user_challenges', JSON.stringify(guestChallenges));
      } else {
        if (evidenceFile) {
          const fileExt = evidenceFile.name.split('.').pop();
          const fileName = `${userId}/${challengeId}_${Date.now()}.${fileExt}`;
          const filePath = `evidences/${fileName}`;

          const { error: storageError } = await supabase.storage
            .from('dojoflow-assets')
            .upload(filePath, evidenceFile);

          if (storageError) throw storageError;

          const { data: { publicUrl } } = supabase.storage
            .from('dojoflow-assets')
            .getPublicUrl(filePath);
          
          uploadedFileUrl = publicUrl;
        }

        const { error: upsertError } = await supabase
          .from('user_challenges')
          .upsert({
            student_id: userId,
            planet_id: planetId,
            challenge_id: challengeId,
            status: 'En revisión',
            evidence_url: evidenceUrl,
            evidence_file_url: uploadedFileUrl || userProgress[challengeId]?.evidence_file_url,
            challenge_name: itinerary === 'mlforkids' ? mlfkChallengeName : null,
            difficulty: itinerary === 'mlforkids' ? mlfkDifficulty : null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'student_id, challenge_id' });

        if (upsertError) throw upsertError;
      }

      // Notificar al padre para iniciar validación socrática o aviso de profesor
      if (onValidateChallenge) {
        onValidateChallenge(challenge, evidenceUrl, challengeId, uploadedFileUrl || userProgress[challengeId]?.evidence_file_url);
      }

      await loadData();
      setSelectedTutorial(null); // Cerrar modal de reto o tutorial
      setEvidenceUrl('');
      setEvidenceFile(null);
      setMlfkChallengeName('');
      setMlfkDifficulty('');
    } catch (err) {
      console.error("Error submitting challenge:", err);
      alert("Error al enviar el reto. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusIcon = (status, size = 18) => {
    switch (status) {
      case 'Validado': return <Star size={size} fill="#FFD700" color="#FFD700" />;
      case 'En revisión': return <Clock size={size} color="#ff9800" />;
      case 'Corregir': return <XCircle size={size} color="#ff4b4b" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Loader2 className="animate-spin" size={32} color={accentColor} style={{ margin: '0 auto 10px' }} />
        <p style={{ fontSize: '0.8rem', color: '#888' }}>Sincronizando con el Orquestador...</p>
      </div>
    );
  }
  
  const tutorialsList = tutorials || [];
  const tutorialsCompleted = tutorialsList.filter(t => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-tutorial-${t.id || t.order_index}`]?.status === 'Validado').length;
  
  // difficultyChallenges is now a state variable set in loadData()
  
  // Calculate total challenges for this planet/itinerary
  const totalChallengesCount = difficultyChallenges ? (Object.values(difficultyChallenges).flat().length) : challenges.length;
  const difficultyProgress = difficultyChallenges ? {
    beginner: difficultyChallenges.beginner.filter(c => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-reto-${c.id || c.numero}`]?.status === 'Validado').length,
    intermediate: difficultyChallenges.intermediate.filter(c => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-reto-${c.id || c.numero}`]?.status === 'Validado').length,
    advanced: difficultyChallenges.advanced.filter(c => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-reto-${c.id || c.numero}`]?.status === 'Validado').length
  } : null;

  const challengesCompleted = challenges.filter(c => userProgress[`${pid}${itinerary ? '-' + itinerary : ''}-reto-${c.id || c.numero}`]?.status === 'Validado').length;
  const expertChallengesCompleted = expertChallenges.filter(c => userProgress[`${pid}-reto-${c.id || c.numero}`]?.status === 'Validado').length;
  const l1Completed = raspberryL1.filter(c => userProgress[`${pid}-reto-${c.id || c.numero}`]?.status === 'Validado').length;
  const l2Completed = raspberryL2.filter(c => userProgress[`${pid}-reto-${c.id || c.numero}`]?.status === 'Validado').length;
  
  const codeModernCompleted = codeModern.filter(c => userProgress[`${pid}-reto-modern-${c.id}`]?.status === 'Validado').length;
  const codeHourOfCodeCompleted = codeHourOfCode.filter(c => userProgress[`${pid}-reto-hoc-${c.id}`]?.status === 'Validado').length;
  const codeHourOfAICompleted = codeHourOfAI.filter(c => userProgress[`${pid}-reto-ai-${c.id}`]?.status === 'Validado').length;

  const pythonSilentCompleted = pythonSilent.filter(c => userProgress[`${pid}-academy-reto-${c.id}`]?.status === 'Validado').length;
  const pythonAcademiaCompleted = pythonAcademia.filter(c => userProgress[`${pid}-academy-reto-${c.id}`]?.status === 'Validado').length;
  const pythonRetosCompleted = pythonRetos.filter(c => userProgress[`${pid}-academy-reto-${c.id}`]?.status === 'Validado').length;
  const pythonRaspberryIntroCompleted = pythonRaspberryIntro.filter(c => userProgress[`${pid}-raspberry-reto-${c.id}`]?.status === 'Validado').length;
  const pythonRaspberryMoreCompleted = pythonRaspberryMore.filter(c => userProgress[`${pid}-raspberry-reto-${c.id}`]?.status === 'Validado').length;
  const pythonCodingKidsCompleted = pythonCodingKids.filter(c => userProgress[`${pid}-others-reto-${c.id}`]?.status === 'Validado' || userProgress[`${pid}-kids-reto-${c.id}`]?.status === 'Validado').length;
  const pythonCodedexBeginnerCompleted = pythonCodedexBeginner.filter(c => userProgress[`${pid}-codedex-reto-${c.id}`]?.status === 'Validado').length;
  const pythonCodedexIntermediateCompleted = pythonCodedexIntermediate.filter(c => userProgress[`${pid}-codedex-reto-${c.id}`]?.status === 'Validado').length;
  const pythonFreeCodeCampCompleted = pythonFreeCodeCamp.filter(c => userProgress[`${pid}-others-reto-${c.id}`]?.status === 'Validado' || userProgress[`${pid}-freecodecamp-reto-${c.id}`]?.status === 'Validado').length;
  const pythonPicuinoCompleted = pythonPicuino.filter(c => userProgress[`${pid}-picuino-reto-${c.id}`]?.status === 'Validado').length;
  const appInventorAcademiaCompleted = appInventorAcademia.filter(c => userProgress[`${pid}-reto-${c.id}`]?.status === 'Validado' || userProgress[`${pid}-academia-reto-${c.id}`]?.status === 'Validado' || userProgress[`${pid}-basic-reto-${c.id}`]?.status === 'Validado' || userProgress[`${pid}-intermediate-reto-${c.id}`]?.status === 'Validado').length;
  const appInventorSocialCompleted = appInventorSocial.filter(c => userProgress[`${pid}-social-reto-${c.id}`]?.status === 'Validado').length;

  const htmlCodeOrgCompleted = htmlCodeOrg.filter(c => userProgress[`${pid}-reto-${c.id}`]?.status === 'Validado').length;
  const jsCourseCompleted = jsCourse.filter(c => userProgress[`${pid}-js-reto-${c.id}`]?.status === 'Validado').length;
  const fccHtmlCompleted = fccHtml.filter(c => userProgress[`${pid}-reto-${c.id}`]?.status === 'Validado').length;
  const fccJsCompleted = fccJs.filter(c => userProgress[`${pid}-reto-${c.id}`]?.status === 'Validado').length;


  const iaLearningMLCompleted = challenges.filter(c => userProgress[`ia-reto-${c.id || c.order_index}`]?.status === 'Validado' || userProgress[`ia-learningml-reto-${c.id || c.order_index}`]?.status === 'Validado').length;
  const iaMlfkCompleted = mlForKids.filter(c => userProgress[`ia-mlforkids-reto-${c.id || c.order_index}`]?.status === 'Validado').length;

  const milestoneDivisor = (pid === 'tinkercad' && itinerary === 'codeblocks') ? 5 : (pid === 'makecode-arcade' ? 3 : 10);
  
  // Logic for custom badges/insignias
  let activeMilestones = [];
  if (pid === 'scratch') {
    // Big Milestone Badges for Scratch
    activeMilestones = [
      { reached: tutorialsCompleted >= tutorialsList.length && tutorialsList.length > 0, label: 'ACADEMIA SCRATCH', total: tutorialsList.length, type: 'big' },
      { reached: challengesCompleted >= challenges.length && challenges.length > 0, label: 'RETOS ROBOTIX', total: challenges.length, type: 'big' },
      { reached: l1Completed >= raspberryL1.length && raspberryL1.length > 0, label: 'RASPBERRY L1', total: raspberryL1.length, type: 'big' },
      { reached: l2Completed >= raspberryL2.length && raspberryL2.length > 0, label: 'RASPBERRY L2', total: raspberryL2.length, type: 'big' },
      { reached: expertChallengesCompleted >= expertChallenges.length && expertChallenges.length > 0, label: 'RASPBERRY L3', total: expertChallenges.length, type: 'big' }
    ];
  } else if (pid === 'html') {
    activeMilestones = [
      { reached: htmlCodeOrgCompleted >= htmlCodeOrg.length && htmlCodeOrg.length > 0, label: 'ACADEMIA CODE.ORG', total: htmlCodeOrg.length, type: 'big' },
      { reached: (l1Completed + l2Completed + expertChallengesCompleted) >= (raspberryL1.length + raspberryL2.length + expertChallenges.length) && (raspberryL1.length + raspberryL2.length + expertChallenges.length) > 0, label: 'RASPBERRY PI', total: (raspberryL1.length + raspberryL2.length + expertChallenges.length), type: 'big' }
    ];
  } else if (pid === 'tinkercad') {
    if (itinerary === 'codeblocks') {
      activeMilestones = [
        { reached: challengesCompleted >= challenges.length && challenges.length > 0, label: 'COMPLETO', total: challenges.length }
      ];
    } else if (itinerary === 'blockscad') {
      activeMilestones = [
        { reached: difficultyProgress?.beginner === 3, label: 'PRINCIPIANTE', total: 3 },
        { reached: difficultyProgress?.advanced === 11, label: 'AVANZADO', total: 11 }
      ];
    } else { // 3D Design
      activeMilestones = [
        { reached: tutorialsCompleted === 12, label: 'ACADEMIA', total: 12 },
        { reached: difficultyProgress?.beginner === 13, label: 'PRINCIPIANTE', total: 13 },
        { reached: difficultyProgress?.intermediate === 10, label: 'INTERMEDIO', total: 10 },
        { reached: difficultyProgress?.advanced === 10, label: 'AVANZADO', total: 10 }
      ];
    }
  } else if (planetId?.toLowerCase().includes('microbit')) {
    activeMilestones = [
      { reached: challengesCompleted >= 57, label: 'PRINCIPIANTE PRO', total: 57, type: 'big' },
      { reached: l1Completed >= 47, label: 'INTERMEDIO PRO', total: 47, type: 'big' },
      { reached: l2Completed >= 19, label: 'AVANZADO PRO', total: 19, type: 'big' }
    ];
  } else if (planetId === 'makecode-arcade') {
    activeMilestones = [
      { reached: tutorialsCompleted >= 15, label: 'ACADEMIA COMPLETA', total: 15, type: 'big' },
      { reached: challengesCompleted >= 18, label: 'WE TEACH ROBOTICS', total: 18, type: 'big' }
    ];
  } else if (planetId === 'code') {
    activeMilestones = [
      { reached: codeModernCompleted >= 5, label: 'MODERN COURSES', total: 5, type: 'big' },
      { reached: codeHourOfCodeCompleted >= 22, label: 'HOUR OF CODE', total: 22, type: 'big' },
      { reached: codeHourOfAICompleted >= 1, label: 'IA EXPLORER', total: 1, type: 'big' }
    ];
  } else if (planetId === 'python') {
    if (itinerary === 'academy' || !itinerary) {
      activeMilestones = [
        { reached: pythonSilentCompleted >= pythonSilent.length && pythonSilent.length > 0, label: 'SILENT TEACHER', total: pythonSilent.length, type: 'big' }
      ];
    } else if (itinerary === 'codedex') {
      activeMilestones = [
        { reached: pythonCodedexBeginnerCompleted >= 1, label: 'PRINCIPIANTE', total: 1, type: 'big' },
        { reached: pythonCodedexIntermediateCompleted >= 2, label: 'INTERMEDIO', total: 2, type: 'big' }
      ];
    } else if (itinerary === 'raspberry') {
      activeMilestones = [
        { reached: pythonRaspberryIntroCompleted >= 6, label: 'PI PRINCIPIANTE', total: 6, type: 'big' },
        { reached: pythonRaspberryMoreCompleted >= 6, label: 'PI INTERMEDIO', total: 6, type: 'big' }
      ];
    } else if (itinerary === 'kids') {
      activeMilestones = [
        { reached: pythonCodingKidsCompleted >= 1, label: 'COMPLETO', total: 1, type: 'big' }
      ];
    } else if (itinerary === 'freecodecamp') {
      activeMilestones = [
        { reached: pythonFreeCodeCampCompleted >= 1, label: 'COMPLETO', total: 1, type: 'big' }
      ];
    } else if (itinerary === 'picuino') {
      activeMilestones = [
        { reached: pythonPicuinoCompleted >= 35, label: 'PICUINO PRO', total: 35, type: 'big' }
      ];
    }
  } else if (planetId === 'arduino') {
    activeMilestones = [
      { reached: difficultyProgress?.beginner >= 5, label: 'PRINCIPIANTE', total: 5, type: 'big' },
      { reached: difficultyProgress?.intermediate >= 24, label: 'INTERMEDIO', total: 24, type: 'big' },
      { reached: difficultyProgress?.advanced >= 42, label: 'AVANZADO', total: 42, type: 'big' }
    ];
  } else if (planetId === 'ia') {
    activeMilestones = [
      { reached: iaLearningMLCompleted >= 6, label: 'LEARNINGML', total: 6, type: 'big' },
      { reached: iaMlfkCompleted >= 1, label: 'MLFK COMPLETO', total: 1, type: 'big' }
    ];
  } else if (planetId === 'appinventor') {
    activeMilestones = [
      { reached: appInventorAcademiaCompleted >= 15, label: 'ACADEMIA', total: 15, type: 'big' },
      { reached: appInventorSocialCompleted >= 3, label: 'SOCIAL ENTERPRISE', total: 3, type: 'big' }
    ];
  } else if (pid === 'html') {
    activeMilestones = [
      { reached: htmlCodeOrgCompleted >= 21, label: 'ACADEMIA CODE.ORG', total: 21, type: 'big' },
      { reached: l1Completed >= 11, label: 'WEB RASPBERRY L1', total: 11, type: 'big' },
      { reached: l2Completed >= 10, label: 'WEB RASPBERRY L2', total: 10, type: 'big' },
      { reached: expertChallengesCompleted >= 6, label: 'WEB RASPBERRY L3', total: 6, type: 'big' },
      { reached: jsCourseCompleted >= 1, label: 'JS COMPLETADO', total: 1, type: 'big' }
    ];
  } else {
    // Default 8-milestone logic for other planets
    for (let i = 0; i < 8; i++) {
       const reached = Math.floor((challengesCompleted + expertChallengesCompleted + l1Completed + l2Completed) / milestoneDivisor) > i;
       activeMilestones.push({ reached, label: (i+1)*milestoneDivisor });
    }
  }
  const isAdvanced = targetLevel && targetLevel.toLowerCase() !== 'novato' && targetLevel.toLowerCase() !== 'junior';

  const tutorialsByCategory = tutorialsList.reduce((acc, t) => {
    const cat = t.categoria || t.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});
  
  const hasLevelBadge = pid === 'scratch' ? (tutorialsCompleted === 27) : 
                        (pid === 'makecode-arcade' ? (challengesCompleted > 0) : 
                        (pid.includes('microbit') ? (challengesCompleted + l1Completed + l2Completed > 0) :
                        (pid === 'appinventor' ? (appInventorAcademiaCompleted > 0) :
                        (difficultyProgress && difficultyProgress.beginner > 0))));

  const arcadeRank = pid === 'makecode-arcade' ? (
    challengesCompleted >= 16 ? { label: 'GAME MASTER', color: '#6c5ce7', icon: '👑' } :
    challengesCompleted >= 12 ? { label: 'LEAD DESIGNER', color: '#e84118', icon: '🏆' } :
    challengesCompleted >= 8 ? { label: 'GAME ARCHITECT', color: '#0097e6', icon: '⚔️' } :
    challengesCompleted >= 4 ? { label: 'CODER', color: '#4cd137', icon: '🌱' } :
    { label: 'AMATEUR', color: '#636e72', icon: '🎮' }
  ) : null;

  const difficultyRank = difficultyProgress ? (
    difficultyProgress.advanced > 0 ? { label: 'AVANZADO', color: '#e84118', icon: '🏆' } :
    difficultyProgress.intermediate > 0 ? { label: 'INTERMEDIO', color: '#0097e6', icon: '⚔️' } :
    difficultyProgress.beginner > 0 ? { label: 'PRINCIPIANTE', color: '#4cd137', icon: '🌱' } :
    null
  ) : null;

  const currentRank = pid === 'makecode-arcade' ? arcadeRank : difficultyRank;

  const renderChallengeCard = (item, isTutorialTab, index) => {
    const isUglyId = (id) => typeof id === 'string' && (id.length > 6 || id.includes('-'));
    
    // Prioridad: numero -> order_index -> index (si el ID es feo) -> ID
    const num = item.numero || item.order_index || (isUglyId(item.id) ? (index !== undefined ? index + 1 : '') : item.id);
    const idSuffix = isTutorialTab ? `tutorial-${item.id}` : `reto-${item.id || item.numero}`;
    let challengeId = `${pid}${itinerary ? '-' + itinerary : ''}-${idSuffix}`;
    let fallbackId = !isTutorialTab && item.id ? `${pid}${itinerary ? '-' + itinerary : ''}-reto-${item.numero}` : null;
    
    // Especial para code.org
    if (pid === 'code') {
      if (activeTab === 'cursos_modernos') challengeId = `${pid}-reto-modern-${item.id}`;
      if (activeTab === 'hora_codigo') challengeId = `${pid}-reto-hoc-${item.id}`;
      if (activeTab === 'hour_of_ai') challengeId = `${pid}-reto-ai-${item.id}`;
    }

    if (pid === 'python') {
      if (itinerary === 'codedex') {
        const levelCode = activeTab === 'codedex_beginner' ? 'beg' : (activeTab === 'codedex_intermediate' ? 'int' : 'adv');
        challengeId = `${planetId}-reto-codedex-${levelCode}-${item.id}`;
      } else {
        challengeId = `${pid}-${itinerary}-reto-${item.id}`;
      }
    }

    const currentProgress = userProgress[challengeId] || (fallbackId ? userProgress[fallbackId] : null);
    const status = currentProgress?.status || 'No iniciado';
    const isSelected = selectedTutorial ? (isTutorialTab ? selectedTutorial.id === item.id : selectedTutorial.numero === item.numero) : false;
    
    if (item.isAssessment) {
      return (
        <div 
          key={`assessment-card-${pid}`}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              const event = new CustomEvent('open_diagnostic_test', { detail: { planetId: pid } });
              window.dispatchEvent(event);
            }
          }}
          style={{ 
            gridColumn: '1 / -1',
            padding: '40px 30px',
            borderRadius: '24px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8E3C 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(255,107,0,0.4)',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(255,255,255,0.3)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(255,107,0,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,107,0,0.4)'; }}
        >
          <div style={{ background: 'white', borderRadius: '50%', padding: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
            <ClipboardCheck size={40} color="#FF6B00" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, fontFamily: 'Outfit' }}>🛡️ EVALUACIÓN DE SELECCIÓN NINJA</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.95, maxWidth: '400px', margin: 0 }}>
            Para desbloquear tu entrenamiento personalizado y activar al **Sensei IA**, primero debemos conocer tus habilidades. 
            ¡Haz clic aquí para empezar el desafío!
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.4)' }}>
            EMPEZAR PRUEBA AHORA
          </div>
        </div>
      );
    }

    if (item.id === 'socratic-tutor' || item.isIA) {
      // Ocultar el tutor IA del planeta Code/Scratch si el diagnóstico no está hecho
      // Ocultar el tutor IA si el diagnóstico no está hecho (solo para planetas con diagnóstico)
      if (['code', 'scratch', 'microbit', 'arcade', 'makecode-arcade', 'arduino'].includes(pid) && !assessmentCompleted) {
        return null;
      }
      return (
        <div 
          key={`ia-tutor-${num}`}
          onClick={() => setSelectedTutorial(item)}
          className="group"
          style={{ 
            aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '24px', cursor: 'pointer', 
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            border: isSelected ? '4px solid white' : '2px solid rgba(255,255,255,0.5)',
            position: 'relative', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isSelected ? '0 15px 35px rgba(0, 242, 254, 0.6)' : '0 8px 25px rgba(79, 172, 254, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '15px', position: 'relative', zIndex: 1 }}>
             <div style={{ 
              background: 'white', borderRadius: '12px', padding: '8px', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '5px'
            }}>
              <Brain size={28} color="#4facfe" />
            </div>
            <span style={{ 
              fontSize: '0.75rem', fontWeight: '900', 
              color: 'white',
              textAlign: 'center', textTransform: 'uppercase', lineHeight: '1.2'
            }}>IA TUTOR</span>
            <div style={{ 
              background: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: '20px',
              fontSize: '0.5rem', fontWeight: 'bold', color: 'white'
            }}>ACTIVO</div>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={`${isTutorialTab ? 'tut' : 'chal'}-${num}`}
        onClick={() => setSelectedTutorial(item)}
        style={{ 
          aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '16px', cursor: 'pointer', 
          border: isSelected 
            ? `3px solid ${accentColor}` 
            : (status === 'Validado' 
                ? '2px solid #22c55e' 
                : (status === 'En revisión' 
                    ? '1.5px solid #f59e0b' 
                    : (status === 'Corregir' 
                        ? '1.5px solid #ef4444' 
                        : '1px solid rgba(0,0,0,0.08)'))),
          background: status === 'Validado' 
            ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
            : (status === 'En revisión' 
                ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' 
                : (status === 'Corregir' 
                    ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' 
                    : 'white')),
          position: 'relative', transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          transform: isSelected ? 'scale(1.08)' : 'scale(1)',
          boxShadow: isSelected 
            ? `0 10px 25px ${accentColor}30` 
            : (status === 'Validado' 
                ? '0 4px 15px rgba(34, 197, 94, 0.18)' 
                : (status === 'En revisión'
                    ? '0 4px 12px rgba(245, 158, 11, 0.12)'
                    : (status === 'Corregir'
                        ? '0 4px 12px rgba(239, 68, 68, 0.12)'
                        : '0 4px 12px rgba(0,0,0,0.05)'))),
          overflow: 'hidden'
        }}
      >
        {status === 'Validado' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
            color: 'white',
            fontSize: '0.48rem',
            fontWeight: '900',
            padding: '3px 8px 3px 6px',
            borderRadius: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
            zIndex: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Star size={8} fill="white" color="white" />
            <span>HECHO</span>
          </div>
        )}

        {status === 'En revisión' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            fontSize: '0.48rem',
            fontWeight: '900',
            padding: '3px 8px 3px 6px',
            borderRadius: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
            zIndex: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Clock size={8} color="white" />
            <span>ESPERA</span>
          </div>
        )}

        {status === 'Corregir' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontSize: '0.48rem',
            fontWeight: '900',
            padding: '3px 8px 3px 6px',
            borderRadius: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
            zIndex: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <XCircle size={8} color="white" />
            <span>AJUSTAR</span>
          </div>
        )}

        {pid === 'html' && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.05, transform: 'rotate(15deg)', pointerEvents: 'none' }}>
            <Code size={40} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px', position: 'relative', zIndex: 1 }}>
          <span style={{ 
            fontSize: '1.2rem', fontWeight: '900', 
            color: isSelected 
              ? (status === 'Validado' ? '#16a34a' : accentColor) 
              : (status === 'Validado' 
                  ? '#16a34a' 
                  : (status === 'Corregir' 
                      ? '#ef4444' 
                      : (status === 'En revisión' 
                          ? '#d97706' 
                          : accentColor))), 
            marginBottom: '4px' 
          }}>{num}</span>
          <span style={{ 
            fontSize: '0.6rem', fontWeight: '800', 
            color: isSelected 
              ? (status === 'Validado' ? '#15803d' : '#1e293b') 
              : (status === 'Validado' 
                  ? '#15803d' 
                  : (status === 'Corregir' 
                      ? '#b91c1c' 
                      : (status === 'En revisión' 
                          ? '#b45309' 
                          : '#475569'))),
            textAlign: 'center', textTransform: 'uppercase', lineHeight: '1.2',
            maxWidth: '100%'
          }}>{(item.titulo || item.title)?.length > 25 ? (item.titulo || item.title).substring(0, 22) + '...' : (item.titulo || item.title)}</span>
        </div>
        {status !== 'No iniciado' && (
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 2 }}>
            {renderStatusIcon(status, 14)}
          </div>
        )}
      </div>
    );
  };

  const getActiveList = () => {
    // 1. Tutorials/Academia logic
    if (activeTab === 'tutorials' || activeTab === 'scratch_academia') {
      if (pid === 'arduino') return arduinoTutorials;
      // Especial Tinkercad
      if (pid === 'tinkercad' || pid === '3d') {
        if (itinerary === 'codeblocks') return tinkercadCodeblocksTutorials;
        if (itinerary === 'blockscad') return blockscadTutorials;
        return tinkercad3d;
      }
      if (pid === 'scratch') return tutorials;
      if (pid === 'html') return htmlCodeOrg;
      if (pid === 'python') return pythonAcademia;
      if (pid === 'ia') return mlLearningML;
      return tutorials; 
    }
    
    // 2. Tinkercad specific challenges - Unified flat list
    if (pid === 'tinkercad' || pid === '3d') {
      return challenges;
    }

    // 3. Planet-specific tab mapping
    const tabMapping = {
      // Code Planet
      'cursos_modernos': codeModern,
      'hora_codigo': codeHourOfCode,
      'hora_del_codigo': codeHourOfCode,
      'hour_of_ai': codeHourOfAI,
      'ia_explorer': codeHourOfAI,
      
      // Scratch Planet
      'scratch_robotix': challenges, // populated with ROBOTIX_CHALLENGES
      'scratch_raspberry_l1': raspberryL1, // populated with RASPBERRY_SCRATCH_L1
      'scratch_raspberry_l2': raspberryL2, // populated with RASPBERRY_SCRATCH_L2
      'scratch_raspberry_l3': expertChallenges, // populated with RASPBERRY_SCRATCH_CHALLENGES
      
      // Arduino Planet
      'arduino_beginner': arduinoBeginner,
      'arduino_intermediate': arduinoIntermediate,
      'arduino_advanced': arduinoAdvanced,

      // Micro:bit Planet
      'microbit_beginner': microbitBeginner,
      'microbit_intermediate': microbitIntermediate,
      'microbit_advanced': microbitAdvanced,
      
      // Python Planet
      'codedex_beginner': pythonCodedexBeginner,
      'codedex_intermediate': pythonCodedexIntermediate,
      'python_raspberry_intro': pythonRaspberryIntro,
      'python_raspberry_more': pythonRaspberryMore,
      'python_kids': pythonCodingKids,
      'python_fcc': pythonFreeCodeCamp,
      'python_picuino': pythonPicuino,
      'python_silent': pythonSilent,
      'python_academia': pythonAcademia,
      'python_retos': pythonRetos,
      
      // IA Planet
      'mlfk_challenges': mlForKids,
      
      // SQL Planet
      'sql_beginner': sqlBeginner,
      'sql_intermediate': sqlIntermediate,
      'sql_advanced': sqlAdvanced,
      
      // Other standard tabs
      'raspberry_l1': raspberryL1,
      'raspberry_l2': raspberryL2,
      'expert': expertChallenges,
      'js_basics': jsCourse,
      'fcc_html': fccHtml,
      'fcc_js': fccJs,
      'html_academy': htmlCodeOrg,
      'tutorials': tutorials
    };

    if (tabMapping[activeTab]) {
      return tabMapping[activeTab];
    }
    
    // 4. Special Case: Assessment
    if (activeTab === 'assessment') {
      return [{
        id: `assessment-${pid}`,
        title: "🛡️ PRUEBA DE SELECCIÓN NINJA",
        description: "Completa este diagnóstico para que el Sensei pueda desbloquear tu entrenamiento personalizado y habilitar el Tutor IA.",
        level: "Diagnóstico",
        category: "assessment",
        isAssessment: true
      }];
    }
    
    // Fallback to primary challenges list
    return challenges;
  };

  const activeList = getActiveList();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* BADGES SECTION */}
      {(pid === 'scratch' || pid?.includes('microbit') || pid === 'makecode-arcade' || pid === 'tinkercad' || pid === '3d' || pid === 'code' || pid === 'python' || pid === 'arduino' || pid === 'appinventor' || pid === 'html') && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
          <div style={{ 
            minWidth: '150px', padding: '12px', borderRadius: '12px', textAlign: 'center',
            background: hasLevelBadge ? (currentRank ? currentRank.color : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)') : '#f0f0f0',
            border: hasLevelBadge ? 'none' : '1px dashed #ccc', opacity: hasLevelBadge ? 1 : 0.5,
            boxShadow: hasLevelBadge ? `0 4px 15px ${currentRank ? currentRank.color : '#FFD700'}30` : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{currentRank?.icon || <Medal size={24} color={hasLevelBadge ? 'white' : '#999'} />}</span>
            <p style={{ fontSize: '0.6rem', fontWeight: '900', margin: 0, color: hasLevelBadge ? 'white' : '#666' }}>
              NIVEL {pid?.toUpperCase()} {currentRank ? `- ${currentRank.label}` : ''}
            </p>
          </div>

          {activeMilestones.map((m, i) => {
            const milestoneReached = m.reached || (pid !== 'tinkercad' && isAdvanced && i === 0);
            const isBig = m.type === 'big';
            const progress = milestoneProgress[m.label];
            const status = progress?.status;
            
            return (
              <div 
                key={i} 
                onClick={() => {
                  if (status === 'Validado' || status === 'Corregir' || milestoneReached) {
                    setSelectedMilestone({ ...m, ...progress });
                  }
                }}
                style={{ 
                  minWidth: isBig ? '120px' : '60px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  background: status === 'Validado' 
                    ? (isBig ? 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' : 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)') 
                    : (status === 'Corregir' ? '#ffebeb' : (milestoneReached ? (isBig ? 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' : 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)') : '#f0f0f0')),
                  border: (status === 'Corregir') ? '1px solid #ff4b4b' : (milestoneReached ? 'none' : '1px dashed #ccc'), 
                  opacity: (milestoneReached || status) ? 1 : 0.3,
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  cursor: (milestoneReached || status) ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                {status === 'Corregir' && (
                  <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4b4b', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid white' }}>
                    <AlertTriangle size={10} />
                  </div>
                )}
                {isBig ? (
                  <Medal size={24} color={(milestoneReached || status === 'Validado') ? 'white' : (status === 'Corregir' ? '#ff4b4b' : '#999')} style={{ margin: '0 auto 5px' }} />
                ) : (
                  <Zap size={18} color={(milestoneReached || status === 'Validado') ? 'white' : (status === 'Corregir' ? '#ff4b4b' : '#999')} style={{ margin: '0 auto 5px' }} />
                )}
                <p style={{ 
                  fontSize: isBig ? '0.6rem' : '0.5rem', 
                  fontWeight: '900', 
                  margin: 0, 
                  color: (milestoneReached || status === 'Validado') ? 'white' : (status === 'Corregir' ? '#ff4b4b' : '#666'), 
                  whiteSpace: 'nowrap' 
                }}>
                  { m.label }
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔮 DIFFICULTY LEVEL SELECTORS */}
      {difficultyChallenges && itinerary !== 'codeblocks' && pid !== 'tinkercad' && pid !== '3d' && 
       !['scratch', 'microbit', 'arduino', 'arcade', 'makecode-arcade', 'code', 'python', 'ia', 'appinventor', 'html', 'tinkercad', '3d'].includes(pid) && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${itinerary === 'blockscad' ? 2 : 3}, 1fr)`, gap: '15px', marginBottom: '10px' }}>
          {[
            { id: 'beginner', label: 'PRINCIPIANTE', color: '#4cd137', icon: '🌱' },
            { id: 'intermediate', label: 'INTERMEDIO', color: '#0097e6', icon: '⚔️' },
            { id: 'advanced', label: 'AVANZADO', color: '#e84118', icon: '🏆' }
          ].filter(lvl => !(itinerary === 'blockscad' && lvl.id === 'intermediate')).map(lvl => {
            const isSelected = difficultyLevel === lvl.id;
            return (
              <div 
                key={lvl.id}
                onClick={() => {
                  setDifficultyLevel(lvl.id);
                  setChallenges(difficultyChallenges[lvl.id] || []);
                }}
                style={{ 
                  padding: '15px 10px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer',
                  background: isSelected ? lvl.color : `linear-gradient(135deg, white 0%, ${lvl.color}08 100%)`,
                  border: `2px solid ${isSelected ? lvl.color : lvl.color + '33'}`, 
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  boxShadow: isSelected ? `0 8px 20px ${lvl.color}40` : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{lvl.icon}</span>
                <p style={{ fontSize: '0.6rem', fontWeight: '900', color: isSelected ? 'white' : lvl.color, margin: 0 }}>
                  {lvl.label} ({difficultyProgress ? (difficultyProgress[lvl.id] || 0) : 0}/{difficultyChallenges[lvl.id]?.length || 0})
                </p>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Microbit empty state */}
      {pid?.includes('microbit') && !activeTab && (
          <div style={{ marginTop: '20px', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '24px' }}>
            <Cpu size={60} color={accentColor} style={{ marginBottom: '20px', opacity: 0.8 }} />
            <h2 style={{ fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '10px' }}>¡Bienvenido a Micro:bit!</h2>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>Selecciona un nivel de dificultad para comenzar tus retos oficiales de Make It Code It.</p>
            <button onClick={() => setActiveTab('microbit_beginner')} style={{ padding: '15px 40px', fontSize: '1.1rem', background: accentColor, color: 'white', borderRadius: '30px', border: 'none', cursor: 'pointer' }}>COMENZAR NIVEL PRINCIPIANTE</button>
          </div>
      )}

      {/* TABS SELECTOR */}
      {(pid === 'scratch' || pid?.includes('microbit') || pid === 'makecode-arcade' || pid === 'arcade' || pid === 'tinkercad' || pid === '3d' || pid === 'code' || pid === 'python' || pid === 'arduino' || pid === 'appinventor' || pid === 'html' || pid === 'ia') && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
          
          {/* Ocultar pestaña CURSO en Arduino si está vacía */}
          {(pid !== 'arduino' || (arduinoTutorials && arduinoTutorials.length > 0)) && (pid === 'arduino') && (
            <button 
              onClick={() => { setActiveTab(pid === 'scratch' ? 'scratch_academia' : 'tutorials'); setSelectedTutorial(null); }}
              style={{ 
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                background: (activeTab === 'tutorials' || activeTab === 'scratch_academia') ? 'white' : 'transparent',
                color: (activeTab === 'tutorials' || activeTab === 'scratch_academia') ? accentColor : '#666',
                boxShadow: (activeTab === 'tutorials' || activeTab === 'scratch_academia') ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s', minWidth: 'fit-content'
              }}
            >
              {pid === 'arduino' ? 'CURSO ARDUINO' : 'ACADEMIA'}
            </button>
          )}
            {pid === 'code' ? (
              <>
                <button 
                  onClick={() => { setActiveTab('cursos_modernos'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'cursos_modernos' ? 'white' : 'transparent',
                    color: activeTab === 'cursos_modernos' ? accentColor : '#666',
                    boxShadow: activeTab === 'cursos_modernos' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  CURSOS MODERNOS (5)
                </button>
                <button 
                  onClick={() => { setActiveTab('hora_del_codigo'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'hora_del_codigo' ? 'white' : 'transparent',
                    color: activeTab === 'hora_del_codigo' ? accentColor : '#666',
                    boxShadow: activeTab === 'hora_del_codigo' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  HORA DEL CÓDIGO (22)
                </button>
                <button 
                  onClick={() => { setActiveTab('ia_explorer'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'ia_explorer' ? 'white' : 'transparent',
                    color: activeTab === 'ia_explorer' ? accentColor : '#666',
                    boxShadow: activeTab === 'ia_explorer' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  IA EXPLORER (1)
                </button>
              </>
            ) : pid === 'scratch' ? (
              <>
                {!assessmentCompleted && (
                  <button 
                    onClick={() => { setActiveTab('assessment'); setSelectedTutorial(null); }}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '900', fontFamily: 'Outfit',
                      background: activeTab === 'assessment' ? accentColor : 'white',
                      color: activeTab === 'assessment' ? 'white' : '#FF6B00',
                      boxShadow: '0 4px 12px rgba(255,107,0,0.2)',
                      transition: 'all 0.2s', minWidth: 'fit-content',
                      border: activeTab === 'assessment' ? 'none' : '1px solid #FF6B00'
                    }}
                  >
                    🎯 DESAFÍO NINJA
                  </button>
                )}
                <button 
                  onClick={() => { setActiveTab('scratch_academia'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: (activeTab === 'scratch_academia' || activeTab === 'tutorials') ? 'white' : 'transparent',
                    color: (activeTab === 'scratch_academia' || activeTab === 'tutorials') ? accentColor : '#666',
                    boxShadow: (activeTab === 'scratch_academia' || activeTab === 'tutorials') ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  ACADEMIA (27)
                </button>
                <button 
                  onClick={() => { setActiveTab('scratch_robotix'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'scratch_robotix' ? 'white' : 'transparent',
                    color: activeTab === 'scratch_robotix' ? accentColor : '#666',
                    boxShadow: activeTab === 'scratch_robotix' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  ROBOTIX (78)
                </button>
                <button 
                  onClick={() => { setActiveTab('scratch_raspberry_l1'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'scratch_raspberry_l1' ? 'white' : 'transparent',
                    color: activeTab === 'scratch_raspberry_l1' ? accentColor : '#666',
                    boxShadow: activeTab === 'scratch_raspberry_l1' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  PI PRINCIPIANTE (53)
                </button>
                <button 
                  onClick={() => { setActiveTab('scratch_raspberry_l2'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'scratch_raspberry_l2' ? 'white' : 'transparent',
                    color: activeTab === 'scratch_raspberry_l2' ? accentColor : '#666',
                    boxShadow: activeTab === 'scratch_raspberry_l2' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  PI INTERMEDIO (21)
                </button>
                <button 
                  onClick={() => { setActiveTab('scratch_raspberry_l3'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'scratch_raspberry_l3' ? 'white' : 'transparent',
                    color: activeTab === 'scratch_raspberry_l3' ? accentColor : '#666',
                    boxShadow: activeTab === 'scratch_raspberry_l3' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  PI AVANZADO (9)
                </button>
              </>
            ) : (pid === 'microbit' || pid === 'makecode-microbit') ? (
              <>
                {!assessmentCompleted && (
                  <button 
                    onClick={() => { setActiveTab('assessment'); setSelectedTutorial(null); }}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '900', fontFamily: 'Outfit',
                      background: activeTab === 'assessment' ? accentColor : 'white',
                      color: activeTab === 'assessment' ? 'white' : '#FF6B00',
                      boxShadow: '0 4px 12px rgba(255,107,0,0.2)',
                      transition: 'all 0.2s', minWidth: 'fit-content',
                      border: activeTab === 'assessment' ? 'none' : '1px solid #FF6B00'
                    }}
                  >
                    🎯 DESAFÍO NINJA
                  </button>
                )}
                <button 
                  onClick={() => { setActiveTab('microbit_beginner'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'microbit_beginner' ? 'white' : 'transparent',
                    color: activeTab === 'microbit_beginner' ? accentColor : '#666',
                    boxShadow: activeTab === 'microbit_beginner' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  PRINCIPIANTE (57)
                </button>
                <button 
                  onClick={() => { setActiveTab('microbit_intermediate'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'microbit_intermediate' ? 'white' : 'transparent',
                    color: activeTab === 'microbit_intermediate' ? accentColor : '#666',
                    boxShadow: activeTab === 'microbit_intermediate' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  INTERMEDIO (47)
                </button>
                <button 
                  onClick={() => { setActiveTab('microbit_advanced'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'microbit_advanced' ? 'white' : 'transparent',
                    color: activeTab === 'microbit_advanced' ? accentColor : '#666',
                    boxShadow: activeTab === 'microbit_advanced' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  AVANZADO (19)
                </button>
              </>
            ) : (pid === 'makecode-arcade' || pid === 'arcade') ? (
                <>
                {!assessmentCompleted && (
                  <button 
                    onClick={() => { setActiveTab('assessment'); setSelectedTutorial(null); }}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '900', fontFamily: 'Outfit',
                      background: activeTab === 'assessment' ? accentColor : 'white',
                      color: activeTab === 'assessment' ? 'white' : '#FF6B00',
                      boxShadow: '0 4px 12px rgba(255,107,0,0.2)',
                      transition: 'all 0.2s', minWidth: 'fit-content',
                      border: activeTab === 'assessment' ? 'none' : '1px solid #FF6B00'
                    }}
                  >
                    🎯 DESAFÍO NINJA
                  </button>
                )}
                <button 
                  onClick={() => { setActiveTab('challenges'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'challenges' ? 'white' : 'transparent',
                    color: activeTab === 'challenges' ? accentColor : '#666',
                    boxShadow: activeTab === 'challenges' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  WE TEACH ROBOTICS (18)
                </button>
              </>
            ) : pid === 'arduino' ? (
              <>
                {!assessmentCompleted && (
                  <button 
                    onClick={() => { setActiveTab('assessment'); setSelectedTutorial(null); }}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '900', fontFamily: 'Outfit',
                      background: activeTab === 'assessment' ? accentColor : 'white',
                      color: activeTab === 'assessment' ? 'white' : '#FF6B00',
                      boxShadow: '0 4px 12px rgba(255,107,0,0.2)',
                      transition: 'all 0.2s', minWidth: 'fit-content',
                      border: activeTab === 'assessment' ? 'none' : '1px solid #FF6B00'
                    }}
                  >
                    🎯 DESAFÍO NINJA
                  </button>
                )}
                <button 
                  onClick={() => { setActiveTab('arduino_beginner'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'arduino_beginner' ? 'white' : 'transparent',
                    color: activeTab === 'arduino_beginner' ? accentColor : '#666',
                    boxShadow: activeTab === 'arduino_beginner' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  PRINCIPIANTE (5)
                </button>
                <button 
                  onClick={() => { setActiveTab('arduino_intermediate'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'arduino_intermediate' ? 'white' : 'transparent',
                    color: activeTab === 'arduino_intermediate' ? accentColor : '#666',
                    boxShadow: activeTab === 'arduino_intermediate' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  INTERMEDIO (24)
                </button>
                <button 
                  onClick={() => { setActiveTab('arduino_advanced'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'arduino_advanced' ? 'white' : 'transparent',
                    color: activeTab === 'arduino_advanced' ? accentColor : '#666',
                    boxShadow: activeTab === 'arduino_advanced' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  AVANZADO (42)
                </button>
              </>
            ) : pid === 'sql' ? (
              <>
                {!assessmentCompleted && (
                  <button 
                    onClick={() => { setActiveTab('assessment'); setSelectedTutorial(null); }}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '900', fontFamily: 'Outfit',
                      background: activeTab === 'assessment' ? accentColor : 'white',
                      color: activeTab === 'assessment' ? 'white' : '#FF6B00',
                      boxShadow: '0 4px 12px rgba(255,107,0,0.2)',
                      transition: 'all 0.2s', minWidth: 'fit-content',
                      border: activeTab === 'assessment' ? 'none' : '1px solid #FF6B00'
                    }}
                  >
                    🎯 DESAFÍO NINJA
                  </button>
                )}
                <button 
                  onClick={() => { setActiveTab('sql_beginner'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'sql_beginner' ? 'white' : 'transparent',
                    color: activeTab === 'sql_beginner' ? accentColor : '#666',
                    boxShadow: activeTab === 'sql_beginner' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  PRINCIPIANTE (1)
                </button>
                <button 
                  onClick={() => { setActiveTab('sql_intermediate'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'sql_intermediate' ? 'white' : 'transparent',
                    color: activeTab === 'sql_intermediate' ? accentColor : '#666',
                    boxShadow: activeTab === 'sql_intermediate' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  INTERMEDIO (1)
                </button>
                <button 
                  onClick={() => { setActiveTab('sql_advanced'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'sql_advanced' ? 'white' : 'transparent',
                    color: activeTab === 'sql_advanced' ? accentColor : '#666',
                    boxShadow: activeTab === 'sql_advanced' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  AVANZADO (1)
                </button>
              </>
            ) : pid === 'html' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                 {/* Selector de Itinerario para HTML */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', background: 'rgba(0,0,0,0.03)', padding: '5px', borderRadius: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => { setItinerary('academy'); setActiveTab('html_academy'); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Outfit',
                      background: (itinerary === 'academy' || !itinerary) ? 'white' : 'transparent',
                      color: (itinerary === 'academy' || !itinerary) ? '#FF6B00' : '#666',
                      boxShadow: (itinerary === 'academy' || !itinerary) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    🎓 ACADEMIA (CODE.ORG)
                  </button>
                  <button 
                    onClick={() => { setItinerary('raspberry'); setActiveTab('raspberry_l1'); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Outfit',
                      background: itinerary === 'raspberry' ? 'white' : 'transparent',
                      color: itinerary === 'raspberry' ? '#FF6B00' : '#666',
                      boxShadow: itinerary === 'raspberry' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    🍓 PROYECTOS (RASPBERRY PI)
                  </button>
                  <button 
                    onClick={() => { setItinerary('javascript'); setActiveTab('js_basics'); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Outfit',
                      background: itinerary === 'javascript' ? 'white' : 'transparent',
                      color: itinerary === 'javascript' ? '#F7DF1E' : '#666',
                      boxShadow: itinerary === 'javascript' ? '0 4px 12px rgba(247,223,30,0.2)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    💡 JS (LEARN JAVASCRIPT)
                  </button>
                  <button 
                    onClick={() => { setItinerary('fcc'); setActiveTab('fcc_html'); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Outfit',
                      background: itinerary === 'fcc' ? 'white' : 'transparent',
                      color: itinerary === 'fcc' ? '#0a0a23' : '#666',
                      boxShadow: itinerary === 'fcc' ? '0 4px 12px rgba(10,10,35,0.2)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    🎓 FREECODECAMP
                  </button>
                </div>

                {/* Sub-tabs según el Itinerario */}
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px', whiteSpace: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {(itinerary === 'academy' || !itinerary) ? (
                    <button 
                      onClick={() => setActiveTab('html_academy')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                        background: activeTab === 'html_academy' ? 'rgba(255,107,0,0.1)' : 'transparent',
                        color: activeTab === 'html_academy' ? '#FF6B00' : '#666',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      CODE.ORG CURSO ({htmlCodeOrgCompleted}/{htmlCodeOrg.length})
                    </button>
                  ) : itinerary === 'raspberry' ? (
                    <>
                      <button 
                        onClick={() => setActiveTab('raspberry_l1')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'raspberry_l1' ? 'rgba(255,107,0,0.1)' : 'transparent',
                          color: activeTab === 'raspberry_l1' ? '#FF6B00' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        BÁSICOS ({l1Completed}/{raspberryL1.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab('raspberry_l2')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'raspberry_l2' ? 'rgba(255,107,0,0.1)' : 'transparent',
                          color: activeTab === 'raspberry_l2' ? '#FF6B00' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        INTERMEDIO ({l2Completed}/{raspberryL2.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab('expert')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'expert' ? 'rgba(255,107,0,0.1)' : 'transparent',
                          color: activeTab === 'expert' ? '#FF6B00' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        AVANZADO ({expertChallengesCompleted}/{expertChallenges.length})
                      </button>
                    </>
                  ) : itinerary === 'javascript' ? (
                    <button 
                        onClick={() => setActiveTab('js_basics')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'js_basics' ? 'rgba(247,223,30,0.15)' : 'transparent',
                          color: activeTab === 'js_basics' ? '#b8a000' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        CURSO ({jsCourseCompleted}/{jsCourse.length})
                      </button>
                  ) : itinerary === 'fcc' ? (
                      <>
                        <button 
                            onClick={() => setActiveTab('fcc_html')}
                            style={{ 
                              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                              background: activeTab === 'fcc_html' ? 'rgba(10,10,35,0.1)' : 'transparent',
                              color: activeTab === 'fcc_html' ? '#0a0a23' : '#666',
                              transition: 'all 0.2s', minWidth: 'fit-content'
                            }}
                          >
                            RESPONSIVE WEB DESIGN ({fccHtmlCompleted}/{fccHtml.length})
                          </button>
                          <button 
                            onClick={() => setActiveTab('fcc_js')}
                            style={{ 
                              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                              background: activeTab === 'fcc_js' ? 'rgba(10,10,35,0.1)' : 'transparent',
                              color: activeTab === 'fcc_js' ? '#0a0a23' : '#666',
                              transition: 'all 0.2s', minWidth: 'fit-content'
                            }}
                          >
                            JAVASCRIPT ({fccJsCompleted}/{fccJs.length})
                          </button>
                      </>
                    ) : null}
                </div>

                {/* Atribución JS */}
                {itinerary === 'javascript' && (
                  <div style={{ fontSize: '0.65rem', color: '#999', textAlign: 'center', paddingTop: '2px' }}>
                    Curso por <a href="https://learnjavascript.online" target="_blank" rel="noopener noreferrer" style={{ color: '#b8a000', textDecoration: 'none', fontWeight: '700' }}>Jad Joubran – learnjavascript.online</a>
                  </div>
                )}
              </div>

            ) : pid === 'python' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {/* Selector de Itinerario para Python */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '5px', background: 'rgba(0,0,0,0.03)', padding: '5px', borderRadius: '12px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'academy', label: '🎓 ACADEMIA', color: accentColor },
                    { id: 'raspberry', label: '🍓 PROYECTOS PI', color: '#E30B5D' },
                    { id: 'codedex', label: '⚔️ CODÉDEX', color: '#000000' },
                    { id: 'picuino', label: '🐧 CURSO PICUINO', color: '#0097e6' },
                    { id: 'kids', label: '🧩 CODING KIDS', color: '#4cd137' },
                    { id: 'freecodecamp', label: '🔥 FREECODECAMP', color: '#0a0a23' }
                  ].map(it => (
                    <button 
                      key={it.id}
                      onClick={() => { 
                        setItinerary(it.id); 
                        if (it.id === 'academy') setActiveTab('python_silent');
                        else if (it.id === 'raspberry') setActiveTab('python_raspberry_intro');
                        else if (it.id === 'codedex') setActiveTab('codedex_beginner');
                        else if (it.id === 'picuino') setActiveTab('python_picuino');
                        else if (it.id === 'kids') setActiveTab('python_kids');
                        else if (it.id === 'freecodecamp') setActiveTab('python_fcc');
                      }}
                      style={{
                        flex: '1 1 auto', padding: '10px 15px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '800', fontFamily: 'Outfit',
                        background: (itinerary === it.id || (!itinerary && it.id === 'academy')) ? 'white' : 'transparent',
                        color: (itinerary === it.id || (!itinerary && it.id === 'academy')) ? it.color : '#666',
                        boxShadow: (itinerary === it.id || (!itinerary && it.id === 'academy')) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>

                {/* Sub-tabs según el Itinerario */}
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
                  {(itinerary === 'academy' || !itinerary) ? (
                    <button 
                      onClick={() => setActiveTab('python_silent')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                        background: activeTab === 'python_silent' ? 'rgba(0,0,0,0.05)' : 'transparent',
                        color: activeTab === 'python_silent' ? accentColor : '#666',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      SILENT TEACHER ({pythonSilent.filter(c => userProgress[`python-academy-reto-${c.id}`]?.status === 'Validado').length}/{pythonSilent.length})
                    </button>
                  ) : itinerary === 'raspberry' ? (
                    <>
                      <button 
                        onClick={() => setActiveTab('python_raspberry_intro')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'python_raspberry_intro' ? 'rgba(227,11,93,0.1)' : 'transparent',
                          color: activeTab === 'python_raspberry_intro' ? '#E30B5D' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        PRINCIPIANTE ({pythonRaspberryIntroCompleted}/{pythonRaspberryIntro.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab('python_raspberry_more')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'python_raspberry_more' ? 'rgba(227,11,93,0.1)' : 'transparent',
                          color: activeTab === 'python_raspberry_more' ? '#E30B5D' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        INTERMEDIO ({pythonRaspberryMoreCompleted}/{pythonRaspberryMore.length})
                      </button>
                    </>
                  ) : itinerary === 'codedex' ? (
                    <>
                      <button 
                        onClick={() => setActiveTab('codedex_beginner')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'codedex_beginner' ? 'rgba(0,0,0,0.05)' : 'transparent',
                          color: activeTab === 'codedex_beginner' ? '#000' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        PRINCIPIANTE ({pythonCodedexBeginnerCompleted}/{pythonCodedexBeginner.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab('codedex_intermediate')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                          background: activeTab === 'codedex_intermediate' ? 'rgba(0,0,0,0.05)' : 'transparent',
                          color: activeTab === 'codedex_intermediate' ? '#000' : '#666',
                          transition: 'all 0.2s', minWidth: 'fit-content'
                        }}
                      >
                        INTERMEDIO ({pythonCodedexIntermediateCompleted}/{pythonCodedexIntermediate.length})
                      </button>
                    </>
                  ) : itinerary === 'picuino' ? (
                    <button 
                      onClick={() => setActiveTab('python_picuino')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                        background: activeTab === 'python_picuino' ? 'rgba(0,151,230,0.1)' : 'transparent',
                        color: activeTab === 'python_picuino' ? '#0097e6' : '#666',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      CURSO COMPLETO ({pythonPicuinoCompleted}/{pythonPicuino.length})
                    </button>
                  ) : itinerary === 'kids' ? (
                    <button 
                      onClick={() => setActiveTab('python_kids')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                        background: activeTab === 'python_kids' ? 'rgba(76,209,55,0.1)' : 'transparent',
                        color: activeTab === 'python_kids' ? '#4cd137' : '#666',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      CODING FOR KIDS ({pythonCodingKidsCompleted}/{pythonCodingKids.length})
                    </button>
                  ) : itinerary === 'freecodecamp' ? (
                    <button 
                      onClick={() => setActiveTab('python_fcc')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                        background: activeTab === 'python_fcc' ? 'rgba(10,10,35,0.1)' : 'transparent',
                        color: activeTab === 'python_fcc' ? '#0a0a23' : '#666',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      FREECODECAMP ({pythonFreeCodeCampCompleted}/{pythonFreeCodeCamp.length})
                    </button>
                  ) : null}
                </div>
              </div>
            ) : pid === 'ia' && itinerary === 'mlforkids' ? (
              <>
                <button
                  onClick={() => { setActiveTab('mlfk_challenges'); setSelectedTutorial(null); }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'mlfk_challenges' ? 'white' : 'transparent',
                    color: activeTab === 'mlfk_challenges' ? accentColor : '#666',
                    boxShadow: activeTab === 'mlfk_challenges' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  🚀 RETOS MLFK ({mlForKids.filter(c => userProgress[`ia-mlforkids-reto-${c.id}`]?.status === 'Validado').length}/{mlForKids.length})
                </button>
              </>
            ) : (
              <>
                {/* FALLBACK TABS */}
                {tutorials.length > 0 && pid !== 'tinkercad' && pid !== '3d' && pid !== 'ia' && pid !== 'python' && (
                  <button 
                    onClick={() => setActiveTab('tutorials')}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Outfit',
                      background: activeTab === 'tutorials' ? 'white' : 'rgba(0,0,0,0.05)',
                      color: activeTab === 'tutorials' ? accentColor : '#666',
                      boxShadow: activeTab === 'tutorials' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s', minWidth: 'fit-content', border: activeTab === 'tutorials' ? `2px solid ${accentColor}` : '2px solid transparent'
                    }}
                  >
                    🎓 ACADEMIA {`(${tutorialsCompleted}/${tutorials.length})`}
                  </button>
                )}
                {challenges.length > 0 && pid !== 'tinkercad' && pid !== '3d' && pid !== 'ia' && pid !== 'python' && (
                  <button 
                    onClick={() => setActiveTab('challenges')}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: '800', fontFamily: 'Outfit',
                      background: activeTab === 'challenges' ? 'white' : 'rgba(0,0,0,0.05)',
                      color: activeTab === 'challenges' ? accentColor : '#666',
                      boxShadow: activeTab === 'challenges' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s', minWidth: 'fit-content', border: activeTab === 'challenges' ? `2px solid ${accentColor}` : '2px solid transparent'
                    }}
                  >
                    🚀 RETOS ({challengesCompleted}/{challenges.length})
                  </button>
                )}
              </>
            )}
        </div>
      )}

      {/* MODAL POPUP */}
      {selectedTutorial && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setSelectedTutorial(null)}>
          
          <GlassCard style={{ 
            width: '100%', maxWidth: '600px', padding: '30px', 
            background: 'white', border: `1px solid rgba(255,255,255,0.2)`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', borderRadius: '24px', 
            position: 'relative', overflowY: 'auto', maxHeight: '90vh'
          }} onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={() => setSelectedTutorial(null)}
              style={{ 
                position: 'absolute', top: '15px', right: '15px', 
                background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#333', fontWeight: 'bold', zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >✕</button>

            {(() => {
              const currentItem = selectedTutorial;
              const isTutorial = activeTab === 'tutorials' || activeTab === 'tutorials_3d' || activeTab === 'tutorials_codeblocks';
              let progressKey = isTutorial ? `${planetId}${itinerary ? '-' + itinerary : ''}-tutorial-${currentItem.id}` : `${planetId}${itinerary ? '-' + itinerary : ''}-reto-${currentItem.id || currentItem.numero}`;
              let fallbackKey = !isTutorial && currentItem.id ? `${planetId}${itinerary ? '-' + itinerary : ''}-reto-${currentItem.numero}` : null;
              
              if (planetId === 'code') {
                if (activeTab === 'cursos_modernos') progressKey = `${planetId}-reto-modern-${currentItem.id}`;
                if (activeTab === 'hora_codigo') progressKey = `${planetId}-reto-hoc-${currentItem.id}`;
                if (activeTab === 'hour_of_ai') progressKey = `${planetId}-reto-ai-${currentItem.id}`;
              }

              if (planetId === 'python' && itinerary === 'codedex') {
                const levelCode = activeTab === 'codedex_beginner' ? 'beg' : (activeTab === 'codedex_intermediate' ? 'int' : 'adv');
                progressKey = `${planetId}-reto-codedex-${levelCode}-${currentItem.id}`;
              }

              const currentProgress = userProgress[progressKey] || (fallbackKey ? userProgress[fallbackKey] : null);

              return (
                <div style={{ margin: '-30px -30px 0 -30px' }}>
                  {/* HERO BANNER IMAGE (Teatro Robotix) */}
                  <div style={{ 
                    width: '100%', height: '220px', position: 'relative',
                    overflow: 'hidden', borderRadius: '24px 24px 0 0',
                    background: 'linear-gradient(135deg, #0DCFCF 0%, #0088CC 100%)'
                  }}>
                    {(() => {
                      const getHeroImage = () => {
                        const pid = planetId?.toLowerCase();
                        if (pid === 'html') return '/planets/html_banner.png';
                        if (pid === 'scratch') return "/robotix_scratch_hero.png";
                        if (pid.includes('microbit')) return "/microbit_hero.png";
                        if (pid === 'arduino') return "/planets/arduino_cover.png";
                        if (pid === 'makecode-arcade') return "/arcade_hero.png";
                        if (pid === 'python') return "/planets/python-hero.png";
                        if (itinerary === 'blockscad') return "/planets/blockscad.png";
                        if (pid?.startsWith('tinkercad')) {
                          return itinerary === 'codeblocks' ? "/planets/tinkercad_codeblocks.png" : "/planets/tinkercad_3d.png";
                        }
                        if (planetId === 'code') return "/planets/code-pro.png";
                        if (planetId?.toLowerCase() === 'appinventor') return "/planets/app%20inventor.png";
                        if (planetId === 'ia') return "/planets/machine_learning_v2.png";
                        
                        // Default fallback
                        return "/planets/microbit.jpeg";
                      };

                      return (
                        <img 
                          src={getHeroImage()} 
                          alt="Planet Hero"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.9' }}
                        />
                      );
                    })()}
                    <div style={{ 
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: '80px', background: 'linear-gradient(to top, white, transparent)'
                    }} />
                  </div>

                  <div style={{ padding: '0 30px 30px 30px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', marginTop: '-15px', position: 'relative', zIndex: 2 }}>
                      <span style={{ 
                        fontSize: '0.65rem', fontWeight: '900', color: 'white', 
                        letterSpacing: '1px', textTransform: 'uppercase',
                        background: accentColor, padding: '6px 12px', borderRadius: '20px',
                        boxShadow: `0 4px 12px ${accentColor}40`
                      }}>
                        {!isTutorial ? (
                           (activeTab === 'raspberry_l1' || activeTab === 'scratch_raspberry_l1') ? `RASPBERRY NIVEL 1` :
                           (activeTab === 'raspberry_l2' || activeTab === 'scratch_raspberry_l2') ? `RASPBERRY NIVEL 2` :
                           (activeTab === 'expert' || activeTab === 'scratch_raspberry_l3') ? `RASPBERRY NIVEL 3` :
                           activeTab === 'js_basics' ? `⚡ JS - LEARN JAVASCRIPT` :
                           (planetId === 'code' ? 'ACTIVIDAD CODE.ORG' :
                            (planetId === 'scratch' && activeTab === 'scratch_robotix') ? 'RETO ROBOTIX' : 
                            (planetId === 'scratch' && activeTab === 'scratch_academia') ? 'ACADEMIA' :
                            planetId === 'appinventor' ? 'RETO APP INVENTOR' :
                            (planetId === 'makecode-arcade' ? 'RETO WE TEACH ROBOTICS' : 'RETO NINJA')) + ` ${currentItem.numero || ''}`
                         ) : 
                         (activeTab === 'raspberry_l1' || activeTab === 'scratch_raspberry_l1') ? `RASPBERRY NIVEL 1 - RETO ${currentItem.numero}` :
                         (activeTab === 'raspberry_l2' || activeTab === 'scratch_raspberry_l2') ? `RASPBERRY NIVEL 2 - RETO ${currentItem.numero}` :
                         (activeTab === 'expert' || activeTab === 'scratch_raspberry_l3') ? `RASPBERRY NIVEL 3 - RETO ${currentItem.numero}` : 
                         (planetId === 'scratch' ? 'ACADEMIA' : (planetId === 'makecode-arcade' ? 'ACADEMIA' : (planetId?.startsWith('tinkercad') ? `DISEÑO 3D` : 'ACADEMIA')))}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 15px 0', color: '#1a1a2e' }}>
                      {currentItem.titulo || currentItem.title || currentItem.nombre || (currentItem.numero ? `Reto ${currentItem.numero}` : 'Detalles')}
                    </h3>

                    {currentProgress?.teacher_feedback && (
                      <div style={{ 
                        margin: '-10px 0 20px 0', padding: '15px', borderRadius: '12px',
                        background: currentProgress.status === 'Corregir' ? '#fff0f0' : '#f0fff4',
                        borderLeft: `4px solid ${currentProgress.status === 'Corregir' ? '#ff4b4b' : '#22c55e'}`,
                        display: 'flex', flexDirection: 'column', gap: '5px'
                      }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: currentProgress.status === 'Corregir' ? '#ff4b4b' : '#22c55e', textTransform: 'uppercase' }}>
                          Retroalimentación del Profesor:
                        </span>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#1a1a2e', fontStyle: 'italic', lineHeight: '1.4' }}>
                          "{currentProgress.teacher_feedback}"
                        </p>
                        {currentProgress.status === 'Corregir' && (
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ff4b4b', marginTop: '5px' }}>
                            ⚠️ Por favor, revisa las correcciones y vuelve a enviar tu reto.
                          </span>
                        )}
                      </div>
                    )}

                    {!isTutorial ? (
                      <div style={{ margin: '0 0 24px 0', background: 'rgba(13, 207, 207, 0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(13, 207, 207, 0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {pid === 'html' && itinerary === 'javascript' ? (
                            <>
                              <div style={{ marginBottom: '20px' }}>
                                <GlowButton 
                                  color="blue" 
                                  onClick={() => window.open(getChallengeUrl(currentItem, activeTab), '_blank')}
                                  style={{ 
                                    padding: '12px 25px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    background: 'linear-gradient(135deg, #F7DF1E 0%, #e6c800 100%)',
                                    color: '#1a1a1a'
                                  }}
                                >
                                  <ExternalLink size={18} /> ACCEDER AL CURSO DE JAVASCRIPT
                                </GlowButton>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: '#F7DF1E', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(247,223,30,0.4)' }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: '#b8a000', fontWeight: '800', textDecoration: 'underline' }}>learnjavascript.online</a> y completa las lecciones a tu ritmo. La plataforma guarda tu progreso automáticamente.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: '#F7DF1E', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(247,223,30,0.4)' }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Cuando completes el curso, vuelve aquí y marca el reto como completado.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: '#F7DF1E', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(247,223,30,0.4)' }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Adjunta una captura de tu progreso o el enlace a tu perfil para que el Sensei pueda validarlo.
                                </p>
                              </div>
                             </>
                          ) : pid === 'python' ? (
                            <>
                              {activeTab === 'python_picuino' ? (
                                <>
                                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                    <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                      Mira las instrucciones en la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página oficial de Picuino</a>.
                                    </p>
                                  </div>
                                  <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                    <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                      Cuando termines, comparte una <strong>captura de pantalla</strong> o el enlace de tu código con nosotros para validarlo.
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                        Accede a la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>plataforma oficial del curso</a> y completa la actividad propuesta.
                                      </p>
                                      
                                      <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                                        <GlowButton 
                                          color="blue" 
                                          onClick={() => window.open(getChallengeUrl(currentItem, activeTab), '_blank')}
                                          style={{ 
                                            padding: '12px 25px', 
                                            fontSize: '0.95rem', 
                                            fontWeight: '800',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px'
                                          }}
                                        >
                                          <ExternalLink size={18} /> ACCEDER A LA PLATAFORMA
                                        </GlowButton>
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                    <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                      Cuando termines, sube una <strong>captura de pantalla</strong> de tu progreso o certificado para que el Sensei lo valide.
                                    </p>
                                  </div>
                                </>
                              )}
                            </>
                          ) : pid === 'html' ? (
                            <>
                              <div style={{ marginBottom: '20px' }}>
                                <GlowButton 
                                  color="blue" 
                                  onClick={() => window.open(getChallengeUrl(currentItem, activeTab), '_blank')}
                                  style={{ 
                                    padding: '12px 25px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                  }}
                                >
                                  <ExternalLink size={18} /> {
                                    itinerary === 'raspberry' ? 'ACCEDER AL PROYECTO RASPBERRY PI' :
                                    'ACCEDER A LA ACADEMIA CODE.ORG'
                                  }
                                </GlowButton>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  {itinerary === 'raspberry' ? 'Sigue el tutorial paso a paso en la plataforma de proyectos de Raspberry Pi.' : 
                                   'Entra en la lección correspondiente de Code.org y completa todas las burbujas.'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Usa el editor integrado de la plataforma para escribir tu código HTML/CSS.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Al terminar, adjunta una captura de tu resultado o pega el enlace a tu código para que el Sensei pueda validarlo.
                                </p>
                              </div>
                            </>
                          ) : (activeTab === 'expert' || activeTab.startsWith('raspberry_') || activeTab.startsWith('scratch_raspberry_')) ? (
                            <>
                              <div style={{ marginBottom: '20px' }}>
                                <GlowButton 
                                  color="blue" 
                                  onClick={() => window.open(getChallengeUrl(currentItem, activeTab), '_blank')}
                                  style={{ 
                                    padding: '12px 25px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                  }}
                                >
                                  <ExternalLink size={18} /> ACCEDER AL PROYECTO RASPBERRY PI
                                </GlowButton>
                              </div>
                              
                              <div style={{ marginBottom: '24px', padding: '15px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: accentColor, textTransform: 'uppercase' }}>Descripción:</span>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.95rem', color: '#666', lineHeight: '1.5' }}>
                                  {currentItem.descripcion || currentItem.description || "Proyecto oficial de la Raspberry Pi Foundation."}
                                </p>
                              </div>

                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Sigue la guía oficial de la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>Raspberry Pi Foundation</a> para completar este proyecto.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Cuando lo termines, comparte el enlace de tu proyecto de Scratch con nosotros para validarlo.
                                </p>
                              </div>
                            </>
                          ) : pid === 'makecode-arcade' ? (
                            <>
                              <div style={{ marginBottom: '20px' }}>
                                <GlowButton 
                                  color="blue" 
                                  onClick={() => window.open(currentItem.editorUrl || 'https://arcade.makecode.com/', '_blank')}
                                  style={{ 
                                    padding: '12px 25px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                  }}
                                >
                                  <ExternalLink size={18} /> ABRIR EDITOR MAKECODE ARCADE
                                </GlowButton>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Usa el editor oficial de <strong>MakeCode Arcade</strong> para resolver este desafío.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Busca el tutorial del reto <a href={currentItem.pdfUrl || 'https://view.genially.com/64ca324dc4c807001173a6ec'} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>aquí</a>, en la guía visual del mapa de retos (busca el Reto #{currentItem.numero}).
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Cuando termines tu proyecto, comparte el enlace generado por el editor con nosotros.
                                </p>
                              </div>
                            </>
                          ) : planetId?.toLowerCase().includes('microbit') ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto</a> para ver las instrucciones detalladas.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Resuélvelo en el <a href="https://makecode.microbit.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>editor oficial de MakeCode</a>.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el reto con nosotros.
                                </p>
                              </div>
                            </>
                          ) : itinerary === 'javascript' ? (
                            <>
                              <div style={{ marginBottom: '20px' }}>
                                <GlowButton 
                                  color="blue" 
                                  onClick={() => window.open(currentItem.url, '_blank')}
                                  style={{ 
                                    padding: '12px 25px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    background: 'linear-gradient(135deg, #F7DF1E 0%, #e6c800 100%)',
                                    color: '#1a1a1a'
                                  }}
                                >
                                  <ExternalLink size={18} /> ACCEDER AL CURSO DE JAVASCRIPT
                                </GlowButton>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: '#F7DF1E', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(247,223,30,0.4)' }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en <a href={currentItem.url} target="_blank" rel="noopener noreferrer" style={{ color: '#b8a000', fontWeight: '800', textDecoration: 'underline' }}>learnjavascript.online</a> y completa las lecciones a tu ritmo.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: '#F7DF1E', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(247,223,30,0.4)' }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  La plataforma guarda tu progreso automáticamente. Cuando completes el curso, márcalo aquí.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: '#F7DF1E', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(247,223,30,0.4)' }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Adjunta una captura de tu progreso o el enlace a tu perfil para que el Sensei pueda validarlo.
                                </p>
                              </div>
                            </>
                          ) : itinerary === 'raspberry' ? (
                            <>
                              <div style={{ marginBottom: '20px' }}>
                                <GlowButton 
                                  color="blue" 
                                  onClick={() => window.open(getChallengeUrl(currentItem, activeTab), '_blank')}
                                  style={{ 
                                    padding: '12px 25px', 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                  }}
                                >
                                  <ExternalLink size={18} /> ACCEDER AL PROYECTO RASPBERRY PI
                                </GlowButton>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Sigue las instrucciones del proyecto en la página oficial que acabas de abrir.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Resuelve el reto en tu editor favorito.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el enlace de tu código o una captura para validarlo.
                                </p>
                              </div>
                            </>
                          ) : pid === 'appinventor' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Abre la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>Guía del Reto</a> de {itinerary === 'social' ? 'Raspberry Pi Foundation' : 'Justo Rodríguez'} para ver los pasos.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Crea tu aplicación en el entorno oficial de <a href="https://ai2.appinventor.mit.edu/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>MIT App Inventor</a>.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Cuando termines, exporta tu proyecto (.aia) o haz una captura y adjúntala aquí.
                                </p>
                              </div>
                            </>
                          ) : itinerary === 'blockscad' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Mira la guía en la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> de Picuino.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Resuélvelo en el <a href="https://www.blockscad3d.com/editor/?lang=es#" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>editor oficial de BlocksCAD</a>.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el reto con nosotros.
                                </p>
                              </div>
                            </>
                          ) : planetId === 'code' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página oficial del curso/actividad</a> para comenzar.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Al finalizar, indícanos aquí que lo has completado para registrar tu progreso.
                                </p>
                              </div>
                            </>
                          ) : planetId === 'ia' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  {itinerary === 'mlforkids' ? (
                                     <>Abre el reto <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>{currentItem.titulo}</a> en Machine Learning for Kids y lee las instrucciones del worksheet.</>
                                  ) : (
                                    <>Entra en la <a href={getChallengeUrl(currentItem, activeTab)} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> de LearningML y sigue las instrucciones.</>
                                  )}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  {itinerary === 'mlforkids' ? (
                                    <>Abre <a href="https://machinelearningforkids.co.uk/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>Machine Learning for Kids</a> para entrenar tu modelo y crear el proyecto en Scratch.</>
                                  ) : (
                                    <>Abre <a href="https://web.learningml.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>LearningML</a> para entrenar tu modelo de IA y construir tu proyecto.</>
                                  )}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Cuando termines, comparte una captura de pantalla o el enlace de tu proyecto con nosotros.
                                </p>
                              </div>
                            </>

                          ) : (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en la <a href={getChallengeUrl(currentItem, activeTab)} 
                                                   target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero || ''}</a> para ver las instrucciones. {(pid === 'scratch' && !activeTab.startsWith('raspberry_') && activeTab !== 'expert') ? 'Una vez dentro, clica el botón verde de "Reinventar" (Remix) y resuélvelo. Si no lo ves, asegúrate de haber iniciado sesión en tu cuenta de Scratch.' : 'Resuélvelo en el editor oficial.'}
                                </p>
                              </div>
                              {(pid?.startsWith('tinkercad') || pid === 'arduino') && (
                                <div style={{ marginLeft: '47px', marginTop: '-10px', marginBottom: '10px' }}>
                                  <p style={{ fontSize: '0.8rem', color: '#e44d26', fontWeight: '800', margin: 0 }}>
                                    ⚠️ Importante: Debes iniciar sesión en Tinkercad para acceder a este reto.
                                  </p>
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el reto con nosotros. {pid === 'scratch' && (<>(<a href="https://youtu.be/tBimjjOikSA" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>ver tutorial</a>)</>)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ margin: '0 0 24px 0', background: 'rgba(0,0,0,0.02)', padding: '24px', borderRadius: '16px' }}>
                        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.6', margin: 0 }}>
                          {currentItem.explicacion || currentItem.description || 'Completa este tutorial interactivo oficial para fortalecer tu base ninja.'}
                        </p>
                        {(pid?.startsWith('tinkercad') || pid === 'arduino') && (
                          <p style={{ fontSize: '0.8rem', color: '#e44d26', fontWeight: '800', marginTop: '10px' }}>
                            ⚠️ Importante: Debes iniciar sesión en Tinkercad para acceder a este tutorial.
                          </p>
                        )}
                        {/* Botón Centrado si es el único */}
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
                          <GlowButton 
                            onClick={() => handleAction(currentItem, 'open_only')}
                            variant="secondary"
                          >
                            Abrir Tutorial en {pid === 'scratch' ? 'Scratch' : (pid?.startsWith('tinkercad') || pid === 'arduino' ? 'Tinkercad' : (pid === 'appinventor' ? 'App Inventor' : 'MakeCode'))}
                          </GlowButton>
                        </div>
                      </div>
                    )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {itinerary === 'mlforkids' && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>
                                Nombre del Reto
                              </label>
                              <input 
                                type="text" 
                                placeholder="Ej: Smart Classroom..."
                                value={mlfkChallengeName}
                                onChange={(e) => setMlfkChallengeName(e.target.value)}
                                style={{ 
                                  width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #ddd',
                                  fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                                  fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = accentColor}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                              />
                            </div>
                            <div style={{ width: '120px' }}>
                              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>
                                Dificultad
                              </label>
                              <select 
                                value={mlfkDifficulty}
                                onChange={(e) => setMlfkDifficulty(e.target.value)}
                                style={{ 
                                  width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #ddd',
                                  fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                                  fontFamily: 'inherit', background: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = accentColor}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                              >
                                <option value="">Nivel...</option>
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                              </select>
                            </div>
                          </div>
                        )}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Opción A: URL de tu proyecto
                          </label>
                          <input 
                            type="text" 
                            placeholder={planetId === 'scratch' ? "Pega aquí el enlace de tu proyecto..." : 
                                        (planetId === 'makecode-arcade' ? "Pega el enlace compartido..." : 
                                        (planetId?.startsWith('tinkercad') ? "Pega la URL de tu diseño..." : "Pega aquí el enlace de tu proyecto..."))}
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            style={{ 
                              width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #ddd',
                              fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                              fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = accentColor}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                          />
                        </div>

                        <div style={{ position: 'relative' }}>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Opción B: Adjuntar archivo
                          </label>
                          <input 
                            type="file" 
                            id="evidence-file-input"
                            accept="image/*,video/*,.pdf,.zip,.sb3,.aia,.py,.ino,.hex,.json"
                            onChange={(e) => setEvidenceFile(e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                          <label 
                            htmlFor="evidence-file-input"
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                              borderRadius: '12px', border: '2px dashed #ddd', cursor: 'pointer',
                              background: evidenceFile ? `${accentColor}05` : 'white',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '8px', 
                              background: evidenceFile ? accentColor : '#f0f0f0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {evidenceFile ? <FileText size={16} color="white" /> : <Upload size={16} color="#666" />}
                            </div>
                            <span style={{ fontSize: '0.85rem', color: evidenceFile ? '#1a1a2e' : '#666', fontWeight: evidenceFile ? '600' : '400', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {evidenceFile ? evidenceFile.name : 'Haz clic para elegir un archivo (.sb3, .aia, captura, pdf, zip...)'}
                            </span>
                            {evidenceFile && (
                              <button 
                                onClick={(e) => { e.preventDefault(); setEvidenceFile(null); }}
                                style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer', padding: '5px' }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {(currentProgress?.status === 'En revisión' || currentProgress?.status === 'Corregir') && (
                      <div style={{ marginBottom: '25px', padding: '15px', borderRadius: '16px', background: `${accentColor}0a`, border: `1px dashed ${accentColor}40`, textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: '#444', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                          Tu entrega ya está registrada. ¡Habla con el Sensei en el chat para validar tus conocimientos y completar el reto!
                        </p>
                        <GlowButton 
                          onClick={() => {
                            if (onValidateChallenge) {
                              onValidateChallenge(
                                currentItem, 
                                currentProgress.evidence_url || evidenceUrl || '', 
                                progressKey, 
                                currentProgress.evidence_file_url || null
                              );
                            }
                            setSelectedTutorial(null);
                          }}
                          fullWidth
                          variant="primary"
                          style={{ padding: '14px', fontSize: '1rem', borderRadius: '12px' }}
                        >
                          💬 Hablar con el Sensei para Validar
                        </GlowButton>
                      </div>
                    )}

                    <GlowButton 
                      onClick={() => handleAction(currentItem, isTutorial ? 'tutorial' : 'challenge')}
                      fullWidth
                      variant="primary"
                      style={{ marginTop: '20px', padding: '18px', fontSize: '1.1rem', borderRadius: '16px' }}
                      disabled={isSubmitting || (!evidenceUrl && !evidenceFile)}
                    >
                      {isSubmitting ? 'Enviando...' : 
                      (currentProgress?.status === 'En revisión' || currentProgress?.status === 'Corregir') ? 'Actualizar y Reenviar' : 
                      (isAutodidact ? 'Validar con el Sensei' : 'Validar mi Reto')}
                    </GlowButton>
                  </div>
                );
              })()}
            </GlassCard>
        </div>
      )}

      {/* 🏅 MODAL DE FEEDBACK DE MILESTONE */}
      {selectedMilestone && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '20px'
        }}>
          <GlassCard style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedMilestone(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '50%', background: selectedMilestone.status === 'Corregir' ? '#ffebeb' : (selectedMilestone.status === 'Validado' ? `${accentColor}15` : '#f0f0f0'),
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'
              }}>
                {selectedMilestone.status === 'Corregir' ? <AlertTriangle size={30} color="#ff4b4b" /> : <Medal size={30} color={selectedMilestone.status === 'Validado' ? accentColor : '#999'} />}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 5px 0' }}>{selectedMilestone.label}</h3>
              <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>Estado: <strong style={{ color: selectedMilestone.status === 'Corregir' ? '#ff4b4b' : (selectedMilestone.status === 'Validado' ? '#22c55e' : '#666') }}>{selectedMilestone.status || (selectedMilestone.reached ? 'Completado (Pendiente de Validación)' : 'En Progreso')}</strong></p>
            </div>

            {selectedMilestone.teacher_feedback && (
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>Feedback del Profesor</p>
                <p style={{ fontSize: '0.95rem', color: '#1a1a2e', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                  "{selectedMilestone.teacher_feedback}"
                </p>
              </div>
            )}

            {!selectedMilestone.status && selectedMilestone.reached && (
              <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
                Has completado todos los retos de este nivel. ¡Solicita tu validación para obtener la insignia oficial!
              </p>
            )}

            <GlowButton 
              onClick={() => setSelectedMilestone(null)}
              fullWidth
              variant="primary"
            >
              Cerrar
            </GlowButton>
          </GlassCard>
        </div>
      )}

      {/* GRID VIEW CONTAINER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* CONTEXTUAL HEADER (Guía persistente rápida) */}
        {activeTab === 'challenges' && planetId?.toLowerCase() === 'scratch' && (
           <GlassCard style={{ 
             padding: '15px', background: 'linear-gradient(135deg, #fff 0%, #f0f7ff 100%)', border: '1px solid #d0e7ff',
             display: 'flex', alignItems: 'center', justifyContent: 'space-between'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Sparkles size={18} color={accentColor} />
               <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700' }}>¡Selecciona un reto para empezar!</p>
             </div>
             <a href={planetId === 'scratch' ? "https://youtu.be/tBimjjOikSA" : "https://microbit.org/es-es/projects/make-it-code-it/"} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>Ver guía de ayuda</a>
           </GlassCard>
        )}

        {/* LEGAL DISCLAIMER */}
        <div style={{ 
          padding: '15px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.05)', marginBottom: '10px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: accentColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Atribución y Derechos de Autor
          </p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', lineHeight: '1.4', fontStyle: 'italic' }}>
            Los contenidos y recursos utilizados en este cuaderno tienen carácter educativo y están destinados al apoyo del proceso de enseñanza-aprendizaje. 
            Parte de los materiales han sido obtenidos de fuentes externas ({
              planetId === 'scratch' ? (
                <>
                  <a href="https://www.robotix.es/es/actividades-scratch" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Robotix</a> y <a href="https://projects.raspberrypi.org/es-ES/technology/scratch" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Raspberry Pi Foundation</a>
                </>
              ) : 
              planetId?.includes('microbit') ? <a href="https://microbit.org/es-es/projects/make-it-code-it/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: Micro:bit Educational Foundation</a> : 
              itinerary === 'blockscad' ? (
                <>
                  <a href="https://microbit.org/es-es/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Micro:bit Educational Foundation</a> y <a href="https://www.picuino.com/es/blockscad-index.html" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>picuino.com</a>
                </>
              ) :
              planetId === 'makecode-arcade' ? <a href="https://www.weteachrobotics.com/videojuegos/proyecto-con-makecode-arcade/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: OBO We Teach Robotics</a> : 
              planetId === 'code' ? (
                <>
                   <a href="https://code.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Code.org</a>, <a href="https://www.picuino.com/es/prog-codeorg.html" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>picuino.com</a> y <a href="https://csforall.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>csforall.org</a>
                </>
              ) :
              planetId === 'python' ? (
                <>
                  <a href="https://silentteacher.toxicode.fr/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Silent Teacher</a>, <a href="https://www.picuino.com/es/python-index.html" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Picuino</a>, <a href="https://projects.raspberrypi.org/en/projects?software%5B%5D=python" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Raspberry Pi</a>, <a href="https://www.codedex.io/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Codédex</a>, <a href="https://www.coding-for-kids.com/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Coding for Kids</a> y <a href="https://www.freecodecamp.org/learn/scientific-computing-with-python/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>FreeCodeCamp</a>.
                </>
              ) :
              planetId === 'arduino' ? (
                <>
                  <a href="https://www.luisllamas.es/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Luis Llamas</a>, <a href="https://www.tinkercad.com/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Autodesk Tinkercad</a>, <a href="https://lopegonzalez.es/eso-y-bachillerato/proyectos-con-arduino/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>lopegonzalez</a>, <a href="https://makinando.github.io/practicas_arduino/index.html" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>makinando</a> y <a href="https://angelmicelti.github.io/TecnoVilladiego3/5ProgSisCont/ArduinoBlocks/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>angelmicelti</a>
                </>
              ) :
              planetId === 'html' ? (
                <>
                  <a href="https://code.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Code.org</a>, <a href="https://projects.raspberrypi.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Raspberry Pi Foundation</a>, <a href="https://www.luisllamas.es/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Luis Llamas</a>, recursos de MDN Web Docs, <a href="https://learnjavascript.online" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Learn JavaScript Online</a> (Jad Joubran) y <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>FreeCodeCamp</a>.
                </>
              ) :
              planetId === 'appinventor' ? (
                <>
                  <a href="https://www.profedeinformatica.es/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Justo Rodríguez Orta</a>, <a href="https://projects.raspberrypi.org/en/coderdojo/app-inventor-for-social-enterprise" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Raspberry Pi Foundation</a> y recursos oficiales de <a href="https://appinventor.mit.edu/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>MIT App Inventor</a>.
                </>
              ) :
              planetId === 'ia' ? (
                <>
                  <a href="https://www.learningml.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>LearningML.org</a> y <a href="https://machinelearningforkids.co.uk/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Machine Learning for Kids</a>.
                </>
              ) :
              (planetId?.startsWith('tinkercad') || planetId === '3d') ? (
                <>
                  <a href="https://www.tinkercad.com/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Autodesk Tinkercad</a>, <a href="https://www.picuino.com/es/blockscad-index.html" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Picuino</a>, <a href="https://infoytic.blogspot.com/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>infoytic.blogspot.com</a> y <a href="https://www.educa2.madrid.org/web/jsanzleyva/tinkercad" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>educa2.madrid.org</a>.
                </>
              ) : 'Fuentes educativas oficiales'
            }), respetando en todo momento sus condiciones de uso y derechos de autor. Siempre que ha sido posible, se ha indicado la autoría correspondiente. 
            Si algún contenido vulnera derechos de propiedad intelectual, puede solicitarse su retirada.
          </p>
        </div>

        {/* UNIFIED GRID O CATEGORIZADO */}
        {((activeTab === 'tutorials' && (planetId?.startsWith('tinkercad') || planetId === 'scratch'))) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
            {Object.entries(tutorialsByCategory).map(([category, items]) => (
              <div key={category}>
                <h4 style={{ 
                  margin: '0 0 15px 10px', fontSize: '0.9rem', fontWeight: '800', 
                  color: planetId?.startsWith('tinkercad') ? (category === 'Bloques de Código' ? '#6c5ce7' : '#0088CC') : '#666', 
                  textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  {category} <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.05)' }} />
                </h4>
                <div style={{ 
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: '12px',
                  background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '24px'
                }}>
                  {items.map((item, index) => (
                    <div key={item.id}>
                      {renderChallengeCard(item, true, index)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: '12px',
            background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '24px'
          }}>
            {activeList.map((item, index) => (
              <div key={item.id || item.numero || `item-${index}`}>
                {renderChallengeCard(item, activeTab === 'tutorials', index)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



function LockIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
