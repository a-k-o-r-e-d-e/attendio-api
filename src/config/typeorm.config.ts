import { DataSource, DataSourceOptions } from 'typeorm';
import EnvVars from '../constants/EnvVars';
import { AddPostGISExtension1710546768616 } from '../database/migrations/1710546768616-AddPostGISExtension';
import { CreateInstitutionTable1710547690198 } from '../database/migrations/1710547690198-CreateInstitutionTable';
import { PopulateInstitutionTable1710553757443 } from '../database/migrations/1710553757443-PopulateInstitutionTable';

export const baseDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: EnvVars.DATABASE_URL,
  synchronize: true,
};

export default new DataSource({
  ...baseDataSourceOptions,
  migrations: [
    AddPostGISExtension1710546768616,
    CreateInstitutionTable1710547690198,
    PopulateInstitutionTable1710553757443,
  ],
});
