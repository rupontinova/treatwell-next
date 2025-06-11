"use client";
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              logo_alignment?: 'left' | 'center';
              width?: string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleLoginProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  theme = 'outline',
  size = 'large'
}) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && googleButtonRef.current && !isInitialized.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '540509951730-7c8s4qhng6j5s6lfi9fk8jjgd4m9a6ei.apps.googleusercontent.com', // Default for demo
          callback: (response) => {
            onSuccess(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme,
          size,
          text,
          type: 'standard',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        });

        isInitialized.current = true;
      }
    };

    // Load Google Identity Services script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        onError?.('Failed to load Google Sign-In');
      };
      document.head.appendChild(script);
    } else {
      initializeGoogle();
    }

    return () => {
      // Cleanup if needed
      isInitialized.current = false;
    };
  }, [onSuccess, onError, text, theme, size]);

  return (
    <div 
      ref={googleButtonRef} 
      className="w-full flex justify-center"
      style={{ minHeight: '44px' }}
    />
  );
};

export default GoogleLogin; 