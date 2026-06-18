import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { AppError } from "../middlewares/error.middleware";
import { LoginInput, RegisterPatientInput } from "../validations/auth.validation";

interface UsuarioRow extends RowDataPacket {
  id: number;
  clinica_id: number | null;
  rol_id: number;
  rol_codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  password_hash: string;
  telefono: string | null;
  activo: number;
}

const ROL_PACIENTE_ID = 7;

/** Datos publicos del usuario (sin password_hash). */
function toPublicUser(u: UsuarioRow) {
  return {
    id: u.id,
    clinicaId: u.clinica_id,
    rol: u.rol_codigo,
    nombres: u.nombres,
    apellidos: u.apellidos,
    email: u.email,
    telefono: u.telefono,
  };
}

async function findUserByEmail(email: string): Promise<UsuarioRow | undefined> {
  const [rows] = await pool.execute<UsuarioRow[]>(
    `SELECT u.*, r.codigo AS rol_codigo
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
      WHERE u.email = ?
      LIMIT 1`,
    [email]
  );
  return rows[0];
}

/** Login: valida credenciales y devuelve token + usuario. */
export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  if (!user || !user.activo) {
    throw new AppError("Credenciales invalidas", 401);
  }

  const valid = await comparePassword(input.password, user.password_hash);
  if (!valid) {
    throw new AppError("Credenciales invalidas", 401);
  }

  await pool.execute("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?", [user.id]);

  const token = signToken({
    sub: user.id,
    rol: user.rol_codigo,
    clinicaId: user.clinica_id,
  });

  return { token, user: toPublicUser(user) };
}

/**
 * Registro de paciente: crea usuario (rol PACIENTE) + ficha en pacientes,
 * dentro de una transaccion.
 */
export async function registerPatient(input: RegisterPatientInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AppError("El email ya esta registrado", 409);
  }

  const conn: PoolConnection = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const hash = await hashPassword(input.password);

    const [userResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO usuarios (clinica_id, rol_id, nombres, apellidos, email, password_hash, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.clinica_id,
        ROL_PACIENTE_ID,
        input.nombres,
        input.apellidos,
        input.email,
        hash,
        input.telefono ?? null,
      ]
    );
    const usuarioId = userResult.insertId;

    await conn.execute<ResultSetHeader>(
      `INSERT INTO pacientes
        (clinica_id, usuario_id, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, sexo, telefono, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.clinica_id,
        usuarioId,
        input.tipo_documento,
        input.numero_documento,
        input.nombres,
        input.apellidos,
        input.fecha_nacimiento ?? null,
        input.sexo ?? "OTRO",
        input.telefono ?? null,
        input.email,
      ]
    );

    await conn.commit();

    const created = await findUserByEmail(input.email);
    const token = signToken({
      sub: created!.id,
      rol: created!.rol_codigo,
      clinicaId: created!.clinica_id,
    });
    return { token, user: toPublicUser(created!) };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Devuelve los datos del usuario autenticado. */
export async function getMe(userId: number) {
  const [rows] = await pool.execute<UsuarioRow[]>(
    `SELECT u.*, r.codigo AS rol_codigo
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
      WHERE u.id = ?
      LIMIT 1`,
    [userId]
  );
  const user = rows[0];
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return toPublicUser(user);
}
