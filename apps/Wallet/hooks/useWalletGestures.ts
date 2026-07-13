import { useTriggerGestures } from '../../../os/hooks/useTriggerGestures';
import type { TransitionId } from '../navigation.declaration';
import { useAppNavigate } from '../navigation';

export function useWalletGestures() {
  const { go } = useAppNavigate();
  const gestures = useTriggerGestures<TransitionId>({ execute: (id, params) => go(id, params) });
  return { ...gestures, go };
}
