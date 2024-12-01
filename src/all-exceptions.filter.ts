import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from './my-logger/my-logger.service';
import { MongooseError } from 'mongoose';

type ResponseObject = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly myLoggerService = new MyLoggerService(
    AllExceptionsFilter.name,
  );

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseObject: ResponseObject = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    if (exception instanceof HttpException) {
      responseObject.statusCode = exception.getStatus();
      responseObject.response = exception.getResponse();
    } else if (exception instanceof MongooseError) {
      responseObject.statusCode = 442;
      responseObject.response = exception.message;
    } else {
      responseObject.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      responseObject.response = 'Internal server error';
    }

    this.myLoggerService.error(exception, AllExceptionsFilter.name);

    response.status(responseObject.statusCode).json(responseObject);

    super.catch(exception, host);
  }
}
