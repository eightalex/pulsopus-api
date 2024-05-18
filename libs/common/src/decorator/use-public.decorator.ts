import { USE_PUBLIC_KEY } from '@app/common/constants';
import { SetMetadata } from '@nestjs/common';

export const UsePublic = () => SetMetadata(USE_PUBLIC_KEY, true);
