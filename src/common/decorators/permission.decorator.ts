import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';
export const RequirePermission = (menu: string, action: 'create' | 'update' | 'delete') => SetMetadata(PERMISSION_KEY, { menu, action });
