import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseContextService {
  private databaseConnection: 'youtrack' | 'gitlab' = 'youtrack';

  setDatabase(database: 'youtrack' | 'gitlab') {
    this.databaseConnection = database;
  }

  getCurrentDatabase() {
    return this.databaseConnection;
  }
}
