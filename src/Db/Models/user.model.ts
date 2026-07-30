import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Project, ProjectMember, Task, TaskComment } from '../Models';



@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  passwordHash!: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'User' })
  role!: string;

  // Associations
  @HasMany(() => Project, 'createdBy')
  createdProjects!: Project[];

  @HasMany(() => ProjectMember)
  memberships!: ProjectMember[];

  @HasMany(() => Task, 'createdBy')
  createdTasks!: Task[];

  @HasMany(() => Task, 'assigneeId')
  assignedTasks!: Task[];

  @HasMany(() => TaskComment)
  comments!: TaskComment[];
}