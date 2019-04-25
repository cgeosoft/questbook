import { Injectable } from '@angular/core';
import * as AdapterHttp from 'pouchdb-adapter-http';
import * as AdapterIDB from 'pouchdb-adapter-idb';
import { RxCollection } from 'rxdb';
import RxDB from 'rxdb/plugins/core';
import EncryptionPlugin from 'rxdb/plugins/encryption';
import LeaderelectionPlugin from 'rxdb/plugins/leader-election';
import ReplicationPlugin from 'rxdb/plugins/replication';
import UpdatePlugin from 'rxdb/plugins/update';
import ValidatePlugin from 'rxdb/plugins/validate';
import schema from '../schemas/item.schema.json';
RxDB.plugin(ValidatePlugin);
RxDB.plugin(UpdatePlugin);
RxDB.plugin(ReplicationPlugin);
RxDB.plugin(LeaderelectionPlugin);
RxDB.plugin(EncryptionPlugin);
RxDB.plugin(AdapterIDB);
RxDB.plugin(AdapterHttp);

const syncURL = 'https://db.cgeosoft.com/';

@Injectable()
export class DatabaseService {
  static db$: {[key: string]: Promise<RxCollection>} = {};

  private async _create(campaign: string): Promise<RxCollection> {
    console.log('DatabaseService: creating database..');
    const db = await RxDB.create({ name: campaign, adapter: 'idb' });

    console.log('DatabaseService: create collections');
    await db.collection({
      name: campaign,
      schema: schema
    });

    // sync
    console.log('DatabaseService: sync');
    db[campaign].sync({ remote: syncURL + campaign + '/' });

    return db[campaign];
  }

  get(campaign: string): Promise<RxCollection> {
    if (DatabaseService.db$[campaign]) {
      return DatabaseService.db$[campaign];
    }

    // create database
    DatabaseService.db$[campaign] = this._create(campaign);
    return DatabaseService.db$[campaign];
  }
}
