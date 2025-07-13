import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { 
  NavigationContextValue, 
  NavigationConfig, 
  NavigationState, 
  NavigationAnalytics,
  NavigationCustomization 
} from '@/types/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { accessibilityFeatures, navigationAnalytics } from '@/config/navigation';

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: React.ReactNode;
  config: NavigationConfig;
  analytics?: NavigationAnalytics;
  customization?: NavigationCustomization;
  initialState?: Partial<NavigationState>;
}

export function NavigationProvider({
  children,
  config,
  analytics = navigationAnalytics,
  customization,
  initialState
}: NavigationProviderProps) {
  const navigation = useNavigation(config);
  
  // Initialize state with any provided initial state
  React.useEffect(() => {
    if (initialState) {
      navigation.setState(prev => ({
        ...prev,
        ...initialState
      }));
    }
  }, [initialState, navigation]);
  
  // Enhanced setState that includes analytics tracking
  const enhancedSetState = useCallback((newState: NavigationState) => {
    navigation.setState(newState);
    
    // Track state changes if analytics are enabled
    if (analytics && newState.activeItemId !== navigation.state.activeItemId) {
      const item = navigation.findItem(newState.activeItemId || '');
      if (item) {
        analytics.trackItemClick?.(item);
      }
    }
  }, [navigation, analytics]);
  
  // Context value with all navigation functionality
  const contextValue = useMemo<NavigationContextValue>(() => ({
    config: navigation.config,
    state: navigation.state,
    setState: enhancedSetState,
    accessibility: accessibilityFeatures,
    analytics,
    customization,
    error: undefined // Could be enhanced with error handling
  }), [
    navigation.config,
    navigation.state,
    enhancedSetState,
    analytics,
    customization
  ]);
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook to use navigation context
export function useNavigationContext(): NavigationContextValue {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  
  return context;
}

// Convenience hooks for specific navigation functionality
export function useNavigationState() {
  const { state, setState } = useNavigationContext();
  return [state, setState] as const;
}

export function useNavigationConfig() {
  const { config } = useNavigationContext();
  return config;
}

export function useNavigationAccessibility() {
  const { accessibility } = useNavigationContext();
  return accessibility;
}

export function useNavigationAnalytics() {
  const { analytics } = useNavigationContext();
  return analytics;
}

export function useNavigationCustomization() {
  const { customization } = useNavigationContext();
  return customization;
}