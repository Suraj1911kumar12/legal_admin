import {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  LinearTransition,
  useReducedMotion,
  withSpring
} from 'react-native-reanimated';

export const MotionConfig = {
  springGentle: {
    damping: 20,
    stiffness: 180,
    mass: 0.9
  },
  springSnappy: {
    damping: 18,
    stiffness: 240,
    mass: 0.8
  },
  pressScale: 0.975
} as const;

export function useAccessibleMotion() {
  const reducedMotion = useReducedMotion();

  const enterFadeUp = (delayMs = 0) => {
    if (reducedMotion) return undefined;
    return FadeInDown.duration(320).delay(delayMs).springify().damping(22);
  };

  const enterFade = (delayMs = 0) => {
    if (reducedMotion) return undefined;
    return FadeIn.duration(260).delay(delayMs);
  };

  const enterBottomUp = (delayMs = 0) => {
    if (reducedMotion) return undefined;
    return FadeInUp.duration(300).delay(delayMs);
  };

  const exitFade = () => {
    if (reducedMotion) return undefined;
    return FadeOut.duration(180);
  };

  const layoutTransition = reducedMotion ? undefined : LinearTransition.springify().damping(22);

  const springValue = (target: number) => {
    'worklet';
    return reducedMotion ? target : withSpring(target, MotionConfig.springGentle);
  };

  return {
    reducedMotion,
    enterFadeUp,
    enterFade,
    enterBottomUp,
    exitFade,
    layoutTransition,
    springValue
  };
}
