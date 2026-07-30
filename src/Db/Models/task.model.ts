import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Project, TaskComment, User } from '../Models';
import { TaskStatus, TaskPriority } from '../../Common/enums';


@Table({
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['project_id', 'status'] },
    { fields: ['project_id', 'priority'] },
    { fields: ['project_id', 'assignee_id'] },
  ],
})
export class Task extends Model {
  @ForeignKey(() => Project)
  @Column({ type: DataType.INTEGER, allowNull: false })
  projectId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(TaskStatus)),
    defaultValue: TaskStatus.TODO,
    allowNull: false,
  })
  status!: TaskStatus;

  @Column({
    type: DataType.ENUM(...Object.values(TaskPriority)),
    allowNull: false,
  })
  priority!: TaskPriority;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  dueDate!: Date | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  createdBy!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  assigneeId!: number | null;

  // Associations
  @BelongsTo(() => Project)
  project!: Project;

  @BelongsTo(() => User, 'createdBy')
  creator!: User;

  @BelongsTo(() => User, 'assigneeId')
  assignee!: User | null;

  @HasMany(() => TaskComment)
  comments!: TaskComment[];
}