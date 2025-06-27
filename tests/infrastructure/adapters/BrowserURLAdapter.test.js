import { URLOperations } from '../../../src/infrastructure/adapters/BrowserURLAdapter.js';

describe('URLOperations', () => {
  describe('isValidParameterName', () => {
    it('should return true for valid parameter names', () => {
      expect(URLOperations.isValidParameterName('param')).toBe(true);
      expect(URLOperations.isValidParameterName('gameId')).toBe(true);
      expect(URLOperations.isValidParameterName('user_id')).toBe(true);
      expect(URLOperations.isValidParameterName('level-1')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(URLOperations.isValidParameterName('')).toBe(false);
    });

    it('should return false for whitespace-only strings', () => {
      expect(URLOperations.isValidParameterName('   ')).toBe(false);
      expect(URLOperations.isValidParameterName('\t')).toBe(false);
      expect(URLOperations.isValidParameterName('\n')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(URLOperations.isValidParameterName(null)).toBe(false);
      expect(URLOperations.isValidParameterName(undefined)).toBe(false);
      expect(URLOperations.isValidParameterName(123)).toBe(false);
      expect(URLOperations.isValidParameterName({})).toBe(false);
      expect(URLOperations.isValidParameterName([])).toBe(false);
    });
  });

  describe('isValidParameterValue', () => {
    it('should return true for valid values', () => {
      expect(URLOperations.isValidParameterValue('string')).toBe(true);
      expect(URLOperations.isValidParameterValue('')).toBe(true);
      expect(URLOperations.isValidParameterValue(0)).toBe(true);
      expect(URLOperations.isValidParameterValue(false)).toBe(true);
      expect(URLOperations.isValidParameterValue({})).toBe(true);
      expect(URLOperations.isValidParameterValue([])).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(URLOperations.isValidParameterValue(null)).toBe(false);
      expect(URLOperations.isValidParameterValue(undefined)).toBe(false);
    });
  });

  describe('applyParameterChanges', () => {
    let searchParams;

    beforeEach(() => {
      searchParams = new URLSearchParams();
    });

    it('should add new parameters', () => {
      const changes = new Map([
        ['newParam', 'newValue'],
        ['anotherParam', 'anotherValue'],
      ]);

      URLOperations.applyParameterChanges(searchParams, changes);

      expect(searchParams.get('newParam')).toBe('newValue');
      expect(searchParams.get('anotherParam')).toBe('anotherValue');
    });

    it('should update existing parameters', () => {
      searchParams.set('existingParam', 'oldValue');
      const changes = new Map([['existingParam', 'newValue']]);

      URLOperations.applyParameterChanges(searchParams, changes);

      expect(searchParams.get('existingParam')).toBe('newValue');
    });

    it('should delete parameters with null values', () => {
      searchParams.set('paramToDelete', 'value');
      searchParams.set('paramToKeep', 'keepValue');

      const changes = new Map([
        ['paramToDelete', null],
        ['paramToKeep', 'newValue'],
      ]);

      URLOperations.applyParameterChanges(searchParams, changes);

      expect(searchParams.has('paramToDelete')).toBe(false);
      expect(searchParams.get('paramToKeep')).toBe('newValue');
    });

    it('should skip invalid parameter values', () => {
      const changes = new Map([
        ['validParam', 'validValue'],
        ['invalidParam1', null],
        ['invalidParam2', undefined],
      ]);

      URLOperations.applyParameterChanges(searchParams, changes);

      expect(searchParams.get('validParam')).toBe('validValue');
      expect(searchParams.has('invalidParam1')).toBe(false);
      expect(searchParams.has('invalidParam2')).toBe(false);
    });

    it('should handle empty changes map', () => {
      searchParams.set('existingParam', 'value');
      const changes = new Map();

      URLOperations.applyParameterChanges(searchParams, changes);

      expect(searchParams.get('existingParam')).toBe('value');
    });

    it('should handle various value types', () => {
      const changes = new Map([
        ['stringParam', 'string'],
        ['numberParam', 123],
        ['booleanParam', false],
        ['objectParam', {}],
        ['arrayParam', []],
      ]);

      URLOperations.applyParameterChanges(searchParams, changes);

      expect(searchParams.get('stringParam')).toBe('string');
      expect(searchParams.get('numberParam')).toBe('123');
      expect(searchParams.get('booleanParam')).toBe('false');
      expect(searchParams.get('objectParam')).toBe('[object Object]');
      expect(searchParams.get('arrayParam')).toBe('');
    });
  });

  describe('isValidURL', () => {
    it('should return true for valid URL objects', () => {
      const url1 = new URL('https://example.com');
      const url2 = new URL('http://localhost:3000/path?param=value');
      const url3 = new URL('file:///path/to/file.html');

      expect(URLOperations.isValidURL(url1)).toBe(true);
      expect(URLOperations.isValidURL(url2)).toBe(true);
      expect(URLOperations.isValidURL(url3)).toBe(true);
    });

    it('should return false for non-URL objects', () => {
      expect(URLOperations.isValidURL('https://example.com')).toBe(false);
      expect(URLOperations.isValidURL(null)).toBe(false);
      expect(URLOperations.isValidURL(undefined)).toBe(false);
      expect(URLOperations.isValidURL({})).toBe(false);
      expect(URLOperations.isValidURL([])).toBe(false);
      expect(URLOperations.isValidURL(123)).toBe(false);
    });

    it('should return false for objects that look like URLs but are not', () => {
      const fakeURL = {
        href: 'https://example.com',
        searchParams: new URLSearchParams(),
      };

      expect(URLOperations.isValidURL(fakeURL)).toBe(false);
    });
  });
});
