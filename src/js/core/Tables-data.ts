export const TECHNIQUE_STYLES = [
    'dark-precise',
    'dark-chaos',
    'light-pure',
    'light-chaos'
] as const;

export type TechniqueStyle = typeof TECHNIQUE_STYLES[number];

export interface Technique {
    id: number | string;
    name: string;
    effect: string;
    energy: string;
}

export type TechniquesData = Record<TechniqueStyle, Technique[]>;

export type BeerStance = 'dark' | 'light';
export type BeerStyle = 'Мутный' | 'Чистый';

export interface BeerType {
    name: string;
    stance: BeerStance;
    style: BeerStyle;
    energy: string;
    feature: string;
}

export const getTechniqueStyleName = (styleId: string): string => {
    const names: Record<string, string> = {
        "dark-precise": "Тёмная (Точный удар)",
        "dark-chaos": "Тёмная (Контролируемый хаос)",
        "light-pure": "Светлая (Чистый стиль)",
        "light-chaos": "Светлая (Мутный стиль)"
    };
    return names[styleId] || "Неизвестный стиль";
};
