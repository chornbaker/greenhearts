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
    small: { width: 32, height: 32, textClass: 'text-lg' },
    medium: { width: 64, height: 64, textClass: 'text-xl' },
    large: { width: 96, height: 96, textClass: 'text-4xl font-bold' },
  };

  const { width, height, textClass } = sizes[size];

  return (
    <div className={`flex ${vertical ? 'flex-col items-center' : 'items-center'} ${className}`}>
      <div className="relative" style={{ width, height }}>
        <Image
          src="/images/greenhearts-logo.png"
          alt="GreenHearts Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
      
      {showText && (
        <h1 className={`${vertical ? 'mt-1 text-center font-sans' : 'ml-3 font-sans'} font-bold tracking-tight ${textClass} ${className.includes('text-white') ? 'text-shadow' : 'text-green-700'}`}>
          GreenHearts
        </h1>
      )}
    </div>
  );
} 