/**
 * Public API Contract: Users Module
 *
 * This is the ONLY authorized entry point for other modules to import from the users module.
 */

// Router & Controller
export { authRouter, default as defaultAuthRouter } from './users.controller.ts';

// Service layer
export { usersService, UsersService } from './users.service.ts';

// Repository layer
export { usersRepository, UsersRepository } from './users.repository.ts';

// Database Schema & Database Types (from centralized db/schema)
export {
  usersTable,
  type UserDb,
  type NewUserDb,
} from '../db/schema/index.ts';
