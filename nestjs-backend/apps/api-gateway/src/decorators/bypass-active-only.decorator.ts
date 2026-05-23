import { SetMetadata } from '@nestjs/common';

export const BYPASS_ACTIVE_ONLY_KEY = 'bypassIfActiveOnly';
export const BypassIfActiveOnly = () => SetMetadata(BYPASS_ACTIVE_ONLY_KEY, true);
