// web/src/components/BubblesBackground.jsx
import React from 'react';

export default function BubblesBackground({ count = 30 }) {
  const bubbles = Array.from({ length: count }).map((_, i) => {
    // параметры
    const size     = 40 + Math.random() * 160;      // 40–200px
    const top      = Math.random() * 100;           // 0–100%
    const left     = Math.random() * 100;           // 0–100%
    const dx       = (Math.random() - 0.5) * 600;   // −300…+300px
    const dy       = (Math.random() - 0.5) * 600;   // −300…+300px
    const duration = 10 + Math.random() * 10;       // 10–20s
    const delay    = -Math.random() * duration;     // отрицательная задержка
    const blur     = 6 + Math.random() * 24;        // 6–30px
    const o0       = 0.4 + Math.random() * 0.4;     // 0.4–0.8
    const o5       = o0 * 0.3;                      // пиковая непрозрачность

    // случайный цвет в пастельной гамме
    const hue       = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.random() * 20;     // 60–80%
    const lightness  = 60 + Math.random() * 10;     // 60–70%
    const background = `hsla(${hue},${saturation}%,${lightness}%,0.15)`;
    const boxShadow  = `0 0 ${size / 2}px hsla(${hue},${saturation}%,${lightness}%,0.25)`;

    const style = {
      top:               `${top}%`,
      left:              `${left}%`,
      width:             `${size}px`,
      height:            `${size}px`,
      background,
      filter:            `blur(${blur}px)`,
      boxShadow,
      animationDuration: `${duration}s`,
      animationDelay:    `${delay}s`,
      '--dx':            `${dx}px`,
      '--dy':            `${dy}px`,
      '--o0':            o0,
      '--o5':            o5,
    };

    return <div key={i} className="bubble" style={style} />;
  });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {bubbles}
    </div>
  );
}
