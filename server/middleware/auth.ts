import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

/**
 * Verify Firebase ID token by calling Google's tokeninfo endpoint.
 * Returns the Firebase UID if valid, or throws an error.
 */
async function verifyFirebaseToken(token: string): Promise<string> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
  );
  if (!res.ok) {
    throw new Error("Invalid token");
  }
  const data = (await res.json()) as Record<string, string>;
  const projectId =
    process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

  if (projectId && data.aud !== projectId) {
    throw new Error("Token audience mismatch");
  }

  const uid = data.sub;
  if (!uid) throw new Error("No UID in token");
  return uid;
}

/**
 * Middleware: require a valid Firebase Bearer token.
 * Sets req.uid on success.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    req.uid = await verifyFirebaseToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware: optionally parse a Firebase Bearer token.
 * Sets req.uid if valid, continues either way.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      req.uid = await verifyFirebaseToken(token);
    } catch {
      // ignore invalid tokens in optional mode
    }
  }
  next();
}
