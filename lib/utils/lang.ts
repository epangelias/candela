
export type LangContentName = 'Options' | 'Name' | 'Email' | 'Language' | 'Save' | 'Sign Out';

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
            'Sign Out': 'Sign Out',
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
            'Sign Out': 'Cerrar sesión',
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
            'Sign Out': 'Egredi',
        }
    },
}

export function validateLanguage(lang: string) {
    return lang in languages
}

export function getLanguageContent(lang: string, name: LangContentName) {
    return languages[lang].content[name];
}