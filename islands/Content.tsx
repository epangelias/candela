import { getLanguageContent, LangContentName } from '@/lib/utils/lang.ts';
import { useGlobal } from '@/islands/Global.tsx';
import { JSX } from 'preact/jsx-runtime';

function getDefaultLanguage(): string {
  const browserLang = navigator.language || 'en';
  const supportedLanguages = ['en', 'es', 'la'];
  const defaultLanguage = supportedLanguages.includes(browserLang.substring(0, 2)) ? browserLang.substring(0, 2) : 'en';
  return defaultLanguage;
}

function getLanguage() {
  const global = useGlobal();
  return global.user.value?.language || getDefaultLanguage();
}

export function Content({ children }: { children: string }) {
  return getLanguageContent(getLanguage(), children as LangContentName);
}

export function getContent(name: LangContentName) {
  return getLanguageContent(getLanguage(), name);
}

export function SelectLanguage(props: { hidden: boolean } = { hidden: false }) {
  return (
    <div class='field' style={{ display: props.hidden ? 'none' : 'block' }}>
      <label for='field-language'>
        <Content>Language</Content>
      </label>
      <select name='language' id='field-language' value={getLanguage()}>
        <option value='en'>English</option>
        <option value='es'>Español</option>
        <option value='la'>Latin</option>
      </select>
    </div>
  );
}
