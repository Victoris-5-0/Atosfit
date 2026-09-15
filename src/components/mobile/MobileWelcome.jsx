import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { mobileAppFlowService } from '../../services/mobileAppFlowService';

const slides = [
  {
    title: "AI Workout Analysis",
    description: "Use your camera to detect posture, count reps, and improve form in real-time.",
    icon: "Activity",
    color: "#FF8A00",
    image: "https://media.craiyon.com/2025-04-08/ZNEwVZXCQWWnQsrUfh71tA.webp"
  },
  {
    title: "Smart Nutrition",
    description: "Scan meals and track calories, protein, carbs, and fats with ease.",
    icon: "Zap",
    color: "#00E5FF",
    image: "https://tse1.mm.bing.net/th/id/OIP.RYspvTcnmOVdsdMZFSnWOQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3"
  },
  {
    title: "Personal Coaching",
    description: "Ask your AI coach about workouts, recovery, and nutrition anytime.",
    icon: "User",
    color: "#7C4DFF",
    image: "/pp.png"
  }
];

const MobileWelcome = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      mobileAppFlowService.setHasSeenIntro(true);
      if (onComplete) onComplete();
      else navigate('/login-screen');
    }
  };

  const handleSkip = () => {
    mobileAppFlowService.setHasSeenIntro(true);
    if (onComplete) onComplete();
    else navigate('/login-screen');
  };

  return (
    <div className="fixed inset-0 bg-[#181818] z-[150] flex flex-col overflow-hidden">
      {/* Background Decor */}
      <div
        className="absolute top-0 inset-x-0 h-[60vh] opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top, ${slides[currentSlide].color} 0%, transparent 70%)`
        }}
      />

      <div className="flex-1 relative z-10 flex flex-col p-6 pt-12">
        {/* Top Controls */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSkip}
            className="text-sm font-bold text-[#a7a289] uppercase tracking-widest hover:text-[#fffef5] transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center max-w-sm"
            >
              {/* Visual Card */}
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 mb-10 rounded-[40px] overflow-hidden border-2 border-[rgba(167,162,137,0.15)] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#181818] opacity-60" />
                <img src={slides[currentSlide].image} className="w-full h-full object-cover" alt="" />

                {/* Floating Icon */}
                <div
                  className="absolute bottom-6 left-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md"
                  style={{ backgroundColor: `${slides[currentSlide].color}44`, border: `1px solid ${slides[currentSlide].color}aa` }}
                >
                  <Icon name={slides[currentSlide].icon} size={28} color={slides[currentSlide].color} />
                </div>
              </div>

              <h2 className="text-3xl font-black text-[#fffef5] mb-4 leading-tight">
                {slides[currentSlide].title}
              </h2>
              <p className="text-base text-[#a7a289] font-medium leading-relaxed mb-8">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pb-10 flex flex-col items-center gap-8">
          {/* Progress Indicators */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentSlide ? 24 : 6,
                  backgroundColor: i === currentSlide ? slides[currentSlide].color : "rgba(167,162,137,0.2)"
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-black transition-all active:scale-[0.98]"
            style={{
              backgroundColor: slides[currentSlide].color,
              color: '#181818'
            }}
          >
            {currentSlide === slides.length - 1 ? "GET STARTED" : "NEXT"}
            <Icon name="ArrowRight" size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWelcome;
