import { SetMetadata } from '@nestjs/common';

export const USE_PUBLIC_KEY = 'isPublic';
export const UsePublic = () => SetMetadata(USE_PUBLIC_KEY, true);
