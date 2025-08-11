import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/users/assets/roles';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
