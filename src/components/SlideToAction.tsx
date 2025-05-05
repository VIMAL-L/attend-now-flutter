
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SlideToActionProps {
  onComplete: () => void;
  text: string;
  completeText: string;
  direction?: 'ltr' | 'rtl';
  disabled?: boolean;
  className?: string;
}

export default function SlideToAction({
  onComplete,
  text,
  completeText,
  direction = 'ltr',
  disabled = false,
  className
}: SlideToActionProps) {
  const [sliding, setSliding] = useState(false);
  const [position, setPosition] = useState(0);
  const [completed, setCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || completed) return;
    
    e.preventDefault();
    setSliding(true);
  };
  
  const handleTouchEnd = () => {
    if (disabled || completed) return;
    
    setSliding(false);
    
    // If slid more than 90% of the way, trigger complete
    const container = containerRef.current;
    if (container) {
      const containerWidth = container.offsetWidth;
      const thumbWidth = thumbRef.current?.offsetWidth || 0;
      const maxPosition = containerWidth - thumbWidth;
      
      if (position > maxPosition * 0.9) {
        setPosition(maxPosition);
        setCompleted(true);
        onComplete();
      } else {
        // Reset position
        setPosition(0);
      }
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!sliding || disabled || completed) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerWidth = container.offsetWidth;
    const thumbWidth = thumbRef.current?.offsetWidth || 0;
    const maxPosition = containerWidth - thumbWidth;
    
    // Get touch/mouse position relative to container
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const containerRect = container.getBoundingClientRect();
    const relativePosition = clientX - containerRect.left - (thumbWidth / 2);
    
    // Constrain position between 0 and max
    const newPosition = Math.max(0, Math.min(relativePosition, maxPosition));
    setPosition(newPosition);
  };
  
  // Set up mouse move and up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sliding) {
        handleTouchMove(e as unknown as React.MouseEvent);
      }
    };
    
    const handleMouseUp = () => {
      if (sliding) {
        handleTouchEnd();
      }
    };
    
    if (sliding) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sliding]);

  return (
    <div 
      ref={containerRef}
      className={cn("slide-to-action", className)}
      style={disabled ? { opacity: 0.7 } : {}}
    >
      <div 
        className="slide-track"
        style={{ 
          paddingLeft: completed ? '0' : '60px', 
          opacity: position > 0 ? 1 - (position / (containerRef.current?.offsetWidth || 1)) : 1 
        }}
      >
        {completed ? completeText : text}
      </div>
      <div
        ref={thumbRef}
        className="slide-thumb"
        style={{ 
          transform: `translateX(${position}px)` 
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove as any}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
      >
        {direction === 'ltr' ? '→' : '←'}
      </div>
    </div>
  );
}
