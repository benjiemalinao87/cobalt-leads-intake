import React from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

const Confetti: React.FC = () => {
  return <ConfettiExplosion force={0.7} duration={2200} particleCount={80} width={400} />;
};

export default Confetti;
