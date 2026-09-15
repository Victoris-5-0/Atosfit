import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { updateUserProfile } from '../../utils/db';
import fullBodyImg from './full body.png';
import shouldersImg from './shoulders.png';
import bicepsImg from './biceps.png';
import backImg from './back.png';
import chestImg from './chest.png';
import coreImg from './core.png';
import glutesImg from './glutes.png';
import legsImg from './legs.png';
import veryThinImg from './رفيع.webp';
import slightlyThinImg from './زياده بسيطه.webp';
import normalImg from './معتدل.webp';
import overweightImg from './وزن زائد.webp';
import fatImg from './سمين.webp';
import highObesityImg from './سمنه عاليه.webp';
import extremeObesityImg from './سمنه مفرطه.webp';

const totalSteps = 11;

const stepMeta = [
  { label: 'Profile', eyebrow: 'Identity', title: 'Build your training profile', description: 'Start with the basics so ATOS-fit can shape a plan around you.', icon: 'Sparkles' },
  { label: 'Identity', eyebrow: 'Personalization', title: 'Choose the profile that fits you', description: 'This helps tune visuals, language, and recommendations during setup.', icon: 'Users' },
  { label: 'Weight', eyebrow: 'Baseline', title: 'Set your current body weight', description: 'We use this as the first marker in your transformation dashboard.', icon: 'Scale' },
  { label: 'Physique', eyebrow: 'Goal shape', title: 'Pick the physique direction', description: 'Choose the destination that best matches how you want to train.', icon: 'Target' },
  { label: 'Focus', eyebrow: 'Training emphasis', title: 'Select your priority areas', description: 'Choose one or more areas so your workouts feel immediately relevant.', icon: 'ScanLine' },
  { label: 'Metrics', eyebrow: 'Measurements', title: 'Calibrate your body metrics', description: 'These details help balance intensity, volume, and progression.', icon: 'Ruler' },
  { label: 'Schedule', eyebrow: 'Routine design', title: 'Choose your training window', description: 'The best plan is the one that fits your real day.', icon: 'Clock3' },
  { label: 'Level', eyebrow: 'Readiness', title: 'Set your current fitness level', description: 'We will match exercise complexity and coaching cues to your experience.', icon: 'Gauge' },
  { label: 'Coaching', eyebrow: 'Guidance style', title: 'Tell us how much direction you want', description: 'This tunes how prescriptive your workouts and recommendations should be.', icon: 'Quote' },
  { label: 'Success', eyebrow: 'Motivation', title: 'Define what progress means', description: 'Select the wins that will keep you coming back.', icon: 'Trophy' },
  { label: 'Plan', eyebrow: 'Launch', title: 'Your transformation blueprint is ready', description: 'Review the plan signals ATOS-fit will use to personalize your next steps.', icon: 'Rocket' },
];

const focusAreaOptions = [
  { id: 'fullbody', label: 'Full Body', image: fullBodyImg },
  { id: 'shoulders', label: 'Shoulders', image: shouldersImg },
  { id: 'biceps', label: 'Biceps', image: bicepsImg },
  { id: 'back', label: 'Back', image: backImg },
  { id: 'chest', label: 'Chest', image: chestImg },
  { id: 'core', label: 'Core', image: coreImg },
  { id: 'glutes', label: 'Glutes', image: glutesImg },
  { id: 'legs', label: 'Legs', image: legsImg },
];

const physiqueOptions = [
  {
    id: 'lean',
    label: 'Lean',
    description: 'Visible definition, lighter volume, clean conditioning.',
    image: veryThinImg,
    icon: 'Wind',
  },
  {
    id: 'muscular',
    label: 'Muscular',
    description: 'Balanced strength, shape, and progressive overload.',
    image: normalImg,
    icon: 'Dumbbell',
  },
  {
    id: 'ripped',
    label: 'Ripped',
    description: 'High definition, focused intensity, disciplined recovery.',
    image: slightlyThinImg,
    icon: 'Flame',
  },
];

