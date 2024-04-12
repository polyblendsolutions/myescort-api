import { SetMetadata } from '@nestjs/common';

import { ADMIN_ROLES_KEY } from '../core/global-variables';
import { AdminRoles } from '../enum/admin-roles.enum';

export const AdminMetaRoles = (...roles: AdminRoles[]) => SetMetadata(ADMIN_ROLES_KEY, roles);
