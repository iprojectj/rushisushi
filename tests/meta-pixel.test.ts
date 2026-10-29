import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

const pages = [
  'public/index.html',
  'public/pedido.html',
  'public/obrigado.html',
  'public/mx/index.html',
  'public/mx/gracias.html',
  'public/v99-core-secure-app.js',
  'public/payment-blindado.js',
  'public/obrigado-blindado.js',
];

describe('Meta pixel destination', () => {
  for (const page of pages) {
    it(`reports only to pixel 1656196479196220 in ${page}`, () => {
      const source = readFileSync(page, 'utf8');
      const initializedIds = [...source.matchAll(/fbq\('init', '([0-9]+)'/g)]
        .map((match) => match[1]);
      expect(initializedIds).toEqual(['1656196479196220']);
      const fallbackIds = [...source.matchAll(/facebook\.com\/tr\?id=([0-9]+)/g)]
        .map((match) => match[1]);
      expect(fallbackIds).toEqual(['1656196479196220']);
    });
  }
});