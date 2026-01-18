import { auth, AuthResult } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: AuthResult;
    }
  }
}

// Auth0 JWT validation middleware
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

// Optional auth - doesn't require auth but attaches user if present
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  checkJwt(req, res, (err) => {
    // If there's an error, just continue without auth
    // The user will be treated as unauthenticated
    next();
  });
};

// Get user ID from auth payload
export const getUserId = (req: Request): string | null => {
  return req.auth?.payload?.sub || null;
};

// Middleware to require a specific role
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.auth?.payload?.['https://hearmeout.app/roles'] as string[] || [];
    
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }
    
    next();
  };
};

export default checkJwt;
