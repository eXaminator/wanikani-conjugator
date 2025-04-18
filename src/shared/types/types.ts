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
        parts_of_speech: string[];
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