const workoutTimeOptions = [
  { id: 'early_morning', icon: 'Sunrise', label: 'Early morning', time: '5-7 AM', description: 'Quiet start, high focus, fewer distractions.' },
  { id: 'morning', icon: 'Sun', label: 'Morning', time: '7-10 AM', description: 'Build momentum before the day gets crowded.' },
  { id: 'midday', icon: 'CloudSun', label: 'Midday', time: '12-2 PM', description: 'Reset energy and break up long work blocks.' },
  { id: 'afternoon', icon: 'Timer', label: 'Afternoon', time: '3-5 PM', description: 'Use the natural performance lift later in the day.' },
  { id: 'evening', icon: 'Sunset', label: 'Evening', time: '5-7 PM', description: 'Train after work and transition into recovery.' },
  { id: 'night', icon: 'Moon', label: 'Night', time: '7-9 PM', description: 'A calm, focused finish for late schedules.' },
];

const fitnessLevelOptions = [
  { id: 'beginner', color: 'bg-emerald-400', label: 'Beginner', description: "New to fitness or haven't trained consistently.", details: 'Simple movements, slower progressions, more coaching cues.' },
  { id: 'intermediate', color: 'bg-amber-400', label: 'Intermediate', description: 'Some experience and regular training rhythm.', details: 'Balanced volume, structured progression, form refinement.' },
  { id: 'advanced', color: 'bg-rose-500', label: 'Advanced', description: 'Consistent training and complex movement control.', details: 'Higher intensity, more variety, tighter performance targets.' },
];

const successMetricOptions = [
  { id: 'clothes_fit', icon: 'Shirt', label: 'Clothes fit comfortably', description: 'Body composition and confidence.' },
  { id: 'two_weeks', icon: 'CalendarCheck', label: 'Complete two weeks of workouts', description: 'Consistency and discipline.' },
  { id: 'stairs', icon: 'Footprints', label: 'Climb stairs without getting winded', description: 'Cardio capacity and stamina.' },
  { id: 'sleep', icon: 'Moon', label: 'Sleep better at night', description: 'Recovery and stress balance.' },
  { id: 'focus', icon: 'Brain', label: 'Feel focused at work', description: 'Energy and mental clarity.' },
  { id: 'noticed_changes', icon: 'MessageCircle', label: 'People notice visible changes', description: 'Transformation feedback.' },
  { id: 'energetic', icon: 'Zap', label: 'More energy all day', description: 'Sustained vitality.' },
];

const weightProfiles = [
  { max: 50, label: 'Very light frame', image: veryThinImg, note: 'We will prioritize careful progression.' },
  { max: 65, label: 'Light frame', image: slightlyThinImg, note: 'A good base for lean muscle building.' },
  { max: 80, label: 'Balanced baseline', image: normalImg, note: 'Great range for balanced recomposition.' },
  { max: 95, label: 'Strength baseline', image: overweightImg, note: 'We will balance conditioning with strength.' },
  { max: 110, label: 'Higher mass', image: fatImg, note: 'Low-impact consistency will matter most.' },
  { max: 130, label: 'High mass', image: highObesityImg, note: 'We will protect joints while building capacity.' },
  { max: Infinity, label: 'Very high mass', image: extremeObesityImg, note: 'Small sustainable wins will drive progress.' },
];

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const getWeightProfile = (weight) => weightProfiles.find((profile) => weight < profile.max) || weightProfiles[2];

const getLabelById = (options, id) => options.find((option) => option.id === id)?.label || 'Not selected';

const getSelectedLabels = (options, selectedIds) => {
  if (!selectedIds?.length) return 'None yet';
  return options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.label)
    .join(', ');
};

const StepHeader = ({ meta }) => (
  <div className="mx-auto max-w-2xl text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] border border-primary/30 bg-primary/10 text-primary shadow-[0_0_28px_rgba(255,165,0,0.16)]">
      <Icon name={meta.icon} size={22} />
    </div>
    <p className="mt-4 text-sm font-semibold text-primary">{meta.eyebrow}</p>
    <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{meta.title}</h1>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{meta.description}</p>
  </div>
);

const SelectionTile = ({ selected, icon, title, subtitle, detail, onClick, children, className = '' }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={classNames(
      'group relative w-full rounded-[8px] border p-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
      selected
        ? 'border-primary bg-primary/12 shadow-[0_14px_36px_rgba(255,165,0,0.14)]'
        : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]',
      className
    )}
  >
    <div className="flex items-start gap-3">
      <span className={classNames(
        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px] border',
        selected ? 'border-primary/40 bg-primary text-black' : 'border-border bg-muted text-foreground'
      )}>
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-foreground">{title}</span>
        {subtitle && <span className="mt-1 block text-sm font-medium text-muted-foreground">{subtitle}</span>}
        {detail && <span className="mt-2 block text-xs leading-5 text-muted-foreground">{detail}</span>}
      </span>
      {selected && (
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-black">
          <Icon name="Check" size={16} strokeWidth={3} />
        </span>
      )}
    </div>
    {children}
  </button>
);

