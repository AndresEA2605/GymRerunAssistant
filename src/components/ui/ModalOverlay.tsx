import React from 'react';

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
  zIndex?: number;
  className?: string;
  align?: 'center' | 'start';
}

export function ModalOverlay({ 
  children, 
  onClose, 
  zIndex = 50, 
  className = '', 
  align = 'center' 
}: ModalOverlayProps) {
  return (
    <div 
      className={`fixed inset-0 bg-black/85 backdrop-blur-sm flex ${align === 'start' ? 'items-start overflow-y-auto' : 'items-center'} justify-center p-3 md:p-4 overlay-enter ${className}`}
      style={{ zIndex }}
      onClick={onClose}
    >
      {children}
    </div>
  );
}
