import { TestBed } from '@angular/core/testing';

import { CiberDb } from './ciber-db';

describe('CiberDb', () => {
  let service: CiberDb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CiberDb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
