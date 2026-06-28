import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'unexpected error';
        let errorType = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse() as any;

            // Extract the message and error type from NestJS default exception response
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || exceptionResponse.error || message;
                errorType = exceptionResponse.error || errorType;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Format the final JSON response sent to the client
        response.status(status).json({
            message: "failed",
            error: {
                statusCode: status,
                message: message,
                error: errorType,
            },
            timestamp: new Date().toISOString()
        });
    }
}
