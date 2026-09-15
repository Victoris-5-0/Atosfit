import React from 'react';
import MobileBottomNav from './MobileBottomNav';
import { isNative } from '../../utils/platform';

const MobileLayout = ({ children }) => {
  const native = isNative();

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1 ${native ? 'pb-24' : ''}`}>
        {children}
      </div>
      {native && <MobileBottomNav />}
    </div>
  );
};

export default MobileLayout;