const ImageChoice = ({ selected, image, title, subtitle, icon, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={classNames(
      'group relative overflow-hidden rounded-[8px] border p-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
      selected
        ? 'border-primary bg-primary/12 shadow-[0_14px_40px_rgba(255,165,0,0.16)]'
        : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]'
    )}
  >
    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-[8px] bg-muted sm:mb-4">
      <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/15 bg-black/35 text-primary backdrop-blur">
        <Icon name={icon} size={17} />
      </span>
    </div>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
      </div>
      {selected && (
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-black">
          <Icon name="Check" size={16} strokeWidth={3} />
        </span>
      )}
    </div>
  </button>
);

const RangeControl = ({ label, value, unit, min, max, minLabel, maxLabel, middleLabel, gradient, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <span className="rounded-[8px] border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {value} {unit}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${percentage}%`, background: gradient }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(event) => onChange(parseFloat(event.target.value))}
          className="absolute inset-0 h-3 w-full cursor-pointer appearance-none bg-transparent accent-primary"
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        {middleLabel && <span>{middleLabel}</span>}
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};

const InsightStrip = ({ icon = 'Info', title, text }) => (
  <div className="flex items-start gap-3 rounded-[8px] border border-primary/15 bg-primary/8 p-4">
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-primary/15 text-primary">
      <Icon name={icon} size={17} />
    </span>
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  </div>
);

const MiniStat = ({ label, value, icon }) => (
  <div className="rounded-[8px] border border-border/80 bg-background/45 p-3">
    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
      <Icon name={icon} size={15} />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { principal } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    bodyWeight: 70,
    alignmentScore: 0,
    physique: '',
    successMetrics: [],
    focusAreas: [],
    workoutTime: '',
    age: 30,
    height: 175,
    weight: 70,
    fitnessLevel: 'intermediate',
    goals: [],
  });

  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const activeMeta = stepMeta[currentStep - 1];
  const weightProfile = useMemo(() => getWeightProfile(formData.bodyWeight), [formData.bodyWeight]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if ((user.onboardingCompleted || (user.name && user.email)) && !user.skippedOnboarding) {
          navigate('/dashboard', { replace: true });
          return;
        }
        setFormData((prev) => ({ ...prev, ...user }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((step) => step + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  };

  const saveAndExit = (skippedOnboarding = false) => {
    const principalId = principal?.toString() || `local_user_${Date.now()}`;
    const now = new Date().toISOString();
    const userProfile = {
      ...formData,
      id: principalId,
      principalId,
      name: formData.name || 'New User',
      email: formData.email || '',
      createdAt: now,
      updatedAt: now,
      onboardingCompleted: !skippedOnboarding,
      skippedOnboarding,
    };

    localStorage.setItem('user', JSON.stringify(userProfile));
    return { principalId, userProfile };
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { principalId, userProfile } = saveAndExit(false);
      if (principal?.toString()) {
        await updateUserProfile(principalId, userProfile);
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to save user profile:', error);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    saveAndExit(true);
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={formData.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                placeholder="Enter your full name"
                required
                prefix={<Icon name="User" size={17} className="text-muted-foreground" />}
                className="h-12 rounded-[8px] border-border/80 bg-white/[0.035] text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/60"
              />
              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={(event) => handleInputChange('email', event.target.value)}
                placeholder="Optional"
                prefix={<Icon name="Mail" size={17} className="text-muted-foreground" />}
                className="h-12 rounded-[8px] border-border/80 bg-white/[0.035] text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/60"
              />
            </div>
            <InsightStrip
              icon="ShieldCheck"
              title="Editable later"
              text="Your onboarding answers shape the starting plan. You can refine them anytime from your profile."
            />
          </div>
        );

      case 2:
        return (
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { id: 'male', label: 'Male', icon: 'Mars', detail: 'Use male baseline recommendations.' },
              { id: 'female', label: 'Female', icon: 'Venus', detail: 'Use female baseline recommendations.' },
              { id: 'not_specified', label: 'Prefer not to say', icon: 'UserRound', detail: 'Keep recommendations more general.' },
            ].map((option) => (
              <SelectionTile
                key={option.id}
                selected={formData.gender === option.id}
                icon={option.icon}
                title={option.label}
                detail={option.detail}
                onClick={() => handleInputChange('gender', option.id)}
                className="min-h-[150px]"
              />
            ))}
          </div>
        );

      case 3:
        return (
          <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[8px] border border-border/80 bg-white/[0.025] p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-muted">
                <img src={weightProfile.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-4xl font-bold text-primary">{Math.round(formData.bodyWeight)} kg</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{weightProfile.label}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <RangeControl
                label="Current weight"
                value={Math.round(formData.bodyWeight)}
                unit="kg"
                min={30}
                max={200}
                minLabel="30 kg"
                middleLabel="115 kg"
                maxLabel="200 kg"
                gradient="linear-gradient(90deg, #ef4444 0%, #f97316 28%, #f59e0b 48%, #22c55e 72%, #3b82f6 100%)"
                onChange={(value) => handleInputChange('bodyWeight', value)}
              />
              <InsightStrip
                icon="Activity"
                title={weightProfile.note}
                text="Weight is only one signal. Your target, level, schedule, and success markers will make the plan more precise."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {physiqueOptions.map((option) => (
              <ImageChoice
                key={option.id}
                selected={formData.physique === option.id}
                image={option.image}
                icon={option.icon}
                title={option.label}
                subtitle={option.description}
                onClick={() => handleInputChange('physique', option.id)}
              />
            ))}
          </div>
        );

      case 5:
        return (
          <div className="mx-auto max-w-4xl space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {focusAreaOptions.map((area) => {
                const selected = formData.focusAreas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleArrayValue('focusAreas', area.id)}
                    className={classNames(
                      'relative rounded-[8px] border p-3 text-center transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                      selected
                        ? 'border-primary bg-primary/12 shadow-[0_12px_32px_rgba(255,165,0,0.13)]'
                        : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]'
                    )}
                  >
                    <div className="mx-auto mb-3 aspect-square max-w-[76px] overflow-hidden rounded-[8px] border border-white/10 bg-muted sm:max-w-[92px]">
                      <img src={area.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <span className="block text-sm font-bold text-foreground">{area.label}</span>
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-black">
                        <Icon name="Check" size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <InsightStrip
              icon="MousePointer2"
              title={`${formData.focusAreas.length} area${formData.focusAreas.length === 1 ? '' : 's'} selected`}
              text="Multi-select lets your plan balance major movement patterns with the areas you care about most."
            />
          </div>
        );

      case 6:
        return (
          <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
              <RangeControl
                label="Height"
                value={Math.round(formData.height)}
                unit="cm"
                min={140}
                max={220}
                minLabel="140 cm"
                middleLabel="180 cm"
                maxLabel="220 cm"
                gradient="linear-gradient(90deg, #38bdf8 0%, #14b8a6 50%, #22c55e 100%)"
                onChange={(value) => handleInputChange('height', value)}
              />
              <RangeControl
                label="Age"
                value={Math.round(formData.age)}
                unit="years"
                min={15}
                max={80}
                minLabel="15"
                middleLabel="48"
                maxLabel="80"
                gradient="linear-gradient(90deg, #facc15 0%, #f97316 52%, #ef4444 100%)"
                onChange={(value) => handleInputChange('age', value)}
              />
              <RangeControl
                label="Target weight"
                value={Math.round(formData.weight)}
                unit="kg"
                min={30}
                max={200}
                minLabel="30 kg"
                middleLabel="115 kg"
                maxLabel="200 kg"
                gradient="linear-gradient(90deg, #ec4899 0%, #f97316 34%, #f59e0b 66%, #22c55e 100%)"
                onChange={(value) => handleInputChange('weight', value)}
              />
            </div>
            <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-4">
              <p className="mb-4 text-sm font-semibold text-foreground">Profile snapshot</p>
              <div className="space-y-3">
                <MiniStat icon="Ruler" label="Height" value={`${Math.round(formData.height)} cm`} />
                <MiniStat icon="Calendar" label="Age" value={`${Math.round(formData.age)} years`} />
                <MiniStat icon="Crosshair" label="Target" value={`${Math.round(formData.weight)} kg`} />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
            {workoutTimeOptions.map((timeSlot) => (
              <SelectionTile
                key={timeSlot.id}
                selected={formData.workoutTime === timeSlot.id}
                icon={timeSlot.icon}
                title={timeSlot.label}
                subtitle={timeSlot.time}
                detail={timeSlot.description}
                onClick={() => handleInputChange('workoutTime', timeSlot.id)}
              />
            ))}
          </div>
        );

      case 8:
        return (
          <div className="mx-auto max-w-3xl space-y-3">
            {fitnessLevelOptions.map((level, index) => (
              <button
                key={level.id}
                type="button"
                aria-pressed={formData.fitnessLevel === level.id}
                onClick={() => handleInputChange('fitnessLevel', level.id)}
                className={classNames(
                  'w-full rounded-[8px] border p-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                  formData.fitnessLevel === level.id
                    ? 'border-primary bg-primary/12 shadow-[0_12px_32px_rgba(255,165,0,0.13)]'
                    : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <span className={classNames('mt-1 h-4 w-4 flex-shrink-0 rounded-full', level.color)} />
                    <span>
                      <span className="block text-lg font-bold text-foreground">{level.label}</span>
                      <span className="mt-1 block text-sm font-semibold text-foreground/85">{level.description}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{level.details}</span>
                    </span>
                  </div>
                  {formData.fitnessLevel === level.id && <Icon name="Check" size={20} className="text-primary" />}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((barIndex) => (
                    <span
                      key={barIndex}
                      className={classNames(
                        'h-1.5 rounded-full',
                        barIndex <= index ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </button>
            ))}
            <InsightStrip
              icon="SlidersHorizontal"
              title="Adaptive difficulty"
              text="The first plan will start at this level and then adjust as your workout history grows."
            />
          </div>
        );

      case 9: {
        const alignmentMessage = formData.alignmentScore >= 4
          ? 'Guidance mode: precise. Your workouts will emphasize clear sets, reps, and progression cues.'
          : formData.alignmentScore > 0
            ? 'Guidance mode: flexible. Your plan will keep structure while leaving room for preference.'
            : 'Choose a number to tune your coaching style.';

        return (
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-5 sm:p-6">
              <Icon name="Quote" size={26} className="mb-4 text-primary" />
              <p className="text-lg font-semibold leading-7 text-foreground sm:text-xl">
                I want clear exercise direction, not another plan that leaves me guessing.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleInputChange('alignmentScore', rating)}
                  className={classNames(
                    'h-14 rounded-[8px] border text-lg font-bold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                    formData.alignmentScore === rating
                      ? 'border-primary bg-primary text-black shadow-[0_10px_28px_rgba(255,165,0,0.2)]'
                      : 'border-border/80 bg-white/[0.025] text-foreground hover:border-primary/45'
                  )}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light direction</span>
              <span>Very prescriptive</span>
            </div>
            <InsightStrip icon="Compass" title={alignmentMessage} text="This setting changes the level of detail in your coaching prompts and workout notes." />
          </div>
        );
      }

      case 10:
        return (
          <div className="mx-auto max-w-5xl space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              {successMetricOptions.map((metric) => (
                <SelectionTile
                  key={metric.id}
                  selected={formData.successMetrics.includes(metric.id)}
                  icon={metric.icon}
                  title={metric.label}
                  detail={metric.description}
                  onClick={() => toggleArrayValue('successMetrics', metric.id)}
                />
              ))}
            </div>
            <InsightStrip
              icon="ListChecks"
              title={`${formData.successMetrics.length} success marker${formData.successMetrics.length === 1 ? '' : 's'} selected`}
              text="ATOS-fit can frame progress around performance, health, confidence, energy, or consistency."
            />
          </div>
        );

      case 11:
        return (
          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">First plan signal</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Balanced transformation path</h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-primary text-black">
                  <Icon name="Route" size={21} />
                </span>
              </div>
              <div className="relative h-48 overflow-hidden rounded-[8px] border border-border/70 bg-background/50 p-4 sm:h-56">
                <svg viewBox="0 0 560 220" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="loadLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                    <linearGradient id="recoveryLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <path d="M20 180 C120 130 160 155 240 96 C320 38 395 90 540 42" fill="none" stroke="url(#loadLine)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M20 120 C120 90 180 125 250 112 C340 96 420 138 540 104" fill="none" stroke="url(#recoveryLine)" strokeWidth="8" strokeLinecap="round" opacity="0.82" />
                  <path d="M20 184 L540 184" stroke="currentColor" strokeWidth="2" opacity="0.16" />
                  <circle cx="540" cy="42" r="10" fill="#22c55e" />
                  <circle cx="540" cy="104" r="10" fill="#a78bfa" />
                </svg>
                <div className="absolute left-5 top-5 rounded-[8px] border border-border/70 bg-background/80 px-3 py-2 backdrop-blur">
                  <p className="text-xs font-semibold text-foreground">Training load</p>
                  <p className="text-xs text-muted-foreground">Progressive, not random</p>
                </div>
                <div className="absolute bottom-5 right-5 rounded-[8px] border border-border/70 bg-background/80 px-3 py-2 backdrop-blur">
                  <p className="text-xs font-semibold text-foreground">Recovery rhythm</p>
                  <p className="text-xs text-muted-foreground">Matched to your schedule</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniStat icon="Dumbbell" label="Physique" value={getLabelById(physiqueOptions, formData.physique)} />
                <MiniStat icon="Clock3" label="Workout time" value={getLabelById(workoutTimeOptions, formData.workoutTime)} />
                <MiniStat icon="Gauge" label="Level" value={getLabelById(fitnessLevelOptions, formData.fitnessLevel)} />
              </div>
            </div>
            <div className="space-y-3">
              <MiniStat icon="Scale" label="Current weight" value={`${Math.round(formData.bodyWeight)} kg`} />
              <MiniStat icon="Crosshair" label="Target weight" value={`${Math.round(formData.weight)} kg`} />
              <MiniStat icon="ScanLine" label="Focus areas" value={getSelectedLabels(focusAreaOptions, formData.focusAreas)} />
              <InsightStrip
                icon="ClipboardCheck"
                title="Personalized results"
                text="Your dashboard will use these choices to guide workouts, reminders, and progress feedback."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim();
      case 2:
        return formData.gender;
      case 3:
        return true;
      case 4:
        return formData.physique;
      case 5:
        return formData.focusAreas.length > 0;
      case 6:
        return formData.height > 0 && formData.age > 0 && formData.weight > 0;
      case 7:
        return formData.workoutTime;
      case 8:
        return formData.fitnessLevel;
      case 9:
        return formData.alignmentScore > 0;
      case 10:
        return formData.successMetrics.length > 0;
      case 11:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className={classNames(
      'min-h-screen overflow-hidden bg-background text-foreground',
      currentTheme === 'dark' && 'dark'
    )}>
      <div className="relative min-h-screen">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,165,0,0.13) 0%, rgba(255,165,0,0.03) 28%, transparent 54%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 42%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:28px_28px] opacity-25" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-5xl px-4 py-5 lg:px-6">
          <main className="flex min-w-0 flex-1 flex-col justify-center py-2 lg:py-6">
            <div className="mb-4 rounded-[8px] border border-border/70 bg-card/70 p-3 shadow-[0_12px_34px_rgba(0,0,0,0.16)] backdrop-blur">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-foreground">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <section className="rounded-[8px] border border-border/80 bg-card/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-7 lg:p-8">
              <StepHeader meta={activeMeta} />
              <div className="mt-8">{renderStep()}</div>

              <div className="mt-8 flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="h-11 rounded-[8px] border-border/80 bg-white/[0.025] px-4"
                >
                  <Icon name="ChevronLeft" size={16} />
                  <span className="ml-2">Previous</span>
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    onClick={handleComplete}
                    disabled={!isStepValid() || isLoading}
                    loading={isLoading}
                    className="h-11 rounded-[8px] px-5"
                  >
                    <Icon name="Check" size={16} />
                    <span className="ml-2">Complete setup</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="h-11 rounded-[8px] px-5"
                  >
                    <span>Continue</span>
                    <Icon name="ChevronRight" size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={handleSkip}
              className="mx-auto mt-4 rounded-[8px] px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              Skip for now
            </button>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
