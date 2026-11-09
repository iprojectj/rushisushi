import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

const pixRoute = readFileSync('src/routes/criar-pix.ts', 'utf8');
const settingsPage = readFileSync('src/routes/_authenticated/admin.settings.tsx', 'utf8');

describe('PIX gateway selection has no automatic fallback', () => {
  it('calls the gateway API only for the gateway chosen in the panel', () => {
    expect(pixRoute).toContain('await gerarPix(activeGateway)');
    // nunca chamamos gerarPix com um gateway fixo ("paradise", "pagbank", ...)
    expect(pixRoute).not.toMatch(/gerarPix\(\s*["'`]/);
    // e nunca iteramos uma lista de gateways tentando um atrás do outro
    expect(pixRoute).not.toMatch(/for\s*\(\s*(const|let)\s+\w+\s+of\s+/);
  });

  it('does not keep a backup-gateway list or fallback wording', () => {
    expect(pixRoute).not.toMatch(/const ordem\s*=/);
    expect(pixRoute).not.toMatch(/reserva/i);
  });

  it('does not tell the admin that other gateways are tried automatically', () => {
    expect(settingsPage).not.toMatch(/tenta os outros/i);
    expect(settingsPage).toMatch(/nenhum outro gateway/i);
  });
});
