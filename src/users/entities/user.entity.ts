import { CoreEntity } from './../../common/entities/core.entity';
import { Entity, Column } from 'typeorm';

export type UserRole = 'client' | 'owner' | 'delivery';

@Entity()
export class User extends CoreEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}
