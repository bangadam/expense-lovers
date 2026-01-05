import React from 'react';
import { Icon, IconProps } from '@ui-kitten/components';

/**
 * Wrapper component for UI Kitten Icon to ensure React 19 compatibility
 * Uses React.createElement to ensure proper React element creation
 */
export const UIKittenIcon: React.FC<IconProps> = React.memo((props) => {
  return React.createElement(Icon, props);
});

UIKittenIcon.displayName = 'UIKittenIcon';

