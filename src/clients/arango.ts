import { Database } from 'arangojs';
import { configuration } from '../config';
import { LoggerService } from '../logger.service';
import { cache } from '..';
import { ITypologyExpression } from '../interfaces/iTypologyExpression';

export class ArangoDBService {
  client: Database;

  constructor() {
    this.client = new Database({
      url: configuration.db.url,
      databaseName: configuration.db.name,
      auth: {
        username: configuration.db.user,
        password: configuration.db.password,
      },
    });

    if (this.client.isArangoDatabase) {
      LoggerService.log('✅ ArangoDB connection is ready');
    } else {
      LoggerService.error('❌ ArangoDB connection is not ready');
      throw new Error('ArangoDB connection is not ready');
    }
  }

  async query(query: string): Promise<unknown> {
    try {
      const cycles = await this.client.query(query);

      const results = await cycles.batches.all();

      LoggerService.log(`Query result: ${JSON.stringify(results)}`);

      return results;
    } catch (error) {
      LoggerService.error('Error while executing query from arango with message:', error as Error, 'ArangoDBService');
    }
  }

  async getTypologyExpression(typologyId: string): Promise<ITypologyExpression | undefined> {
    const cacheVal = cache.get(typologyId);
    if (cacheVal) return cacheVal as ITypologyExpression;
    const span = apm.startSpan('Fetch Typology Expression from Database');
    const typologyExpressionQuery = `
        FOR doc IN typologyExpression
        FILTER doc._key == "${typologyId}"
        RETURN doc
        `;

    try {
      const cycles = await this.client.query(typologyExpressionQuery);
      const results = await cycles.batches.all();
      const typologyExpression: ITypologyExpression = results[0][0];
      span?.end();
      cache.set(typologyId, results[0][0]);
      return typologyExpression;
    } catch (error) {
      span?.end();
      LoggerService.error('Error while executing ArangoDB query with message:', error as Error, 'ArangoDBService');
    }
  }
}