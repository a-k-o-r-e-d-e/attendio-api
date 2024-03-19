import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/constants/enums';

/// To be used with [RolesGuard] role.guard.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
