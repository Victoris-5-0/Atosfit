import React from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../assets/logo.png';

const MobileSplash = ({ statusText = "Preparing your AI coach..." }) => {
  return (
    <div className="fixed inset-0 bg-[#181818] z-[200] flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-[#FF8A00] opacity-10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-[#00E5FF] opacity-10 blur-[120px] rounded-full animate-pulse delay-1000" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 relative">
          {/* Pulsing ring around logo */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-[-10%] border-2 border-[#FF8A00] rounded-3xl blur-[2px]"
          />
          <img src={logoImage} alt="ATOS Fit Logo" className="w-full h-full object-contain rounded-2xl" />
        </div>

        <h1 className="text-3xl font-black text-[#fffef5] tracking-tight mb-2">
          ATOS <span className="text-[#FF8A00]">Fit</span>
        </h1>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs sm:text-sm font-bold text-[#a7a289] uppercase tracking-[0.2em]"
          >
            {statusText}
          </motion.div>

          {/* Simple loading line */}
          <div className="w-32 h-[2px] bg-[rgba(167,162,137,0.1)] rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#FF8A00] to-transparent"
            />
          </div>
        </div>
      </motion.div>

      {/* Subtle bottom text */}
      <div className="absolute bottom-10 text-[10px] text-[#a7a289] font-medium tracking-widest opacity-50 uppercase">
        Powered by AI Coaching
      </div>
    </div>
  );
};

export default MobileSplash;
