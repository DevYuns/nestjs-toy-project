import { UserRole } from './../users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';

export type allowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: allowedRoles[]) => SetMetadata('roles', roles);
