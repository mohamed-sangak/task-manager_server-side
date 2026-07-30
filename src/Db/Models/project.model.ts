import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { ProjectMember, User, Task } from '../Models';

@Table({ tableName: 'projects', timestamps: true })
export class Project extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  createdBy!: number;

  @BelongsTo(() => User, 'createdBy')
  creator!: User;

  // Associations
  @HasMany(() => ProjectMember)
  members!: ProjectMember[];

  @HasMany(() => Task)
  tasks!: Task[];
}