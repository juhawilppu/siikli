# Security

Siikli follows a security-first design with multiple layers of protection:

- Security headers and strict Content Security Policy
- SQL injection & XSS prevention via framework defaults and validated input
- Role-based access control for all endpoints
- Tenant isolation guarded by Prisma middleware
- UUID-based identifiers
- Rate-limiting on sensitive endpoints
- Passwordless login (email OTP or Google Auth)
- Secure cookies (HttpOnly)
- IDOR-resistant endpoint design (`tenantId` and `userId` taken from JWT, not from client input)
