import { ExcludePasswordInterceptor } from './exclude-password.interceptor';

describe('ExcludePasswordInterceptor', () => {
  it('should be defined', () => {
    expect(new ExcludePasswordInterceptor()).toBeDefined();
  });
});
