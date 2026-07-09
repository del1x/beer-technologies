import fs from 'fs';
import path from 'path';
import {
  DataValidationError,
  validateBeerTypesData,
  validateTechniquesData
} from '@core/DataValidation';
import { BeerType, TechniquesData } from '@core/Tables-data';

function readJson(relativePath: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')
  );
}

describe('current JSON data contract', () => {
  let techniques: unknown;
  let beerTypes: unknown;

  beforeEach(() => {
    techniques = readJson('public/api/techniques.json');
    beerTypes = readJson('public/api/beer-types.json');
  });

  it('keeps the current technique count and category order', () => {
    validateTechniquesData(techniques);

    expect(Object.keys(techniques)).toEqual([
      'dark-precise',
      'dark-chaos',
      'light-pure',
      'light-chaos'
    ]);
    expect(Object.values(techniques).reduce((total, items) => total + items.length, 0)).toBe(50);
  });

  it('keeps the exact current technique order', () => {
    validateTechniquesData(techniques);

    const expectedOrder: Record<keyof TechniquesData, string[]> = {
      'dark-precise': [
        'Таинственное исчезновение', 'Чёрная метка', 'Шпионская тень',
        'Точный расчёт', 'Тихий саботаж', 'Серверная ошибка',
        'Несанкционированный доступ', 'Постоянное перенаправление',
        'Контент отсутствует', 'Плохой шлюз', 'Временный редирект', 'Я чайник'
      ],
      'dark-chaos': [
        'Ложный хук', 'Самоуничтожение', 'Барабанная дробь', 'Тройной обман',
        'Сервис недоступен', 'Полуночный рейд', 'Двойной обман',
        'Системный сброс', 'Фантомный удар', 'Пирамида доверия',
        'Криптографический щит', 'Эффект апокалипсиса'
      ],
      'light-pure': [
        'Безупречный финал', 'Ответ на всё', 'Идеальный результат',
        'Удача фаворита', 'Круговая защита', 'Elite-контроль',
        'Множественный выбор', 'Новый порядок', 'Тысячелетний аргумент',
        'Факт-чекинг', 'Анти-вирус', 'Золотое сечение', 'Бесконечное изобилие'
      ],
      'light-chaos': [
        'Смена курса', 'Зеркало', 'Простой код', 'Запретный плод', 'Баланс сил',
        'Экстренный вызов', 'Скрытая последовательность', 'Магический квадрат',
        'Эхо-камера', 'Горячая линия', 'Обратный отсчёт', 'Квантовый скачок',
        'Фейерверк отвлечения'
      ]
    };

    const validatedTechniques = techniques;
    Object.entries(expectedOrder).forEach(([style, names]) => {
      expect(validatedTechniques[style as keyof TechniquesData].map(item => item.name)).toEqual(names);
    });
  });

  it('keeps the current beer count and exact order', () => {
    validateBeerTypesData(beerTypes);

    expect(beerTypes).toHaveLength(21);
    expect(beerTypes.map(item => item.name)).toEqual([
      'Imperial Stout', 'Pilsner', 'Baltic Porter', 'Hefeweizen',
      'Oatmeal Stout', 'American Pale Ale', 'Russian Imperial Stout',
      'Berliner Weisse', 'Barley Wine', 'Kölsch', 'Milk Stout', 'Gose',
      'Rauchbier', 'Session IPA', 'Scotch Ale', 'Witbier', 'Double IPA',
      'Bock', 'Lambic', 'Schwarzbier', 'New England IPA'
    ]);
  });

  it('accepts mixed string and number technique IDs without normalization', () => {
    validateTechniquesData(techniques);

    expect(techniques['dark-precise'][0].id).toBe(404);
    expect(techniques['dark-precise'][2].id).toBe('007');
  });

  it('rejects invalid structures instead of normalizing them', () => {
    const invalidTechniques = {
      ...(techniques as TechniquesData),
      'dark-precise': [{ id: 1, name: 'name', effect: 'effect', energy: 3 }]
    };
    const invalidBeerTypes = [
      { name: 'Beer', stance: 'unknown', style: 'Чистый', energy: '+1', feature: 'feature' }
    ] as unknown as BeerType[];

    expect(() => validateTechniquesData(invalidTechniques)).toThrow(DataValidationError);
    expect(() => validateBeerTypesData(invalidBeerTypes)).toThrow(DataValidationError);
  });
});
