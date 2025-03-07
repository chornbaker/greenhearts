import Image from 'next/image';

interface LogoProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  vertical?: boolean;
}

export default function Logo({ showText = false, size = 'medium', className = '', vertical = false }: LogoProps) {
  // Define sizes for different variants
  const sizes = {
    small: { width: 40, height: 40, textClass: 'text-lg' },
    medium: { width: 72, height: 72, textClass: 'text-xl' },
    large: { width: 120, height: 120, textClass: 'text-4xl font-bold' },
  };

  const { width, height, textClass } = sizes[size];

  return (
    <div className={`flex ${vertical ? 'flex-col items-center' : 'items-center'} ${className}`}>
      <div className="relative drop-shadow-xl" style={{ width, height }}>
        <div className="absolute inset-0 bg-white/10 rounded-full blur-md"></div>
        <Image
          src="/images/greenhearts-logo.png"
          alt="GreenHearts Logo"
          width={width}
          height={height}
          className="object-contain relative z-10"
          priority
        />
      </div>
      
      {showText && (
        <h1 className={`${vertical ? 'mt-2 text-center' : 'ml-3'} font-bold tracking-tight ${textClass} ${className.includes('text-white') ? 'text-shadow' : 'text-green-700'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
          GreenHearts
        </h1>
      )}
    </div>
  );
} 