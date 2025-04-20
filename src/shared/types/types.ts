export type PartOfSpeech = 'adjective' | 'counter' | 'expression' | 'godan verb' | 'ichidan verb' | 'in compounds' | 'independent noun' | 'interjection' | 'intransitive verb' | 'noun' | 'numeral' | 'prefix' | 'pronoun' | 'proper noun' | 'suffix' | 'transitive verb' | 'verbal noun' | 'い adjective' | 'する verb' | 'な adjective' | 'の adjective';

export type Subject = {
    id: number;
    object: string;
    data: {
        level: number;
        characters: string;
        meanings: Array<{
            meaning: string;
            primary: boolean;
        }>;
        readings: Array<{
            reading: string;
            primary: boolean;
        }>;
        parts_of_speech: PartOfSpeech[];
        lesson_position: number;
        pronunciation_audios: {
            url: string;
            content_type: 'audio/webm' | 'audio/ogg';
            metadata: {
                gender: 'male' | 'female';
                pronunciation: string;
            };
        }[];
    };
};
