import { getLanguageContent, LangContentName } from '@/lib/utils/lang.ts';
import { useGlobal } from '@/islands/Global.tsx';

function getDefaultLanguage(): string {
  const browserLang = navigator.language || 'en';
  const supportedLanguages = ['en', 'es', 'la', 'gr', 'he', 'th'];
  const defaultLanguage = supportedLanguages.includes(browserLang.substring(0, 2)) ? browserLang.substring(0, 2) : 'en';
  return defaultLanguage;
}

function getLanguage(global = useGlobal()) {
  try {
    return global?.user.value?.language || getDefaultLanguage();
  } catch (e) {
    console.error('getLanguage() needs to be passed global');
  }
  return getDefaultLanguage();
}

function getNativeLanguage(global = useGlobal()) {
  return global?.user.value?.nativeLanguage || '';
}

export function Content({ children }: { children: string }) {
  return getLanguageContent(getLanguage(), children as LangContentName);
}

export function getContent(name: LangContentName, global = useGlobal()) {
  return getLanguageContent(getLanguage(global), name);
}

export function SelectLanguage(props: { hidden?: boolean } = { hidden: false }) {
  return (
    <div>
      <div class='field' style={{ display: props.hidden ? 'none' : 'block' }}>
        <label for='field-language'>
          <Content>Language</Content>
        </label>
        <select
          name='language'
          id='field-language'
          value={getLanguage()}
          style={{ width: '100%', marginBottom: 'var(--spacing)' }}
        >
          <option value='en'>English</option>
          <option value='es'>Español</option>
          <option value='la'>Latin</option>
          <option value='gr'>Greek</option>
          <option value='he'>Hebrew</option>
          <option value='th'>ไทย</option>
        </select>
      </div>
      <div class='field' style={{ display: props.hidden ? 'none' : 'block' }}>
        <label for='field-native-language'>
          <Content>NativeLanguage</Content>
        </label>
        <select name='nativeLanguage' id='field-native-language' value={getNativeLanguage()} style={{ width: '100%' }}>
          <option value=''>
            <Content>Default</Content>
          </option>
          <option value='en'>English</option>
          <option value='es'>Español</option>
          <option value='la'>Latin</option>
          <option value='gr'>Greek</option>
          <option value='he'>Hebrew</option>
          <option value='th'>ไทย</option>
        </select>
      </div>
    </div>
  );
}
