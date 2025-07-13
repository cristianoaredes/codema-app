// Accessibility Component Library Export
// This file provides a clean interface for importing accessibility components

export { FocusManager, useFocusManager } from './FocusManager';
export { 
  ScreenReaderAnnouncer, 
  useScreenReaderAnnouncer, 
  useScreenReaderDetection,
  globalAnnounce,
  detectScreenReader
} from './ScreenReaderAnnouncer';
export { 
  AccessibilityProvider, 
  useAccessibility, 
  useScreenReaderSupport, 
  useKeyboardShortcuts, 
  useFocusManagement, 
  useAccessibilityPreferences,
  withAccessibility,
  shouldReduceAnimations,
  isHighContrastMode,
  announceRouteChange
} from './AccessibilityProvider';

// Note: AnnouncementOptions is defined locally in ScreenReaderAnnouncer and not exported
// Users can reference it through the hook return types