import { useAppStrings } from '../../../os/useAppStrings';
import { strings } from '../res/strings';
import { stringsEn } from '../res/strings.en';

export function useTaobaoStrings() {
  return useAppStrings(strings, stringsEn);
}

export type TaobaoStringKey = keyof typeof strings;
