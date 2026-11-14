import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../db/connection';
import { User, ApiResponse } from '../models/types';
import { AppError } from '../middleware/error-handler';

export const authRoutes = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
authRoutes.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Missing required fields');
    }

    if (!['student', 'professor'].includes(role)) {
      throw new AppError(400, 'INVALID_ROLE', 'Role must be student or professor');
    }

    // Check if user already exists
    const existing = await queryOne<User>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing) {
      throw new AppError(409, 'USER_EXISTS', 'User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [user] = await query<User>(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [email, name, password_hash, role]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{ user: User; token: string }> = {
      success: true,
      data: { user, token },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
authRoutes.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Email and password required');
    }

    // Get user with password hash
    const user = await queryOne<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    const response: ApiResponse<{ user: Omit<User, 'password_hash'>; token: string }> = {
      success: true,
      data: { user: userWithoutPassword, token },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});
