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
    small: { width: 36, height: 36, textClass: 'text-lg' },
    medium: { width: 72, height: 72, textClass: 'text-xl' },
    large: { width: 110, height: 110, textClass: 'text-4xl' },
  };

  const { width, height, textClass } = sizes[size];

  return (
    <div className={`flex ${vertical ? 'flex-col items-center' : 'items-center'} ${className}`}>
      <div className="relative drop-shadow-md" style={{ width, height, marginBottom: vertical ? '-5px' : 0 }}>
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
        <h1 className={`${vertical ? 'text-center font-figtree' : 'ml-2 font-figtree'} font-light tracking-tight ${textClass} ${className.includes('text-white') ? 'text-shadow' : 'text-green-700'}`}>
          GreenHearts
        </h1>
      )}
    </div>
  );
} 