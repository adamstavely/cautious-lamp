import { test } from 'node:test';
import assert from 'node:assert/strict';
import { componentDocsUrl } from '../src/docsUrl';

test('components with their own page open it; the rest open the component library', () => {
  assert.equal(componentDocsUrl('http://localhost:5174', 'Button'), 'http://localhost:5174/components/buttons');
  assert.equal(componentDocsUrl('https://ds.example.com/', 'ColorPicker'), 'https://ds.example.com/components/color-picker');
  assert.equal(componentDocsUrl('https://ds.example.com/app', 'Data Table'), 'https://ds.example.com/app/components');
});

test('an empty setting falls back to the local app', () => {
  assert.equal(componentDocsUrl('  ', 'Card'), 'http://localhost:5174/components');
});
