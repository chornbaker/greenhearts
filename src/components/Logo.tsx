import Image from 'next/image';
import Link from 'next/link';
import { CSSProperties } from 'react';

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
    small: { width: 36, height: 36, textSize: '1.25rem' },
    medium: { width: 72, height: 72, textSize: '1.5rem' },
    large: { width: 110, height: 110, textSize: '2.25rem' },
  };

  const { width, height, textSize } = sizes[size];

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row',
    alignItems: 'center',
    transition: 'opacity 0.2s ease',
    WebkitTapHighlightColor: 'transparent'
  };

  const imageContainerStyle: CSSProperties = {
    position: 'relative',
    filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))',
    marginBottom: vertical ? '-5px' : '0',
  };

  const textStyle: CSSProperties = {
    fontFamily: 'Figtree, sans-serif',
    fontWeight: 300,
    letterSpacing: '-0.025em',
    fontSize: textSize,
    marginLeft: vertical ? '0' : '0.5rem',
    textAlign: vertical ? 'center' as const : 'left' as const,
    color: className.includes('text-white') ? 'white' : '#15803d', // text-green-700 equivalent
    textShadow: className.includes('text-white') ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
  };

  const content = (
    <div style={containerStyle} className={className}>
      <div style={imageContainerStyle}>
        <Image
          src="/images/greenhearts-logo.png"
          alt="GreenHearts Logo"
          width={width}
          height={height}
          style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain' }}
          priority
        />
      </div>
      
      {showText && (
        <h1 style={textStyle}>
          GreenHearts
        </h1>
      )}
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: 'none', WebkitTapHighlightColor: 'transparent' }}>
      {content}
    </Link>
  ) : content;
} 