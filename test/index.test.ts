import { describe, it, expect } from 'vitest';
import { hello } from '../src/index';

describe('hello', () => {
  it('should return greeting', () => {
    expect(hello()).toBe('Hello, kotemari-ts!');
  });
});
