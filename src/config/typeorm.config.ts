import { DataSource, DataSourceOptions } from 'typeorm';
import EnvVars from '../constants/EnvVars';

export const baseDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: EnvVars.DATABASE_URL,
  synchronize: true
};

export default new DataSource({
  ...baseDataSourceOptions,
  migrations: [],
});
