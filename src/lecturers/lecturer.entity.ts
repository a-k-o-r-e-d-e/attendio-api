import { Entity } from 'typeorm';
import { Profile } from '../common/entities/profile.entity';

@Entity()
export class Lecturer extends Profile {
  constructor(partial: Partial<Lecturer>) {
    super();
    Object.assign(this, partial);
  }
}
