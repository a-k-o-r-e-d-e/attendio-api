import { IsEnum } from "class-validator";
import { NotificationType } from "../../constants/enums";
import { User } from "../../users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NotificationData } from "../interfaces/notification-data.interface";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => User, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @Column()
  title!: string;

  @Column({ default: '' })
  body!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ type: 'jsonb' })
  data!: NotificationData;
}