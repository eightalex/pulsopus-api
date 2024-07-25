export * as config from './config';
export * from './config.module';
import cnf from './config';
export type TConfig = typeof cnf;
