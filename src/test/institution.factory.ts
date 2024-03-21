import { InstitutionType } from '../constants/enums';
import { Institution } from '../institutions/insititution.entity';

export const buildInstitutionMock = (partial?: Partial<Institution>) => {
  return {
    id: 'c6cf4509-1401-4e38-80f7-3ef2bfcf738d',
    name: 'Mock University',
    abbreviation: 'MU',
    type: InstitutionType.University,
    city: 'Mock City',
    state: 'Mock State',
    country: 'Mock Country',
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
  };
};
