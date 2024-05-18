import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { AuthService } from '@/auth/src/auth.service';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TokenResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly authService: AuthService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const requestToken = request.headers?.authorization?.split(' ')[1];

    const pipeMap = async (data) => {
      try {
        if (!data || !requestToken || data?.accessToken) return data;
        const token = await this.authService.rebuildToken(requestToken);
        if (!token) return data;
        return { ...data, token };
      } catch (_) {
        return data;
      }
    };

    return next.handle().pipe(map(pipeMap));
  }
}
