import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { ProjectMember, User, Task } from '../Models';

@Table({ tableName: 'projects', timestamps: true })
export class Project extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  createdBy!: string;

  @BelongsTo(() => User, 'createdBy')
  creator!: User;

  // Associations
  @HasMany(() => ProjectMember)
  members!: ProjectMember[];

  @HasMany(() => Task)
  tasks!: Task[];
}