import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { preloadStore } from '@/lib/topicStore';
import { preloadCSStore } from '@/lib/csTopicStore';

function applyColorScheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // 1. Core Initial Run: Fetch public environment layouts
    fetchAppPublicSettings();

    // 2. Supabase Global Session Monitor Loop
    // This watches for any sign-ins, sign-outs, or credential refreshes across the app
    const { data: { subscription } } = base44.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth State Event:", event);
      
      if (session?.user) {
        // Active user found! Map their session data into your app layout states
        const mappedUser = {
          id: session.user.id,
          email: session.user.email,
          // Fall back to true or handle onboarding status flag safely
          onboarding_completed: session.user.user_metadata?.onboarding_completed ?? true,
        };
        
        setUser(mappedUser);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);

        // Preload student study metrics from database collections using their email
        if (session.user.email) {
          setIsLoadingProgress(true);
          try {
            await preloadStore(session.user.email);
            await preloadCSStore(session.user.email);
          } catch (err) {
            console.error("Failed to preload progress metrics:", err);
          }
          setIsLoadingProgress(false);
        }
      } else {
        // No active session or user logged out cleanly
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
      }
    });

    // Sync with system window color themes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyColorScheme(mq.matches);
    const handler = (e) => applyColorScheme(e.matches);
    mq.addEventListener('change', handler);

    // Teardown step: Clean up our active data streams when components unmount
    return () => {
      subscription.unsubscribe();
      mq.removeEventListener('change', handler);
    };
  }, []);

  // Isolate platform checks so they don't block auth state syncs
  const fetchAppPublicSettings = async () => {
    try {
      setIsLoadingPublicSettings(true);
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: { 'X-App-Id': appParams.appId },
        token: appParams.token,
        interceptResponses: true
      });

      const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
      setAppPublicSettings(publicSettings);
      setIsLoadingPublicSettings(false);
    } catch (appError) {
      console.error('App setting evaluation bypassed:', appError);
      setIsLoadingPublicSettings(false);
    }
  };

  // Keep for backwards compatibility calls if any exist in page views
  const checkAppState = async () => {
    await fetchAppPublicSettings();
  };

  // Log Out Sequence modified to handle Supabase sessions securely
  const logout = async () => {
    setIsLoadingAuth(true);
    try {
      await base44.auth.signOut();
    } catch (err) {
      console.error("Error signing out from session:", err);
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsLoadingAuth(false);
  };

  const navigateToLogin = () => {
    // If a manual fallback login is requested, ensure local state drops back to entry mode
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      isLoadingProgress,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};