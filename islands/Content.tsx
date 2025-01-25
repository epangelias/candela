import { getLanguageContent, LangContentName } from '@/lib/utils/lang.ts';
import { useGlobal } from '@/islands/Global.tsx';

export function Content({ children }: { children: string }) {
  const global = useGlobal();

  const lang = global.user.value?.language || 'en';

  return getLanguageContent(lang, children as LangContentName);
}

export function getContent(name: LangContentName) {
  const global = useGlobal();

  const lang = global.user.value?.language || 'en';

  return getLanguageContent(lang, name);
}
