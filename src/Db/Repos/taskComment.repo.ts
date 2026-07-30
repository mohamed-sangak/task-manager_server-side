import { TaskComment, User } from '../Models';

export class TaskCommentRepository {
  async findById(id: string) {
    return TaskComment.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'name'] }],
    });
  }

  async findCommentsByTask(taskId: string) {
    return TaskComment.findAll({
      where: { taskId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']],
    });
  }

  async create(taskId: string, userId: string, content: string) {
    return TaskComment.create({ taskId, userId, content } as any);
  }

  async delete(id: string) {
    const deleted = await TaskComment.destroy({ where: { id } });
    return deleted > 0;
  }
}