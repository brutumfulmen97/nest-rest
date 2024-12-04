import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseContextService } from './database-context.service';

@Injectable()
export class DatabaseGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private databaseContext: DatabaseContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const database = this.reflector.get<string>(
      'database',
      context.getHandler(),
    );
    if (database) {
      this.databaseContext.setDatabase(database as 'youtrack' | 'gitlab');
    }
    return true;
  }
}
