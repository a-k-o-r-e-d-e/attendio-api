import { DataSource, DataSourceOptions } from 'typeorm';
import EnvVars from '../constants/EnvVars';
import { AddPostGISExtension1710546768616 } from '../database/migrations/1710546768616-AddPostGISExtension';
import { CreateInstitutionTable1710547690198 } from '../database/migrations/1710547690198-CreateInstitutionTable';
import { PopulateInstitutionTable1710553757443 } from '../database/migrations/1710553757443-PopulateInstitutionTable';

export const baseDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: EnvVars.DATABASE_URL,
  extra: {
    ssl: {
      require: true,
      /// note setting this to false opens us to Man In the middle attacks
      /// To really solve this problem we need to set up proper SSL cert on Heroku
      /// Easiest way to do this is to move from eco to basic plan and enable ACM [https://devcenter.heroku.com/articles/automated-certificate-management]
      rejectUnauthorized: false,
    },
  },
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
