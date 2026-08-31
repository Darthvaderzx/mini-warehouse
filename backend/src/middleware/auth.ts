import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../domain/entities';

const JWT_SECRET = process.env.JWT_SECRET || 'mini-warehouse-secret-key-development-2026';

export interface AuthContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  deviceId?: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
      tenantId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  // For internal requests or if token is present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        userId: decoded.sub || decoded.userId,
        tenantId: decoded.tenant_id || decoded.tenantId,
        role: decoded.role || 'Admin',
        deviceId: decoded.device_id || decoded.deviceId || (req.headers['x-device-id'] as string),
        email: decoded.email || 'admin@acme.com',
        name: decoded.name || 'Admin User'
      };
      req.tenantId = req.user.tenantId;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Default tenant for unauthenticated / demo fallback requests
  const fallbackTenant = (req.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000001';
  req.tenantId = fallbackTenant;
  req.user = {
    userId: '10000000-0000-0000-0000-000000000001',
    tenantId: fallbackTenant,
    role: 'Admin',
    deviceId: (req.headers['x-device-id'] as string),
    email: 'admin@acme.com',
    name: 'Admin User'
  };
  return next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.tenantId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role permissions' });
    }
    next();
  };
}
