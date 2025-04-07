import { UserData } from '@/app/types.ts';

export type LangContentName = 'Options' | 'Name' | 'Email' | 'Language' | 'Save' | 'SignOut' | 'Search' | 'Texts' | 'Words' | 'Chat' | 'AskAndTheBibleAnswers' | 'Saved' | 'Explain' | 'NativeLanguage' | 'Default';

interface LanguageData {
    name: string;
    content: Record<LangContentName, string>;
    defaultTranslation: string;
}

export const LANGUAGES: Record<string, LanguageData> = {
    en: {
        name: 'English',
        defaultTranslation: "King James Version",
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
            Explain: 'Explain',
            NativeLanguage: 'Native Language',
            Default: "Default",
        }
    },
    es: {
        name: 'Español',
        defaultTranslation: "Reina-Valera 1960",
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
            Explain: 'Explicar',
            NativeLanguage: 'Idioma Nativo',
            Default: 'Predeterminado',
        }
    },
    la: {
        name: 'Latin',
        defaultTranslation: "Jerome's Vulgate",
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
            Explain: 'Explica',
            NativeLanguage: 'Lingua Nativa',
            Default: "Praedefinitus",
        }
    },
    he: {
        name: 'עברית',
        defaultTranslation: "Masoretic",
        content: {
            Options: 'אפשרויות',
            Name: 'שם',
            Email: 'אימייל',
            Language: 'שפה',
            Save: 'שמור',
            SignOut: 'התנתק',
            Search: 'חפש',
            Texts: 'טקסטים',
            Words: 'מילים',
            Chat: 'צ\'אט',
            AskAndTheBibleAnswers: 'שאל והתנ"ך יענה!',
            Saved: 'נשמר',
            Explain: 'בֵּאֵר',
            NativeLanguage: 'שָׁפַת אֲבוֹת',
            Default: "בָּרוּת",
        }
    },
    gr: {
        name: 'Ελληνικά',
        defaultTranslation: "Septuagint & Textus Receptus",
        content: {
            Options: 'Επιλογές',
            Name: 'Όνομα',
            Email: 'Ηλεκτρονικό ταχυδρομείο',
            Language: 'Γλώσσα',
            Save: 'Αποθήκευση',
            SignOut: 'Αποσύνδεση',
            Search: 'Αναζήτηση',
            Texts: 'Κείμενα',
            Words: 'Λέξεις',
            Chat: 'Συζήτηση',
            AskAndTheBibleAnswers: 'Ρώτα και η Βίβλος απαντά!',
            Saved: 'Αποθηκεύτηκε',
            Explain: 'ἐξηγέομαι',
            NativeLanguage: 'Ἡ Πατρίᾳ Γλῶσσα',
            Default: 'Πρότυπον',
        }
    },
};

export function getLanguageName(lang: string) {
    return LANGUAGES[lang].name;
}

export function validateLanguage(lang: string) {
    return lang in LANGUAGES;
}

export function getLanguageContent(lang: string, name: LangContentName) {
    return LANGUAGES[lang].content[name];
}

export function getContentUser(user: UserData | null, name: LangContentName) {
    return LANGUAGES[user?.language || 'en'].content[name];
}