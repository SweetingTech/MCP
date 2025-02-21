import { Database } from 'sqlite3';

export type SqliteRunResult = {
  lastID: number;
  changes: number;
};

export type SqliteCallback<T> = (err: Error | null, result: T) => void;

export type SqliteRunCallback = SqliteCallback<SqliteRunResult>;
export type SqliteGetCallback<T> = SqliteCallback<T>;
export type SqliteAllCallback<T> = SqliteCallback<T[]>;

export type PromisifiedRun = (sql: string, params?: any[]) => Promise<SqliteRunResult>;
export type PromisifiedGet = <T>(sql: string, params?: any[]) => Promise<T | undefined>;
export type PromisifiedAll = <T>(sql: string, params?: any[]) => Promise<T[]>;

export function promisifyRun(db: Database): PromisifiedRun {
  return (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  };
}

export function promisifyGet<T>(db: Database): PromisifiedGet {
  return (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  };
}

export function promisifyAll<T>(db: Database): PromisifiedAll {
  return (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  };
}
