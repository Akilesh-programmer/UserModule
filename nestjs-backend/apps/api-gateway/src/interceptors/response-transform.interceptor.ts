import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        // If response already has a 'status' field (e.g., login/logout), pass through
        if (response && typeof response === "object" && "status" in response) {
          return response;
        }
        // Wrap in standard envelope
        return {
          status: "success",
          data: { data: response },
        };
      }),
    );
  }
}
