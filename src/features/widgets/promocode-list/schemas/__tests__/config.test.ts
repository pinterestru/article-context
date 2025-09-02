import { describe, it, expect } from 'vitest';
import { promocodeListConfigSchema } from '../config';

describe('PromocodeListConfigSchema', () => {
  describe('withTitle field coercion', () => {
    it('should parse string "true" to boolean true', () => {
      const config = {
        source: 'dynamic',
        withTitle: 'true', // This simulates data-param-with-title="true"
      };
      
      const parsed = promocodeListConfigSchema.parse(config);
      expect(parsed.withTitle).toBe(true);
      expect(typeof parsed.withTitle).toBe('boolean');
    });

    it('should parse string "false" to boolean false', () => {
      const config = {
        source: 'dynamic',
        withTitle: 'false',
      };
      
      const parsed = promocodeListConfigSchema.parse(config);
      expect(parsed.withTitle).toBe(false);
      expect(typeof parsed.withTitle).toBe('boolean');
    });

    it('should handle boolean true directly', () => {
      const config = {
        source: 'dynamic',
        withTitle: true,
      };
      
      const parsed = promocodeListConfigSchema.parse(config);
      expect(parsed.withTitle).toBe(true);
    });

    it('should default to true when withTitle is not provided', () => {
      const config = {
        source: 'dynamic',
      };
      
      const parsed = promocodeListConfigSchema.parse(config);
      expect(parsed.withTitle).toBe(true); // Schema defaults to true
    });

    it('should parse "1" as true and "0" as false', () => {
      const config1 = {
        source: 'dynamic',
        withTitle: '1',
      };
      
      const parsed1 = promocodeListConfigSchema.parse(config1);
      expect(parsed1.withTitle).toBe(true);

      const config0 = {
        source: 'dynamic',
        withTitle: '0',
      };
      
      const parsed0 = promocodeListConfigSchema.parse(config0);
      expect(parsed0.withTitle).toBe(false);
    });
  });

  describe('other boolean fields coercion', () => {
    it('should coerce all boolean fields from strings', () => {
      const config = {
        source: 'dynamic',
        showExpiration: 'true',
        showTags: 'false',
        white: 'true',
        copyOnClick: 'false',
        trackingEnabled: '1',
      };
      
      const parsed = promocodeListConfigSchema.parse(config);
      expect(parsed.showExpiration).toBe(true);
      expect(parsed.showTags).toBe(false);
      expect(parsed.white).toBe(true);
      expect(parsed.copyOnClick).toBe(false);
      expect(parsed.trackingEnabled).toBe(true);
    });
  });

  describe('number field coercion', () => {
    it('should coerce itemsPerPage from string to number', () => {
      const config = {
        source: 'dynamic',
        itemsPerPage: '10', // This simulates data-param-items-per-page="10"
      };
      
      const parsed = promocodeListConfigSchema.parse(config);
      expect(parsed.itemsPerPage).toBe(10);
      expect(typeof parsed.itemsPerPage).toBe('number');
    });
  });
});