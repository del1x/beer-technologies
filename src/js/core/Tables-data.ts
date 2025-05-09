export interface Technique {
    id: number | string;
    name: string;
    effect: string;
    energy: string;
}

export interface BeerType {
    name: string;
    stance: 'dark' | 'light';
    style: string;
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