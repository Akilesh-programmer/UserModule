import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isDev = process.env.NODE_ENV === 'development';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Something went wrong';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || exception.message;
    } else if (exception?.statusCode && exception?.message) {
      // TCP microservice RpcException errors arrive as plain objects { statusCode, message }
      statusCode = exception.statusCode;
      message = exception.message;
    } else if (exception?.error?.statusCode && exception?.error?.message) {
      // Alternative RPC error shape
      statusCode = exception.error.statusCode;
      message = exception.error.message;
    } else if (exception?.name === 'CastError') {
      statusCode = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${exception.value}`;
    } else if (exception?.code === 11000) {
      statusCode = HttpStatus.CONFLICT;
      const field = Object.keys(exception.keyValue || {})[0] || 'field';
      message = `Duplicate value for '${field}'. This value already exists.`;
    } else if (exception?.name === 'ValidationError') {
      statusCode = HttpStatus.BAD_REQUEST;
      const errors = Object.values(exception.errors || {}).map((e: any) => e.message);
      message = errors.join('. ');
    } else if (exception?.name === 'JsonWebTokenError') {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token. Please log in again.';
    } else if (exception?.name === 'TokenExpiredError') {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Your session has expired. Please log in again.';
    } else if (exception?.message) {
      message = exception.message;
    }

    // Handle array of messages (e.g. from class-validator)
    if (Array.isArray(message)) {
      message = message.join('. ');
    }

    const errorResponse: Record<string, any> = {
      status: 'error',
      statusCode,
      message,
    };

    if (isDev) {
      errorResponse.error = exception?.message || exception;
      errorResponse.stack = exception?.stack;
    }

    response.status(statusCode).json(errorResponse);
  }
}
