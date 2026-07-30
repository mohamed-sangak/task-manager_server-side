import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Project } from './project.model';
import { User } from './user.model';
import { ProjectUserRole } from '../../Common/enums';



@Table({
  tableName: 'project_members',
  timestamps: false, 
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'user_id'], 
    },
  ],
})
export class ProjectMember extends Model {
  @ForeignKey(() => Project)
  @Column({ type: DataType.INTEGER, allowNull: false })
  projectId!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @Column({
    type: DataType.ENUM(...Object.values(ProjectUserRole)),
    allowNull: false,
  })
  role!: ProjectUserRole;

  @CreatedAt
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  joinedAt!: Date;

  // Associations
  @BelongsTo(() => Project)
  project!: Project;

  @BelongsTo(() => User)
  user!: User;
}