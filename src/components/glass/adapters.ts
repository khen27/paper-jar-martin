// Adapter helpers to keep legacy props working
import { GlassPressable } from './GlassPressable';
import { GlassIndicator } from './GlassIndicator';
import { GlassCard } from './GlassCard';

// Legacy backButtonGlass adapter
export const BackButtonGlass = ({ children, onPress, ...props }) => (
  <GlassPressable onPress={onPress} size="sm" {...props}>
    {children}
  </GlassPressable>
);

// Legacy selectedIndicator adapter  
export const SelectedIndicator = ({ active, ...props }) => (
  <GlassIndicator active={active} {...props} />
);

// Legacy card adapter
export const LegacyGlassCard = ({ children, style, ...props }) => (
  <GlassCard style={style} {...props}>
    {children}
  </GlassCard>
);
