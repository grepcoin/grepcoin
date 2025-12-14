'use client'

interface LogoProps {
  className?: string
  size?: number
  showText?: boolean
}

export default function Logo({ className = '', size = 40, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* SVG Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />

        {/* Stylized G */}
        <path
          d="M20 9H14C11.2386 9 9 11.2386 9 14V18C9 20.7614 11.2386 23 14 23H17V18H14C13.4477 18 13 17.5523 13 17V15C13 14.4477 13.4477 14 14 14H20V17H17V21H20C22.7614 21 25 18.7614 25 16V14C25 11.2386 22.7614 9 20 9Z"
          fill="white"
        />

        {/* Coin dot */}
        <circle cx="16" cy="27" r="2.5" fill="white" />
      </svg>

      {/* Text */}
      {showText && (
        <span className="text-xl font-display font-bold bg-gradient-to-r from-grep-purple via-grep-pink to-grep-orange bg-clip-text text-transparent">
          GrepCoin
        </span>
      )}
    </div>
  )
}

// Standalone icon version for smaller uses
export function LogoIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="8" fill="url(#iconGrad)" />

      <path
        d="M20 9H14C11.2386 9 9 11.2386 9 14V18C9 20.7614 11.2386 23 14 23H17V18H14C13.4477 18 13 17.5523 13 17V15C13 14.4477 13.4477 14 14 14H20V17H17V21H20C22.7614 21 25 18.7614 25 16V14C25 11.2386 22.7614 9 20 9Z"
        fill="white"
      />

      <circle cx="16" cy="27" r="2.5" fill="white" />
    </svg>
  )
}
