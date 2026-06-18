/**
 * Augmenta el objeto Request de Express con el usuario autenticado
 * que inyecta auth.middleware.
 */
export interface AuthUser {
  id: number;
  rol: string;
  clinicaId: number | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
