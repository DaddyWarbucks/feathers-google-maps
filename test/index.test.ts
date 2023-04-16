import { expect } from 'vitest';
import { GoogleMapsService } from '../src';

describe('index.test.ts', function () {
  it('get started', function () {
    // @ts-expect-error test
    const googleMapsService = new GoogleMapsService({});
    expect(googleMapsService).toBeInstanceOf(GoogleMapsService);
  });
});
