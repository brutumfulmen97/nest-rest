import { SetMetadata } from '@nestjs/common';

export const UseDatabase = (database: 'youtrack' | 'gitlab') =>
  SetMetadata('database', database);
