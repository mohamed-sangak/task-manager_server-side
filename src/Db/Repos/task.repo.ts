import { Task, TaskComment, User } from '../Models';
import { TaskPriority, TaskStatus } from '../../Common/enums';

export interface TaskFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
}

export class TaskRepository {
    async findById(id: string) {
        return Task.findByPk(id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
            ],
        });
    }

    // Joins task details along with comments and commenter metadata
    async findTaskWithFullDetails(id: string) {
        return Task.findByPk(id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
                {
                    model: TaskComment,
                    include: [{ model: User, attributes: ['id', 'name'] }],
                },
            ],
            order: [[TaskComment, 'createdAt', 'ASC']],
        });
    }

    async findTasksByProject(projectId: string, filters?: TaskFilters) {
        const whereCondition: any = { projectId };

        if (filters?.status) whereCondition.status = filters.status;
        if (filters?.priority) whereCondition.priority = filters.priority;
        if (filters?.assigneeId) whereCondition.assigneeId = filters.assigneeId;

        return Task.findAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }],
        });
    }

    async create(data: Partial<Task>) {
        return Task.create(data as any);
    }

    async update(id: string, data: Partial<Task>) {
        const [affected] = await Task.update(data, { where: { id } });
        return affected > 0;
    }

    async delete(id: string) {
        const deleted = await Task.destroy({ where: { id } });
        return deleted > 0;
    }
}