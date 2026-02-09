import React, { useState, useEffect } from 'react';
import { Dumbbell, Timer, TrendingUp, Play, Pause, RotateCcw, Check, ChevronRight, Calendar, Flame, Target, Award } from 'lucide-react';

const FitnessApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [timerMode, setTimerMode] = useState('ready'); // 'ready', 'countdown', 'exercise', 'rest'
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState([]);
  const [customVideoLinks, setCustomVideoLinks] = useState({});
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    currentStreak: 0,
    weeklyWorkouts: 0
  });

  // Badge definitions
  const badges = {
    first_session: {
      id: 'first_session',
      name: 'Première Séance',
      description: 'Complète ta première séance',
      icon: '🎯',
      tier: 'bronze',
      condition: (stats) => stats.totalWorkouts >= 1
    },
    warrior_3: {
      id: 'warrior_3',
      name: 'Guerrier 3 Jours',
      description: '3 jours consécutifs',
      icon: '🔥',
      tier: 'bronze',
      condition: (stats) => stats.currentStreak >= 3
    },
    warrior_7: {
      id: 'warrior_7',
      name: 'Guerrier 7 Jours',
      description: '7 jours consécutifs',
      icon: '⚡',
      tier: 'silver',
      condition: (stats) => stats.currentStreak >= 7
    },
    warrior_30: {
      id: 'warrior_30',
      name: 'Légende Vivante',
      description: '30 jours consécutifs',
      icon: '👑',
      tier: 'gold',
      condition: (stats) => stats.currentStreak >= 30
    },
    sessions_10: {
      id: 'sessions_10',
      name: 'Novice',
      description: '10 séances complétées',
      icon: '💪',
      tier: 'bronze',
      condition: (stats) => stats.totalWorkouts >= 10
    },
    sessions_50: {
      id: 'sessions_50',
      name: 'Vétéran',
      description: '50 séances complétées',
      icon: '🦾',
      tier: 'silver',
      condition: (stats) => stats.totalWorkouts >= 50
    },
    sessions_100: {
      id: 'sessions_100',
      name: 'Centurion',
      description: '100 séances complétées',
      icon: '🏆',
      tier: 'gold',
      condition: (stats) => stats.totalWorkouts >= 100
    },
    time_10h: {
      id: 'time_10h',
      name: 'Marathonien',
      description: '10 heures d\'entraînement',
      icon: '⏱️',
      tier: 'bronze',
      condition: (stats) => stats.totalMinutes >= 600
    },
    time_50h: {
      id: 'time_50h',
      name: 'Ultra Marathonien',
      description: '50 heures d\'entraînement',
      icon: '⌛',
      tier: 'silver',
      condition: (stats) => stats.totalMinutes >= 3000
    },
    time_100h: {
      id: 'time_100h',
      name: 'Machine Infernale',
      description: '100 heures d\'entraînement',
      icon: '🚀',
      tier: 'gold',
      condition: (stats) => stats.totalMinutes >= 6000
    },
    weekly_5: {
      id: 'weekly_5',
      name: 'Semaine de Fou',
      description: '5 séances en une semaine',
      icon: '🌟',
      tier: 'silver',
      condition: (stats) => stats.weeklyWorkouts >= 5
    },
    weekly_7: {
      id: 'weekly_7',
      name: 'Tous les Jours',
      description: '7 séances en une semaine',
      icon: '💎',
      tier: 'gold',
      condition: (stats) => stats.weeklyWorkouts >= 7
    }
  };

  // Parse time from reps string (ex: "3 min" -> 180 seconds, "30 sec" -> 30)
  const parseTimeFromReps = (reps) => {
    if (typeof reps !== 'string') return null;
    const minMatch = reps.match(/(\d+)\s*min/i);
    if (minMatch) return parseInt(minMatch[1]) * 60;
    const secMatch = reps.match(/(\d+)\s*sec/i);
    if (secMatch) return parseInt(secMatch[1]);
    return null;
  };

  // Sound effects
  const playBeep = (frequency = 800, duration = 200) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  const playCountdownBeep = () => {
    playBeep(600, 100);
  };

  const playStartBeep = () => {
    playBeep(1000, 300);
  };

  const playFinishBeep = () => {
    // Triple beep for finish
    playBeep(800, 200);
    setTimeout(() => playBeep(900, 200), 250);
    setTimeout(() => playBeep(1000, 400), 500);
  };

  // Load stats from storage
  useEffect(() => {
    const loadStats = () => {
      try {
        const savedStats = localStorage.getItem('fitness-stats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
      } catch (error) {
        console.log('No stats yet');
      }
      
      // Load custom video links
      try {
        const savedLinks = localStorage.getItem('custom-video-links');
        if (savedLinks) {
          setCustomVideoLinks(JSON.parse(savedLinks));
        }
      } catch (error) {
        console.log('No custom links yet');
      }

      // Load unlocked badges
      try {
        const savedBadges = localStorage.getItem('unlocked-badges');
        if (savedBadges) {
          setUnlockedBadges(JSON.parse(savedBadges));
        }
      } catch (error) {
        console.log('No badges yet');
      }
    };
    loadStats();
  }, []);

  // Save stats to storage
  const saveStats = (newStats) => {
    try {
      localStorage.setItem('fitness-stats', JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  // Save custom video links
  const saveCustomLinks = (links) => {
    try {
      localStorage.setItem('custom-video-links', JSON.stringify(links));
      setCustomVideoLinks(links);
    } catch (error) {
      console.error('Error saving links:', error);
    }
  };

  // Get video link (custom or default)
  const getVideoLink = (exerciseId) => {
    return customVideoLinks[exerciseId] || exercises[exerciseId]?.video;
  };

  // Check and unlock new badges
  const checkBadges = (newStats) => {
    const newlyUnlocked = [];
    
    Object.values(badges).forEach(badge => {
      if (badge.condition(newStats) && !unlockedBadges.includes(badge.id)) {
        newlyUnlocked.push(badge.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      const updatedBadges = [...unlockedBadges, ...newlyUnlocked];
      setUnlockedBadges(updatedBadges);
      
      // Save to storage
      try {
        localStorage.setItem('unlocked-badges', JSON.stringify(updatedBadges));
      } catch (error) {
        console.error('Error saving badges:', error);
      }

      // Show unlock animation for first new badge
      setShowBadgeUnlock(badges[newlyUnlocked[0]]);
      setTimeout(() => setShowBadgeUnlock(null), 4000);
    }
  };

  // Countdown effect
  useEffect(() => {
    let interval;
    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            playStartBeep();
            setIsCountingDown(false);
            
            // Start exercise timer
            const currentExercise = selectedWorkout?.exercises[currentExerciseIndex];
            const exerciseTime = parseTimeFromReps(currentExercise?.reps);
            
            if (exerciseTime) {
              // Timed exercise - use countdown
              setTimerSeconds(exerciseTime);
              setTimerMode('exercise');
              setIsTimerRunning(true);
            } else {
              // Rep-based exercise - manual timer
              setTimerSeconds(0);
              setTimerMode('exercise');
              setIsTimerRunning(true);
            }
            return 0;
          }
          playCountdownBeep();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdown, selectedWorkout, currentExerciseIndex]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timerMode !== 'ready') {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const currentExercise = selectedWorkout?.exercises[currentExerciseIndex];
          const exerciseTime = parseTimeFromReps(currentExercise?.reps);
          
          if (timerMode === 'exercise' && exerciseTime) {
            // Countdown for timed exercises
            if (prev <= 1) {
              // Exercise finished
              playFinishBeep();
              
              // Check if we have more sets
              if (currentSet < (currentExercise?.sets || 1)) {
                // Start rest timer
                setTimerMode('rest');
                setTimerSeconds(currentExercise?.rest || 60);
                return currentExercise?.rest || 60;
              } else {
                // All sets done, stop
                setIsTimerRunning(false);
                setTimerMode('ready');
                return 0;
              }
            }
            return prev - 1;
          } else if (timerMode === 'rest') {
            // Countdown for rest
            if (prev <= 1) {
              // Rest finished
              playFinishBeep();
              setCurrentSet(currentSet + 1);
              
              // Start next set
              if (exerciseTime) {
                setTimerMode('exercise');
                setTimerSeconds(exerciseTime);
                return exerciseTime;
              } else {
                setTimerMode('exercise');
                setTimerSeconds(0);
                return 0;
              }
            }
            return prev - 1;
          } else {
            // Manual timer (count up)
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode, selectedWorkout, currentExerciseIndex, currentSet]);

  const programs = [
    {
      id: 'beginner',
      name: 'Débutant - Remise en Forme',
      level: 'Débutant',
      duration: '8 semaines',
      sessionsPerWeek: 3,
      description: 'Programme pour reprendre le sport en douceur avec ton équipement',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'intermediate',
      name: 'Intermédiaire - Force & Cardio',
      level: 'Intermédiaire',
      duration: '12 semaines',
      sessionsPerWeek: 4,
      description: 'Mix de musculation et cardio pour développer force et endurance',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'advanced',
      name: 'Avancé - Performance',
      level: 'Avancé',
      duration: '16 semaines',
      sessionsPerWeek: 5,
      description: 'Programme intensif pour maximiser tes performances',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const exercises = {
    // Cardio
    'rameur': {
      name: 'Rameur',
      category: 'Cardio',
      equipment: 'Rameur',
      description: 'Excellent exercice cardio qui travaille tout le corps. Garde le dos droit, pousse avec les jambes puis tire avec les bras.',
      video: 'https://www.youtube.com/watch?v=zQ82RYIFLN8',
      tips: ['Commence par 10-15 min', 'Augmente progressivement', 'Focus sur la technique']
    },
    'velo': {
      name: 'Vélo d\'appartement',
      category: 'Cardio',
      equipment: 'Vélo',
      description: 'Cardio à faible impact, parfait pour l\'endurance. Varie l\'intensité avec des intervalles.',
      video: 'https://www.youtube.com/watch?v=gm6WZKo5j7c',
      tips: ['20-30 min minimum', 'Varie la résistance', 'Reste bien droit']
    },
    'stepper': {
      name: 'Stepper/Elliptique',
      category: 'Cardio',
      equipment: 'Stepper',
      description: 'Travaille les jambes et cardio sans impact sur les articulations.',
      video: 'https://www.youtube.com/watch?v=yz2d1pXl3eU',
      tips: ['Mouvement fluide', 'Ne te penche pas trop', '15-20 min']
    },
    'corde': {
      name: 'Corde à sauter',
      category: 'Cardio',
      equipment: 'Corde',
      description: 'Cardio intense qui brûle beaucoup de calories. Commence doucement.',
      video: 'https://www.youtube.com/watch?v=hCBRz_UA32k',
      tips: ['3-5 rounds de 1 min', 'Saute sur la pointe des pieds', 'Repos 30 sec entre rounds']
    },

    // Boxe
    'sac-frappe': {
      name: 'Sac de frappe',
      category: 'Boxe',
      equipment: 'Sac + Gants',
      description: 'Travail technique et cardio intense. Jab, cross, crochets, uppercuts.',
      video: 'https://www.youtube.com/watch?v=c19a5qYWyJI',
      tips: ['3-5 rounds de 3 min', '1 min repos entre rounds', 'Garde toujours les mains en haut']
    },
    'shadow-boxing': {
      name: 'Shadow Boxing',
      category: 'Boxe',
      equipment: 'Aucun',
      description: 'Travail technique sans sac. Déplacements, esquives, combinaisons.',
      video: 'https://www.youtube.com/watch?v=ztxFu5S5mXI',
      tips: ['Focus sur la technique', 'Visualise l\'adversaire', '3 rounds de 2 min']
    },

    // Musculation avec poids
    'squat-poids': {
      name: 'Squat avec poids',
      category: 'Jambes',
      equipment: 'Poids',
      description: 'Roi des exercices jambes. Descends jusqu\'aux cuisses parallèles au sol.',
      video: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
      tips: ['3-4 séries de 12-15 reps', 'Dos droit', 'Genoux alignés avec les pieds']
    },
    'developpe-epaules': {
      name: 'Développé épaules',
      category: 'Épaules',
      equipment: 'Poids',
      description: 'Assis ou debout, monte les poids au-dessus de la tête.',
      video: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
      tips: ['3 séries de 10-12 reps', 'Contrôle la descente', 'Ne cambre pas le dos']
    },
    'curl-biceps': {
      name: 'Curl biceps',
      category: 'Bras',
      equipment: 'Poids',
      description: 'Flexion des coudes pour travailler les biceps.',
      video: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
      tips: ['3 séries de 12-15 reps', 'Coudes fixes', 'Mouvement contrôlé']
    },
    'extension-triceps': {
      name: 'Extension triceps',
      category: 'Bras',
      equipment: 'Poids',
      description: 'Derrière la tête ou penché, extension pour les triceps.',
      video: 'https://www.youtube.com/watch?v=nRiJVZDpdL0',
      tips: ['3 séries de 12-15 reps', 'Seul l\'avant-bras bouge', 'Contrôle']
    },

    // Élastiques
    'elastique-pectoraux': {
      name: 'Pectoraux élastiques',
      category: 'Pectoraux',
      equipment: 'Élastiques',
      description: 'Écartés ou développé avec élastiques attachés.',
      video: 'https://www.youtube.com/watch?v=Jd3UCensus',
      tips: ['3 séries de 15-20 reps', 'Contracte bien les pecs', 'Contrôle le retour']
    },
    'elastique-dos': {
      name: 'Tirage dos élastiques',
      category: 'Dos',
      equipment: 'Élastiques',
      description: 'Tire l\'élastique vers toi en contractant le dos.',
      video: 'https://www.youtube.com/watch?v=eIq5CB9JfKE',
      tips: ['3 séries de 15-20 reps', 'Omoplates serrées', 'Dos droit']
    },
    'elastique-jambes': {
      name: 'Jambes élastiques',
      category: 'Jambes',
      equipment: 'Élastiques',
      description: 'Extensions latérales, squats avec résistance.',
      video: 'https://www.youtube.com/watch?v=Tp_p-RIPM_k',
      tips: ['3 séries de 20 reps', 'Tension constante', 'Contrôle']
    },

    // Poids du corps
    'pompes': {
      name: 'Pompes',
      category: 'Pectoraux',
      equipment: 'Poids du corps',
      description: 'L\'exercice roi pour les pectoraux et triceps.',
      video: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
      tips: ['3-4 séries max reps', 'Corps aligné', 'Descends bien']
    },
    'tractions': {
      name: 'Tractions (si possible)',
      category: 'Dos',
      equipment: 'Barre',
      description: 'Excellent pour le dos et biceps si tu as une barre.',
      video: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      tips: ['3 séries max reps', 'Menton au-dessus de la barre', 'Descends complètement']
    },
    'dips': {
      name: 'Dips',
      category: 'Triceps',
      equipment: 'Chaise',
      description: 'Sur une chaise ou banc, travaille les triceps.',
      video: 'https://www.youtube.com/watch?v=0326dy_-CzM',
      tips: ['3 séries de 15-20 reps', 'Descends bien', 'Coudes le long du corps']
    },
    'gainage': {
      name: 'Gainage',
      category: 'Abdos',
      equipment: 'Poids du corps',
      description: 'Planche sur les coudes, corps aligné.',
      video: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
      tips: ['3-4 séries de 30-60 sec', 'Corps droit', 'Respire']
    },
    'roulette-abdos': {
      name: 'Roulette à abdos',
      category: 'Abdos',
      equipment: 'Roulette',
      description: 'À genoux, roule la roulette devant toi en gardant le dos droit. Excellent pour les abdos profonds.',
      video: 'https://www.youtube.com/watch?v=yp39wLi1f_A',
      tips: ['3 séries de 10-15 reps', 'Commence à genoux', 'Garde le dos droit', 'Contrôle le retour']
    },
    'crunch': {
      name: 'Crunchs',
      category: 'Abdos',
      equipment: 'Poids du corps',
      description: 'Contraction des abdos, mains derrière la tête.',
      video: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
      tips: ['3 séries de 20-30 reps', 'Monte les épaules', 'Contrôle']
    }
  };

  const workouts = {
    beginner: [
      {
        name: 'Séance 1 - Full Body & Cardio',
        exercises: [
          { id: 'velo', sets: 1, reps: '15 min', rest: 60 },
          { id: 'squat-poids', sets: 3, reps: '12', rest: 60 },
          { id: 'pompes', sets: 3, reps: '10-15', rest: 60 },
          { id: 'elastique-dos', sets: 3, reps: '15', rest: 60 },
          { id: 'gainage', sets: 3, reps: '30 sec', rest: 45 },
          { id: 'rameur', sets: 1, reps: '10 min', rest: 0 }
        ]
      },
      {
        name: 'Séance 2 - Boxe & Cardio',
        exercises: [
          { id: 'corde', sets: 3, reps: '1 min', rest: 30 },
          { id: 'shadow-boxing', sets: 3, reps: '2 min', rest: 60 },
          { id: 'sac-frappe', sets: 4, reps: '3 min', rest: 60 },
          { id: 'stepper', sets: 1, reps: '15 min', rest: 60 },
          { id: 'gainage', sets: 3, reps: '30 sec', rest: 45 }
        ]
      },
      {
        name: 'Séance 3 - Renforcement',
        exercises: [
          { id: 'rameur', sets: 1, reps: '10 min', rest: 60 },
          { id: 'developpe-epaules', sets: 3, reps: '12', rest: 60 },
          { id: 'curl-biceps', sets: 3, reps: '12', rest: 45 },
          { id: 'extension-triceps', sets: 3, reps: '12', rest: 45 },
          { id: 'elastique-jambes', sets: 3, reps: '20', rest: 45 },
          { id: 'roulette-abdos', sets: 3, reps: '10', rest: 45 },
          { id: 'crunch', sets: 3, reps: '20', rest: 30 },
          { id: 'velo', sets: 1, reps: '10 min', rest: 0 }
        ]
      }
    ],
    intermediate: [
      {
        name: 'Séance 1 - Push (Pousse)',
        exercises: [
          { id: 'rameur', sets: 1, reps: '5 min échauffement', rest: 60 },
          { id: 'pompes', sets: 4, reps: '15-20', rest: 60 },
          { id: 'developpe-epaules', sets: 4, reps: '12', rest: 60 },
          { id: 'elastique-pectoraux', sets: 3, reps: '15', rest: 45 },
          { id: 'dips', sets: 3, reps: '15', rest: 60 },
          { id: 'extension-triceps', sets: 3, reps: '15', rest: 45 },
          { id: 'corde', sets: 5, reps: '1 min', rest: 30 }
        ]
      },
      {
        name: 'Séance 2 - Pull (Tire) & Cardio',
        exercises: [
          { id: 'velo', sets: 1, reps: '5 min', rest: 60 },
          { id: 'elastique-dos', sets: 4, reps: '15', rest: 60 },
          { id: 'curl-biceps', sets: 4, reps: '12', rest: 60 },
          { id: 'roulette-abdos', sets: 3, reps: '12', rest: 45 },
          { id: 'gainage', sets: 4, reps: '45 sec', rest: 45 },
          { id: 'rameur', sets: 1, reps: '20 min intensité modérée', rest: 0 }
        ]
      },
      {
        name: 'Séance 3 - Jambes & Explosivité',
        exercises: [
          { id: 'corde', sets: 3, reps: '2 min', rest: 45 },
          { id: 'squat-poids', sets: 4, reps: '15', rest: 60 },
          { id: 'elastique-jambes', sets: 4, reps: '20', rest: 45 },
          { id: 'stepper', sets: 1, reps: '20 min', rest: 60 },
          { id: 'crunch', sets: 4, reps: '25', rest: 30 }
        ]
      },
      {
        name: 'Séance 4 - Boxe Intensive',
        exercises: [
          { id: 'shadow-boxing', sets: 4, reps: '3 min', rest: 60 },
          { id: 'sac-frappe', sets: 6, reps: '3 min', rest: 60 },
          { id: 'corde', sets: 5, reps: '1 min', rest: 30 },
          { id: 'pompes', sets: 3, reps: '20', rest: 45 },
          { id: 'roulette-abdos', sets: 3, reps: '12', rest: 45 },
          { id: 'gainage', sets: 3, reps: '1 min', rest: 45 }
        ]
      }
    ],
    advanced: [
      {
        name: 'Séance 1 - Force Maximale',
        exercises: [
          { id: 'rameur', sets: 1, reps: '5 min', rest: 60 },
          { id: 'squat-poids', sets: 5, reps: '8-10 (lourd)', rest: 90 },
          { id: 'pompes', sets: 5, reps: '20-25', rest: 60 },
          { id: 'elastique-dos', sets: 4, reps: '15', rest: 60 },
          { id: 'developpe-epaules', sets: 4, reps: '10-12', rest: 75 },
          { id: 'roulette-abdos', sets: 4, reps: '15', rest: 60 },
          { id: 'gainage', sets: 4, reps: '1 min', rest: 45 },
          { id: 'corde', sets: 6, reps: '1 min', rest: 30 }
        ]
      },
      {
        name: 'Séance 2 - HIIT Cardio',
        exercises: [
          { id: 'velo', sets: 10, reps: '30 sec sprint / 30 sec repos', rest: 0 },
          { id: 'rameur', sets: 8, reps: '1 min intense / 1 min repos', rest: 0 },
          { id: 'corde', sets: 8, reps: '1 min / 30 sec repos', rest: 0 },
          { id: 'stepper', sets: 1, reps: '15 min récupération active', rest: 0 }
        ]
      },
      {
        name: 'Séance 3 - Hypertrophie',
        exercises: [
          { id: 'curl-biceps', sets: 5, reps: '12-15', rest: 45 },
          { id: 'extension-triceps', sets: 5, reps: '12-15', rest: 45 },
          { id: 'elastique-pectoraux', sets: 4, reps: '20', rest: 45 },
          { id: 'dips', sets: 4, reps: '20', rest: 60 },
          { id: 'roulette-abdos', sets: 4, reps: '15', rest: 45 },
          { id: 'crunch', sets: 5, reps: '30', rest: 30 },
          { id: 'rameur', sets: 1, reps: '15 min', rest: 0 }
        ]
      },
      {
        name: 'Séance 4 - Boxe Technique',
        exercises: [
          { id: 'shadow-boxing', sets: 6, reps: '3 min', rest: 60 },
          { id: 'sac-frappe', sets: 8, reps: '3 min', rest: 60 },
          { id: 'corde', sets: 8, reps: '1 min', rest: 30 },
          { id: 'pompes', sets: 4, reps: 'max', rest: 60 },
          { id: 'roulette-abdos', sets: 4, reps: '15', rest: 60 },
          { id: 'gainage', sets: 4, reps: '1 min 30', rest: 60 }
        ]
      },
      {
        name: 'Séance 5 - Endurance',
        exercises: [
          { id: 'rameur', sets: 1, reps: '30 min', rest: 120 },
          { id: 'velo', sets: 1, reps: '30 min', rest: 120 },
          { id: 'elastique-jambes', sets: 4, reps: '25', rest: 45 },
          { id: 'gainage', sets: 4, reps: '1 min 30', rest: 45 }
        ]
      }
    ]
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completeWorkout = () => {
    const newStats = {
      ...stats,
      totalWorkouts: stats.totalWorkouts + 1,
      totalMinutes: stats.totalMinutes + Math.floor(timerSeconds / 60),
      currentStreak: stats.currentStreak + 1,
      weeklyWorkouts: stats.weeklyWorkouts + 1
    };
    saveStats(newStats);
    checkBadges(newStats);
    setCurrentView('home');
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    setTimerSeconds(0);
    setCompletedSets([]);
    setIsTimerRunning(false);
    setTimerMode('ready');
    setCurrentSet(1);
  };

  const startExercise = () => {
    setCountdown(10);
    setIsCountingDown(true);
    setTimerMode('countdown');
    setCurrentSet(1);
  };

  const nextExercise = () => {
    if (currentExerciseIndex < selectedWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimerSeconds(0);
      setIsTimerRunning(false);
      setTimerMode('ready');
      setCurrentSet(1);
    }
  };

  const finishSet = () => {
    const currentExercise = selectedWorkout?.exercises[currentExerciseIndex];
    playFinishBeep();
    
    if (currentSet < (currentExercise?.sets || 1)) {
      // Start rest timer
      setTimerMode('rest');
      setTimerSeconds(currentExercise?.rest || 60);
      setIsTimerRunning(true);
    } else {
      // All sets done
      setIsTimerRunning(false);
      setTimerMode('ready');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                  <Dumbbell className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">PERFORMANCE</h1>
                  <p className="text-xs text-slate-400 font-semibold">TON PROGRAMME PERSO</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setCurrentView('badges');
                  }}
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50 flex items-center gap-2 relative"
                >
                  <Award className="w-4 h-4" />
                  TROPHÉES
                  {unlockedBadges.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                      {unlockedBadges.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCurrentView('settings');
                  }}
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50 flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  PARAMÈTRES
                </button>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setSelectedWorkout(null);
                    setCurrentExerciseIndex(0);
                  }}
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  ACCUEIL
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Home View */}
          {currentView === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-3xl font-black text-white">{stats.currentStreak}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300">Série en cours</p>
                  <p className="text-xs text-slate-500 mt-1">jours consécutifs</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-3xl font-black text-white">{stats.totalWorkouts}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300">Séances totales</p>
                  <p className="text-xs text-slate-500 mt-1">complétées</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Timer className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-3xl font-black text-white">{stats.totalMinutes}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300">Minutes totales</p>
                  <p className="text-xs text-slate-500 mt-1">d'entraînement</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-3xl font-black text-white">{stats.weeklyWorkouts}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300">Cette semaine</p>
                  <p className="text-xs text-slate-500 mt-1">séances réalisées</p>
                </div>
              </div>

              {/* Programs */}
              <div>
                <h2 className="text-3xl font-black text-white mb-6 tracking-tight">CHOISIS TON PROGRAMME</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {programs.map((program, idx) => (
                    <div
                      key={program.id}
                      className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{animationDelay: `${idx * 100}ms`}}
                      onClick={() => {
                        setSelectedProgram(program.id);
                        setCurrentView('program');
                      }}
                    >
                      <div className={`relative bg-gradient-to-br ${program.color} p-1 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30`}>
                        <div className="bg-slate-900 rounded-xl p-6 h-full">
                          <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-black text-white">
                              {program.level}
                            </span>
                            <Award className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                          </div>
                          <h3 className="text-xl font-black text-white mb-2 leading-tight">{program.name}</h3>
                          <p className="text-sm text-slate-300 mb-4">{program.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {program.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3.5 h-3.5" />
                              {program.sessionsPerWeek}x/sem
                            </span>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-white font-bold text-sm group-hover:gap-3 transition-all">
                            COMMENCER
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Program View */}
          {currentView === 'program' && selectedProgram && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button
                onClick={() => setCurrentView('home')}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← RETOUR AUX PROGRAMMES
              </button>

              <div className={`bg-gradient-to-br ${programs.find(p => p.id === selectedProgram)?.color} p-1 rounded-2xl`}>
                <div className="bg-slate-900 rounded-xl p-8">
                  <h2 className="text-3xl font-black text-white mb-2">{programs.find(p => p.id === selectedProgram)?.name}</h2>
                  <p className="text-slate-300 mb-6">{programs.find(p => p.id === selectedProgram)?.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workouts[selectedProgram]?.map((workout, idx) => (
                  <div
                    key={idx}
                    className="group cursor-pointer bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:scale-105"
                    onClick={() => {
                      setSelectedWorkout(workout);
                      setCurrentView('workout');
                      setCurrentExerciseIndex(0);
                      setCompletedSets([]);
                      setTimerSeconds(0);
                      setIsTimerRunning(false);
                      setTimerMode('ready');
                      setCurrentSet(1);
                      setIsCountingDown(false);
                      setCountdown(0);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-black text-white leading-tight">{workout.name}</h3>
                      <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                        <Play className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {workout.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="flex items-center gap-2 text-sm text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                          <span className="font-semibold">{exercises[ex.id]?.name}</span>
                          <span className="text-xs">• {ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-white font-bold text-sm group-hover:gap-3 transition-all">
                      DÉMARRER
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workout View */}
          {currentView === 'workout' && selectedWorkout && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button
                onClick={() => setCurrentView('program')}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← RETOUR AU PROGRAMME
              </button>

              {/* Timer */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 text-center">
                {isCountingDown ? (
                  <>
                    <div className="text-sm font-black text-orange-500 mb-2">PRÉPARE-TOI !</div>
                    <div className="text-8xl font-black text-white mb-4 tracking-tight animate-pulse">{countdown}</div>
                  </>
                ) : (
                  <>
                    {timerMode === 'exercise' && (
                      <div className="text-sm font-black text-green-500 mb-2">
                        EXERCICE - SÉRIE {currentSet}/{selectedWorkout.exercises[currentExerciseIndex].sets}
                      </div>
                    )}
                    {timerMode === 'rest' && (
                      <div className="text-sm font-black text-blue-500 mb-2">
                        REPOS - SÉRIE {currentSet}/{selectedWorkout.exercises[currentExerciseIndex].sets}
                      </div>
                    )}
                    {timerMode === 'ready' && (
                      <div className="text-sm font-black text-orange-500 mb-2">PRÊT À COMMENCER</div>
                    )}
                    <div className="text-6xl font-black text-white mb-4 tracking-tight">{formatTime(timerSeconds)}</div>
                  </>
                )}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {timerMode === 'ready' && !isCountingDown && (
                    <button
                      onClick={startExercise}
                      className="px-6 py-3 rounded-xl font-black text-white transition-all bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30"
                    >
                      <Play className="w-5 h-5 inline mr-2" />START (10s countdown)
                    </button>
                  )}
                  {timerMode === 'exercise' && !parseTimeFromReps(selectedWorkout.exercises[currentExerciseIndex].reps) && isTimerRunning && (
                    <button
                      onClick={finishSet}
                      className="px-6 py-3 rounded-xl font-black text-white transition-all bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30"
                    >
                      <Check className="w-5 h-5 inline mr-2" />SÉRIE TERMINÉE
                    </button>
                  )}
                  {isTimerRunning && (timerMode === 'exercise' || timerMode === 'rest') && (
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                      }}
                      className="px-6 py-3 rounded-xl font-black text-white transition-all bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                    >
                      <Pause className="w-5 h-5 inline mr-2" />PAUSE
                    </button>
                  )}
                  {!isTimerRunning && timerMode !== 'ready' && !isCountingDown && (
                    <button
                      onClick={() => setIsTimerRunning(true)}
                      className="px-6 py-3 rounded-xl font-black text-white transition-all bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30"
                    >
                      <Play className="w-5 h-5 inline mr-2" />REPRENDRE
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setTimerSeconds(0);
                      setIsTimerRunning(false);
                      setIsCountingDown(false);
                      setCountdown(0);
                      setTimerMode('ready');
                      setCurrentSet(1);
                    }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-black text-white transition-all"
                  >
                    <RotateCcw className="w-5 h-5 inline mr-2" />RESET
                  </button>
                </div>
              </div>

              {/* Current Exercise */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-1 rounded-2xl">
                <div className="bg-slate-900 rounded-xl p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-sm font-black text-orange-500 mb-2">
                        EXERCICE {currentExerciseIndex + 1}/{selectedWorkout.exercises.length}
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2">
                        {exercises[selectedWorkout.exercises[currentExerciseIndex].id]?.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <span className="font-bold">{selectedWorkout.exercises[currentExerciseIndex].sets} séries</span>
                        <span>•</span>
                        <span className="font-bold">{selectedWorkout.exercises[currentExerciseIndex].reps} reps</span>
                        <span>•</span>
                        <span className="font-bold">{selectedWorkout.exercises[currentExerciseIndex].rest}s repos</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-orange-500/20 rounded-lg">
                      <span className="text-sm font-black text-white">
                        {exercises[selectedWorkout.exercises[currentExerciseIndex].id]?.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {exercises[selectedWorkout.exercises[currentExerciseIndex].id]?.description}
                  </p>

                  <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-black text-white mb-3">CONSEILS</h4>
                    <ul className="space-y-2">
                      {exercises[selectedWorkout.exercises[currentExerciseIndex].id]?.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={getVideoLink(selectedWorkout.exercises[currentExerciseIndex].id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-black text-white transition-all shadow-lg shadow-red-500/30"
                  >
                    <Play className="w-5 h-5" />
                    VOIR LA VIDÉO
                  </a>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1));
                    setTimerSeconds(0);
                    setIsTimerRunning(false);
                    setTimerMode('ready');
                    setCurrentSet(1);
                  }}
                  disabled={currentExerciseIndex === 0}
                  className="flex-1 px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 disabled:bg-slate-900/50 disabled:text-slate-600 rounded-xl font-black text-white transition-all disabled:cursor-not-allowed"
                >
                  ← PRÉCÉDENT
                </button>
                
                {currentExerciseIndex < selectedWorkout.exercises.length - 1 ? (
                  <button
                    onClick={nextExercise}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl font-black text-white transition-all shadow-lg shadow-orange-500/30"
                  >
                    SUIVANT →
                  </button>
                ) : (
                  <button
                    onClick={completeWorkout}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-black text-white transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    TERMINER LA SÉANCE
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Badges View */}
          {currentView === 'badges' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button
                onClick={() => setCurrentView('home')}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← RETOUR À L'ACCUEIL
              </button>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-1 rounded-2xl">
                <div className="bg-slate-900 rounded-xl p-8">
                  <h2 className="text-3xl font-black text-white mb-2">🏆 TROPHÉES</h2>
                  <p className="text-slate-300">Collectionne tous les badges en t'entraînant !</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{unlockedBadges.length}</div>
                      <div className="text-xs text-slate-400">DÉBLOQUÉS</div>
                    </div>
                    <div className="text-slate-600 text-2xl">/</div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-400">{Object.keys(badges).length}</div>
                      <div className="text-xs text-slate-400">TOTAL</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bronze Badges */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-black text-orange-400 mb-6 flex items-center gap-2">
                  🥉 BRONZE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(badges).filter(b => b.tier === 'bronze').map(badge => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-6 rounded-xl border transition-all ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/50 shadow-lg shadow-orange-500/10'
                            : 'bg-slate-800/30 border-slate-700/30 opacity-50 grayscale'
                        }`}
                      >
                        <div className="text-5xl mb-3 text-center">{badge.icon}</div>
                        <h4 className="text-lg font-black text-white mb-1 text-center">{badge.name}</h4>
                        <p className="text-sm text-slate-400 text-center">{badge.description}</p>
                        {isUnlocked && (
                          <div className="mt-3 text-center">
                            <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs font-black text-green-500">
                              ✓ DÉBLOQUÉ
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Silver Badges */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-black text-slate-300 mb-6 flex items-center gap-2">
                  🥈 ARGENT
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(badges).filter(b => b.tier === 'silver').map(badge => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-6 rounded-xl border transition-all ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-slate-400/50 shadow-lg shadow-slate-500/10'
                            : 'bg-slate-800/30 border-slate-700/30 opacity-50 grayscale'
                        }`}
                      >
                        <div className="text-5xl mb-3 text-center">{badge.icon}</div>
                        <h4 className="text-lg font-black text-white mb-1 text-center">{badge.name}</h4>
                        <p className="text-sm text-slate-400 text-center">{badge.description}</p>
                        {isUnlocked && (
                          <div className="mt-3 text-center">
                            <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs font-black text-green-500">
                              ✓ DÉBLOQUÉ
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gold Badges */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-black text-yellow-500 mb-6 flex items-center gap-2">
                  🥇 OR
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(badges).filter(b => b.tier === 'gold').map(badge => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-6 rounded-xl border transition-all ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                            : 'bg-slate-800/30 border-slate-700/30 opacity-50 grayscale'
                        }`}
                      >
                        <div className="text-5xl mb-3 text-center">{badge.icon}</div>
                        <h4 className="text-lg font-black text-white mb-1 text-center">{badge.name}</h4>
                        <p className="text-sm text-slate-400 text-center">{badge.description}</p>
                        {isUnlocked && (
                          <div className="mt-3 text-center">
                            <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs font-black text-green-500">
                              ✓ DÉBLOQUÉ
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button
                onClick={() => setCurrentView('home')}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                ← RETOUR À L'ACCUEIL
              </button>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-1 rounded-2xl">
                <div className="bg-slate-900 rounded-xl p-8">
                  <h2 className="text-3xl font-black text-white mb-2">PARAMÈTRES</h2>
                  <p className="text-slate-300 mb-4">Personnalise les liens vidéo de tes exercices</p>
                  <p className="text-sm text-slate-400">💡 Astuce : Cherche "Tibo InShape [exercice]" sur YouTube et colle le lien ici !</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-black text-white mb-6">LIENS VIDÉO DES EXERCICES</h3>
                <div className="space-y-4">
                  {Object.entries(exercises).map(([id, exercise]) => (
                    <div key={id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-black text-white mb-1">{exercise.name}</h4>
                          <p className="text-xs text-slate-400">{exercise.category} • {exercise.equipment}</p>
                        </div>
                        <span className="px-3 py-1 bg-orange-500/20 rounded-lg text-xs font-black text-orange-500">
                          {exercise.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customVideoLinks[id] || ''}
                          onChange={(e) => {
                            const newLinks = { ...customVideoLinks, [id]: e.target.value };
                            setCustomVideoLinks(newLinks);
                          }}
                          placeholder={exercise.video || 'https://www.youtube.com/watch?v=...'}
                          className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 text-sm"
                        />
                        <button
                          onClick={() => saveCustomLinks(customVideoLinks)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-black text-white text-sm transition-all"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        {customVideoLinks[id] && (
                          <button
                            onClick={() => {
                              const newLinks = { ...customVideoLinks };
                              delete newLinks[id];
                              setCustomVideoLinks(newLinks);
                              saveCustomLinks(newLinks);
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-black text-white text-sm transition-all"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {customVideoLinks[id] && (
                        <p className="text-xs text-green-500 mt-2 font-bold">✓ Lien personnalisé enregistré</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/50 flex gap-4">
                  <button
                    onClick={() => saveCustomLinks(customVideoLinks)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-black text-white transition-all shadow-lg shadow-green-500/30"
                  >
                    💾 SAUVEGARDER TOUS LES LIENS
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Réinitialiser tous les liens personnalisés ?')) {
                        setCustomVideoLinks({});
                        saveCustomLinks({});
                      }
                    }}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-black text-white transition-all"
                  >
                    🔄 RÉINITIALISER TOUT
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Badge Unlock Notification */}
        {showBadgeUnlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-1 rounded-3xl animate-in zoom-in duration-500 pointer-events-auto shadow-2xl shadow-orange-500/50">
              <div className="bg-slate-900 rounded-2xl p-8 text-center">
                <div className="text-8xl mb-4 animate-bounce">{showBadgeUnlock.icon}</div>
                <div className="text-sm font-black text-orange-500 mb-2">TROPHÉE DÉBLOQUÉ !</div>
                <h3 className="text-3xl font-black text-white mb-2">{showBadgeUnlock.name}</h3>
                <p className="text-slate-300">{showBadgeUnlock.description}</p>
                <div className="mt-4 px-4 py-2 bg-orange-500/20 rounded-lg inline-block">
                  <span className={`text-sm font-black ${
                    showBadgeUnlock.tier === 'gold' ? 'text-yellow-500' :
                    showBadgeUnlock.tier === 'silver' ? 'text-slate-300' :
                    'text-orange-400'
                  }`}>
                    {showBadgeUnlock.tier === 'gold' ? '🥇 OR' :
                     showBadgeUnlock.tier === 'silver' ? '🥈 ARGENT' :
                     '🥉 BRONZE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessApp;