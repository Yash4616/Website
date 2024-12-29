import React, { useEffect, useState } from 'react';

const Cursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateCursor);
    return () => window.removeEventListener('mousemove', updateCursor);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 mix-blend-screen blur-sm transition-transform duration-100 ease-out"
      style={{
        transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
      }}
    />
  );
};

export default Cursor;