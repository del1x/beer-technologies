import {
    BeerStyle,
    BeerType,
    TECHNIQUE_STYLES,
    Technique,
    TechniquesData
} from './Tables-data';

type JsonObject = Record<string, unknown>;

export class DataValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DataValidationError';
    }
}

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, path: string): asserts value is JsonObject {
    if (!isObject(value)) {
        throw new DataValidationError(`${path} must be an object`);
    }
}

function requireString(value: unknown, path: string): asserts value is string {
    if (typeof value !== 'string') {
        throw new DataValidationError(`${path} must be a string`);
    }
}

function validateTechnique(value: unknown, path: string): asserts value is Technique {
    requireObject(value, path);

    if (typeof value.id !== 'number' && typeof value.id !== 'string') {
        throw new DataValidationError(`${path}.id must be a number or string`);
    }

    requireString(value.name, `${path}.name`);
    requireString(value.effect, `${path}.effect`);
    requireString(value.energy, `${path}.energy`);
}

export function validateTechniquesData(value: unknown): asserts value is TechniquesData {
    requireObject(value, 'techniques');

    for (const style of TECHNIQUE_STYLES) {
        const techniques = value[style];
        if (!Array.isArray(techniques)) {
            throw new DataValidationError(`techniques.${style} must be an array`);
        }

        techniques.forEach((technique, index) => {
            validateTechnique(technique, `techniques.${style}[${index}]`);
        });
    }
}

function isBeerStyle(value: string): value is BeerStyle {
    return value === 'Мутный' || value === 'Чистый';
}

function validateBeerType(value: unknown, path: string): asserts value is BeerType {
    requireObject(value, path);
    requireString(value.name, `${path}.name`);
    requireString(value.stance, `${path}.stance`);
    requireString(value.style, `${path}.style`);
    requireString(value.energy, `${path}.energy`);
    requireString(value.feature, `${path}.feature`);

    if (value.stance !== 'dark' && value.stance !== 'light') {
        throw new DataValidationError(`${path}.stance must be "dark" or "light"`);
    }

    if (!isBeerStyle(value.style)) {
        throw new DataValidationError(`${path}.style must be "Мутный" or "Чистый"`);
    }
}

export function validateBeerTypesData(value: unknown): asserts value is BeerType[] {
    if (!Array.isArray(value)) {
        throw new DataValidationError('beer-types must be an array');
    }

    value.forEach((beerType, index) => {
        validateBeerType(beerType, `beer-types[${index}]`);
    });
}
