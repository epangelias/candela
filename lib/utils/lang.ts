import { UserData } from '@/app/types.ts';

export type LangContentName = 'Options' | 'Name' | 'Email' | 'Language' | 'Save' | 'SignOut' | 'Search' | 'Texts' | 'Words' | 'Chat' | 'AskAndTheBibleAnswers' | 'Saved';

interface LanguageData {
    name: string;
    content: Record<LangContentName, string>;
}

const languages: Record<string, LanguageData> = {
    en: {
        name: 'English',
        content: {
            Options: 'Options',
            Name: 'Name',
            Email: 'Email',
            Language: 'Language',
            Save: 'Save',
            SignOut: 'Sign Out',
            Search: 'Search',
            Texts: 'Texts',
            Words: 'Words',
            Chat: 'Chat',
            AskAndTheBibleAnswers: 'Ask and the Bible Answers!',
            Saved: 'Saved',
        }
    },
    es: {
        name: 'Español',
        content: {
            Options: 'Opciones',
            Name: 'Nombre',
            Email: 'Correo electrónico',
            Language: 'Idioma',
            Save: 'Guardar',
            SignOut: 'Cerrar sesión',
            Search: 'Buscar',
            Texts: 'Textos',
            Words: 'Palabras',
            Chat: 'Chat',
            AskAndTheBibleAnswers: '¡Preguntar y las Respuestas Bíblicas!',
            Saved: 'Guardado',
        }
    },
    la: {
        name: 'Latin',
        content: {
            Options: 'Optiones',
            Name: 'Nomen',
            Email: 'Inscriptio electronica',
            Language: 'Lingua',
            Save: 'Serva',
            SignOut: 'Egredi',
            Search: 'Quaerere',
            Texts: 'Textus',
            Words: 'Verba',
            Chat: 'Colloquium',
            AskAndTheBibleAnswers: 'Interrogare et Responsa Biblica!',
            Saved: 'Servata',
        }
    },
};

export function validateLanguage(lang: string) {
    return lang in languages;
}

export function getLanguageContent(lang: string, name: LangContentName) {
    return languages[lang].content[name];
}

export function getContentUser(user: UserData | null, name: LangContentName) {
    return languages[user?.language || 'en'].content[name];
}