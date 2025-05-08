import { TestBed } from '@angular/core/testing';

import { ConfigLogoService } from './config-logo.service';

describe('ConfigLogoService', () => {
  let service: ConfigLogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigLogoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
