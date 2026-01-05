import { describe, it, expect } from 'vitest';
import React from 'react';
import { extractText } from './textExtraction';

describe('extractText', () => {
  it('returns empty string for null/undefined', () => {
    expect(extractText(null)).toBe('');
    expect(extractText(undefined)).toBe('');
  });

  it('returns string as-is', () => {
    expect(extractText('hello world')).toBe('hello world');
  });

  it('converts numbers to strings', () => {
    expect(extractText(42)).toBe('42');
    expect(extractText(3.14)).toBe('3.14');
  });

  it('concatenates arrays of strings', () => {
    expect(extractText(['hello', ' ', 'world'])).toBe('hello world');
  });

  it('handles <br> elements as newlines', () => {
    const element = React.createElement('br');
    expect(extractText(element)).toBe('\n');
  });

  it('handles <li> elements with bullets', () => {
    const element = React.createElement('li', null, 'item');
    expect(extractText(element)).toBe('• item\n');
  });

  it('handles <a> elements with href', () => {
    const element = React.createElement('a', { href: 'https://example.com' }, 'link');
    expect(extractText(element)).toBe('link (https://example.com)');
  });

  it('handles block elements with trailing newline', () => {
    const div = React.createElement('div', null, 'content');
    expect(extractText(div)).toBe('content\n');

    const p = React.createElement('p', null, 'paragraph');
    expect(extractText(p)).toBe('paragraph\n');
  });

  it('handles nested elements', () => {
    const element = React.createElement('div', null, [
      React.createElement('span', { key: '1' }, 'hello'),
      ' ',
      React.createElement('span', { key: '2' }, 'world'),
    ]);
    expect(extractText(element)).toBe('hello world\n');
  });

  it('handles button elements', () => {
    const element = React.createElement('button', null, 'click me');
    expect(extractText(element)).toBe('click me\n');
  });

  it('handles inline elements without extra newlines', () => {
    const span = React.createElement('span', null, 'inline');
    expect(extractText(span)).toBe('inline');
  });
});
