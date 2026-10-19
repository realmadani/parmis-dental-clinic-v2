import React from 'react';

export type RobotState = 'entering' | 'greeting' | 'idle' | 'thinking' | 'speaking' | 'farewell';

interface AiRobotAvatarProps {
  state: RobotState;
  farewellStep?: 'turn_and_wave' | 'glide_out' | null;
  compact?: boolean;
}

export const AiRobotAvatar: React.FC<AiRobotAvatarProps> = ({
  state,
  farewellStep = null,
  compact = false,
}) => {
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';
  const isGreeting = state === 'greeting' || state === 'entering';
  const isFarewell = state === 'farewell';

  // Status badge label based on robot emotional/functional state
  const stateLabel = isFarewell
    ? 'خداحافظی...'
    : isThinking
    ? 'در حال بررسی...'
    : isSpeaking
    ? 'در حال پاسخ‌گویی'
    : isGreeting
    ? 'خوش آمدید!'
    : 'آماده پاسخ‌گویی';

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center transition-all duration-500 ${
        compact ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-20 h-20 sm:w-24 sm:h-24'
      } ${
        isFarewell && farewellStep === 'glide_out'
          ? '-translate-x-16 translate-y-2 scale-75 opacity-0 duration-500 ease-in'
          : isFarewell
          ? 'scale-110 z-20 duration-300'
          : state === 'entering'
          ? 'scale-95 opacity-90'
          : 'scale-100 opacity-100'
      }`}
      style={{ perspective: '600px' }}
      aria-hidden="true"
    >
      {/* Ambient 3D Halo Glow */}
      <div
        className={`absolute inset-1 rounded-full blur-md transition-all duration-500 pointer-events-none ${
          isThinking
            ? 'bg-amber-400/35 scale-110 animate-pulse'
            : isFarewell
            ? 'bg-[#004ac6]/40 scale-125'
            : isSpeaking
            ? 'bg-emerald-400/30 scale-110'
            : 'bg-[#2563eb]/20 scale-100'
        }`}
      />

      {/* 3D Robot Character Container */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-transform duration-500 transform-gpu ${
          isFarewell
            ? 'ai-robot-farewell-turn'
            : isThinking
            ? 'ai-robot-thinking'
            : isSpeaking
            ? 'ai-robot-speaking'
            : 'ai-robot-float'
        }`}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible drop-shadow-[0_8px_16px_rgba(0,74,198,0.22)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Metallic Pearl Head Gradient */}
            <radialGradient id="robotHeadGrad" cx="35%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#eef4ff" />
              <stop offset="100%" stopColor="#c7d7fe" />
            </radialGradient>

            {/* 3D Body Gradient */}
            <radialGradient id="robotBodyGrad" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e0eaff" />
              <stop offset="100%" stopColor="#93b4fa" />
            </radialGradient>

            {/* Glass Visor Screen Gradient */}
            <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#081c45" />
              <stop offset="50%" stopColor="#0c2d6b" />
              <stop offset="100%" stopColor="#041230" />
            </linearGradient>

            {/* Blue Accent Gradient */}
            <linearGradient id="robotBlueAccent" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#004ac6" />
            </linearGradient>

            {/* Glowing Eye Filter */}
            <filter id="eyeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ground Shadow */}
          <ellipse
            cx="60"
            cy="112"
            rx={isThinking ? '18' : '22'}
            ry="4"
            fill="rgba(0, 74, 198, 0.16)"
            className="transition-all duration-500"
          />

          {/* ================= LEFT HAND (Floating 3D Capsule) ================= */}
          <g
            className={`transition-transform duration-500 origin-[22px_74px] ${
              isThinking
                ? '-translate-y-2 translate-x-1 rotate-12'
                : isSpeaking
                ? '-translate-y-1.5 -rotate-12'
                : 'translate-y-0'
            }`}
          >
            <rect
              x="12"
              y="64"
              width="12"
              height="20"
              rx="6"
              fill="url(#robotHeadGrad)"
              stroke="#93b4fa"
              strokeWidth="1.2"
            />
            <circle cx="18" cy="69" r="2.2" fill="#2563eb" opacity="0.6" />
          </g>

          {/* ================= TORSO / BODY (3D Rounded Pod) ================= */}
          <g className="transition-transform duration-500">
            <path
              d="M38 66 C38 60, 82 60, 82 66 L77 94 C76 102, 69 106, 60 106 C51 106, 44 102, 43 94 Z"
              fill="url(#robotBodyGrad)"
              stroke="#93b4fa"
              strokeWidth="1.5"
            />
            {/* Chest Dental Shield Emblem */}
            <rect
              x="49"
              y="73"
              width="22"
              height="15"
              rx="7.5"
              fill="url(#robotBlueAccent)"
              opacity="0.9"
            />
            {/* Tiny Tooth/Heart Pulse Icon on Chest */}
            <path
              d="M57 78 C57 76.5, 59 76.5, 60 77.8 C61 76.5, 63 76.5, 63 78 C63 80, 61.5 82.5, 61 84 C60.7 84.5, 60.2 83, 60 83 C59.8 83, 59.3 84.5, 59 84 C58.5 82.5, 57 80, 57 78 Z"
              fill="#ffffff"
              className={isThinking || isSpeaking ? 'animate-pulse' : ''}
            />
          </g>

          {/* ================= HEAD GROUP (Tilts & Turns in 3D) ================= */}
          <g
            className={`transition-transform duration-500 origin-[60px_42px] ${
              isThinking
                ? 'rotate-[-5deg] -translate-y-0.5'
                : isFarewell
                ? 'scale-105'
                : isSpeaking
                ? 'rotate-[2deg]'
                : ''
            }`}
          >
            {/* Antenna Stem */}
            <line
              x1="60"
              y1="10"
              x2="60"
              y2="20"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Antenna Glowing Orb */}
            <circle
              cx="60"
              cy="8"
              r="5"
              fill={isThinking ? '#f59e0b' : isFarewell ? '#10b981' : '#38bdf8'}
              filter="url(#eyeGlow)"
              className={isThinking || isGreeting || isFarewell ? 'animate-ping' : ''}
              style={{ animationDuration: '2s' }}
            />
            <circle
              cx="60"
              cy="8"
              r="4.5"
              fill={isThinking ? '#fbbf24' : isFarewell ? '#34d399' : '#004ac6'}
            />
            <circle cx="58.5" cy="6.5" r="1.5" fill="#ffffff" />

            {/* Side Ear Pods (3D Depth) */}
            <rect x="20" y="34" width="7" height="18" rx="3.5" fill="url(#robotBlueAccent)" />
            <rect x="93" y="34" width="7" height="18" rx="3.5" fill="url(#robotBlueAccent)" />

            {/* Main 3D Head Shell */}
            <rect
              x="24"
              y="18"
              width="72"
              height="48"
              rx="22"
              fill="url(#robotHeadGrad)"
              stroke="#93b4fa"
              strokeWidth="1.6"
            />

            {/* Specular 3D Top Highlight on Head */}
            <path
              d="M38 23 Q60 19 82 23"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Dark Glass Visor Faceplate */}
            <rect
              x="31"
              y="26"
              width="58"
              height="32"
              rx="14"
              fill="url(#robotVisorGrad)"
              stroke="#1e40af"
              strokeWidth="1.2"
            />

            {/* Visor Glass Reflection */}
            <path
              d="M37 30 Q52 27 66 30"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* ================= EXPRESSIVE LED EYES & MOUTH ================= */}
            {isThinking ? (
              /* Thinking Expression: Animated Scanning Eyes & Thought Wave */
              <g filter="url(#eyeGlow)">
                <circle cx="46" cy="40" r="5" fill="#38bdf8" className="animate-pulse" />
                <circle cx="47.5" cy="38.5" r="1.6" fill="#ffffff" />
                <ellipse cx="74" cy="40" rx="5.5" ry="3.2" fill="#38bdf8" />
                <circle cx="75.5" cy="39" r="1.4" fill="#ffffff" />
                {/* Thinking mouth dots */}
                <circle cx="55" cy="50" r="1.5" fill="#38bdf8" className="animate-bounce" />
                <circle
                  cx="60"
                  cy="50"
                  r="1.5"
                  fill="#38bdf8"
                  className="animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <circle
                  cx="65"
                  cy="50"
                  r="1.5"
                  fill="#38bdf8"
                  className="animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </g>
            ) : isFarewell || isGreeting ? (
              /* Happy / Waving Arc Eyes (Looking warmly at the user) */
              <g filter="url(#eyeGlow)">
                <path
                  d="M40 42 Q46 34 52 42"
                  stroke="#38bdf8"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M68 42 Q74 34 80 42"
                  stroke="#38bdf8"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Big Warm Smile */}
                <path
                  d="M51 48 Q60 55 69 48"
                  stroke="#34d399"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Rosy digital cheeks */}
                <ellipse cx="38" cy="46" rx="3" ry="1.8" fill="#60a5fa" opacity="0.55" />
                <ellipse cx="82" cy="46" rx="3" ry="1.8" fill="#60a5fa" opacity="0.55" />
              </g>
            ) : isSpeaking ? (
              /* Speaking Expression: Attentive Glowing Eyes + Animated Voice Smile */
              <g filter="url(#eyeGlow)">
                <circle cx="46" cy="40" r="5.5" fill="#38bdf8" />
                <circle cx="44.5" cy="38" r="1.8" fill="#ffffff" />
                <circle cx="74" cy="40" r="5.5" fill="#38bdf8" />
                <circle cx="72.5" cy="38" r="1.8" fill="#ffffff" />
                {/* Animated speaking mouth */}
                <rect
                  x="53"
                  y="47"
                  width="14"
                  height="5"
                  rx="2.5"
                  fill="#34d399"
                  className="animate-pulse"
                />
              </g>
            ) : (
              /* Idle Expression: Friendly Blinking LED Eyes + Gentle Smile */
              <g filter="url(#eyeGlow)" className="ai-robot-eyes-blink">
                <circle cx="46" cy="40" r="5.2" fill="#38bdf8" />
                <circle cx="44.5" cy="38.2" r="1.8" fill="#ffffff" />
                <circle cx="74" cy="40" r="5.2" fill="#38bdf8" />
                <circle cx="72.5" cy="38.2" r="1.8" fill="#ffffff" />
                <path
                  d="M53 49 Q60 53.5 67 49"
                  stroke="#38bdf8"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
          </g>

          {/* ================= RIGHT HAND (Waving Hand on Greeting & Farewell) ================= */}
          <g
            className={
              isFarewell || isGreeting
                ? 'ai-robot-hand-wave origin-[98px_68px]'
                : isThinking
                ? 'translate-y-[-6px] transition-transform duration-500'
                : 'transition-transform duration-500'
            }
          >
            <rect
              x="96"
              y={isFarewell || isGreeting ? '44' : '64'}
              width="12"
              height="20"
              rx="6"
              fill="url(#robotHeadGrad)"
              stroke="#2563eb"
              strokeWidth="1.4"
            />
            <circle
              cx="102"
              cy={isFarewell || isGreeting ? '49' : '69'}
              r="2.4"
              fill="#004ac6"
            />
          </g>
        </svg>
      </div>

      {/* Tiny Status Pill under Robot (when not compact) */}
      {!compact && (
        <span
          className={`mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight whitespace-nowrap shadow-2xs transition-colors ${
            isFarewell
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isThinking
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-[#dbe1ff]/80 text-[#004ac6]'
          }`}
        >
          {stateLabel}
        </span>
      )}
    </div>
  );
};
