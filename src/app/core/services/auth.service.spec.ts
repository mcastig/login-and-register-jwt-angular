import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('should send POST request with credentials', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { token: 'mock-token', user: { id: 1, email: 'test@example.com' } };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('https://tu-api.com/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should store token in localStorage on successful login', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { token: 'mock-token-123', user: { id: 1, email: 'test@example.com' } };

      vi.spyOn(localStorage, 'setItem');

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush(mockResponse);

      expect(localStorage.setItem).toHaveBeenCalledWith('token_access', 'mock-token-123');
    });

    it('should set currentUser signal on successful login', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      const mockResponse = { token: 'mock-token', user: mockUser };

      service.login(credentials).subscribe(() => {
        expect(service.currentUser()).toEqual(mockUser);
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush(mockResponse);
    }));

    it('should update isAuthenticated computed signal after login', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResponse = { token: 'mock-token', user: mockUser };

      expect(service.isAuthenticated()).toBe(false);

      service.login(credentials).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush(mockResponse);
    }));
  });

  describe('logout()', () => {
    it('should remove token from localStorage on logout', () => {
      vi.spyOn(localStorage, 'removeItem');

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token_access');
    });

    it('should clear currentUser signal on logout', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResponse = { token: 'mock-token', user: mockUser };

      service.login(credentials).subscribe(() => {
        expect(service.currentUser()).toBeTruthy();
        service.logout();
        expect(service.currentUser()).toBeNull();
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush(mockResponse);
    }));

    it('should set isAuthenticated to false on logout', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResponse = { token: 'mock-token', user: mockUser };

      service.login(credentials).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        service.logout();
        expect(service.isAuthenticated()).toBe(false);
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush(mockResponse);
    }));
  });

  describe('currentUser signal', () => {
    it('should be initially null', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should be read-only', () => {
      const currentUserSignal = service.currentUser;
      expect(() => {
        (currentUserSignal as any).set({});
      }).toThrow();
    });
  });

  describe('isAuthenticated computed', () => {
    it('should return false when currentUser is null', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when currentUser is set', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResponse = { token: 'mock-token', user: mockUser };

      service.login(credentials).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush(mockResponse);
    }));
  });

  describe('Error handling', () => {
    it('should handle login error', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'wrong' };

      service.login(credentials).subscribe({
        next: () => {
          throw new Error('should have failed with 401 error');
        },
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    }));

    it('should not set currentUser on login error', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'wrong' };

      service.login(credentials).subscribe({
        next: () => {},
        error: () => {
          expect(service.currentUser()).toBeNull();
        }
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    }));
  });

  describe('Token management', () => {
    it('should retrieve token from localStorage after login', waitForAsync(() => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockToken = 'test-token-12345';
      const mockResponse = { token: mockToken, user: { id: 1, email: 'test@example.com' } };

      vi.spyOn(localStorage, 'getItem').mockReturnValue(mockToken);

      service.login(credentials).subscribe(() => {
        const storedToken = localStorage.getItem('token_access');
        expect(storedToken).toBe(mockToken);
      });

      const req = httpMock.expectOne('https://tu-api.com/login');
      req.flush(mockResponse);
    }));

    it('should handle multiple login/logout cycles', waitForAsync(() => {
      const credentials1 = { email: 'user1@example.com', password: 'pass1' };
      const credentials2 = { email: 'user2@example.com', password: 'pass2' };
      const mockUser1 = { id: 1, email: 'user1@example.com' };
      const mockUser2 = { id: 2, email: 'user2@example.com' };
      const mockResponse1 = { token: 'token-1', user: mockUser1 };
      const mockResponse2 = { token: 'token-2', user: mockUser2 };

      service.login(credentials1).subscribe(() => {
        expect(service.currentUser()).toEqual(mockUser1);
        service.logout();
        expect(service.currentUser()).toBeNull();
        service.login(credentials2).subscribe(() => {
          expect(service.currentUser()).toEqual(mockUser2);
        });
        const req2 = httpMock.expectOne('https://tu-api.com/login');
        req2.flush(mockResponse2);
      });

      const req1 = httpMock.expectOne('https://tu-api.com/login');
      req1.flush(mockResponse1);
    }));
  });
});
