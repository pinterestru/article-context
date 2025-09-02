import { describe, it, expect } from 'vitest';
import { TrackerAPIError } from '../tracker.types';

describe('Tracker Types', () => {

  describe('TrackerAPIError', () => {
    it('should create error with all properties', () => {
      const error = new TrackerAPIError(
        'API request failed',
        'API_ERROR',
        500,
        { foo: 'bar' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TrackerAPIError);
      expect(error.message).toBe('API request failed');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ foo: 'bar' });
      expect(error.name).toBe('TrackerAPIError');
    });

    it('should create error with minimal properties', () => {
      const error = new TrackerAPIError('Simple error');

      expect(error.message).toBe('Simple error');
      expect(error.code).toBeUndefined();
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });
});