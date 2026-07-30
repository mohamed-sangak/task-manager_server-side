import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Task, User } from '../Models';

@Table({ tableName: 'task_comments', updatedAt: false }) // Schema only specifies created_at
export class TaskComment extends Model {
    @ForeignKey(() => Task)
    @Column({ type: DataType.UUID, allowNull: false })
    taskId!: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    userId!: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    content!: string;

    @CreatedAt
    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    createdAt!: Date;

    // Associations
    @BelongsTo(() => Task)
    task!: Task;

    @BelongsTo(() => User)
    user!: User;
}