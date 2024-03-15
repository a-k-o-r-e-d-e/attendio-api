import { DataSource, DataSourceOptions } from 'typeorm';
import EnvVars from '../constants/EnvVars';
import { AddPostGISExtension1710546768616 } from '../database/migrations/1710546768616-AddPostGISExtension';

export const baseDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: EnvVars.DATABASE_URL,
  synchronize: true
};

export default new DataSource({
  ...baseDataSourceOptions,
  migrations: [AddPostGISExtension1710546768616],
});
