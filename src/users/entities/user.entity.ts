import { Entity, Column } from 'typeorm';

export type UserRole = 'client' | 'owner' | 'delivery';

@Entity()
export class User {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}
