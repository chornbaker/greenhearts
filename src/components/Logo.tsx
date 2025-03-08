import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  vertical?: boolean;
  href?: string;
}

export default function Logo({ showText = false, size = 'medium', className = '', vertical = false, href }: LogoProps) {
  // Define sizes for different variants
  const sizes = {
    small: { width: 36, height: 36, textClass: 'text-xl' },
    medium: { width: 72, height: 72, textClass: 'text-2xl' },
    large: { width: 110, height: 110, textClass: 'text-4xl' },
  };

  const { width, height, textClass } = sizes[size];

  const content = (
    <div className={`flex ${vertical ? 'flex-col items-center' : 'items-center'} ${className} ${href ? 'hover:opacity-80 transition-opacity' : ''}`}>
      <div className={`relative drop-shadow-md ${vertical ? '-mb-[5px]' : ''}`}>
        <Image
          src="/images/greenhearts-logo.png"
          alt="GreenHearts Logo"
          width={width}
          height={height}
          style={{ width: `${width}px`, height: `${height}px` }}
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

  return href ? (
    <Link href={href}>
      {content}
    </Link>
  ) : content;
} 