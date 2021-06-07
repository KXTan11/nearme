import { TestBed, inject } from '@angular/core/testing';

import { AuthGuard } from './auth-guard.service.guard';

describe('AuthGuard.ServiceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard]
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
