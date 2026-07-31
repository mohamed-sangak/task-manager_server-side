import { ProjectMember, User } from '../Models';
import { ProjectUserRole } from '../../Common/enums';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize';

export class ProjectMemberRepository {
  async findMember(projectId: string, userId: string, transaction?: Transaction) {
    return ProjectMember.findOne({
      where: { projectId, userId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      transaction,
    });
  }

  async findMembersByProject(projectId: string) {
    return ProjectMember.findAll({
      where: { projectId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
  }

  async findUsersNotInProject(projectId: string, search?: string) {
    const members = await ProjectMember.findAll({
      where: { projectId },
      attributes: ['userId'],
    });
    const memberIds = members.map((member) => member.userId);
    const where: any = {};

    if (memberIds.length > 0) {
      where.id = { [Op.notIn]: memberIds };
    }

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: term } },
        { email: { [Op.like]: term } },
      ];
    }

    return User.findAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['name', 'ASC']],
    });
  }

  async addMember(projectId: string, userId: string, role: ProjectUserRole, transaction?: Transaction) {
    return ProjectMember.create({ projectId, userId, role } as any, { transaction });
  }

  async updateRole(projectId: string, userId: string, role: ProjectUserRole, transaction?: Transaction) {
    const [affected] = await ProjectMember.update({ role }, { where: { projectId, userId }, transaction });
    return affected > 0;
  }

  async countManagers(projectId: string) {
    return ProjectMember.count({
      where: { projectId, role: ProjectUserRole.MANAGER },
    });
  }

  async removeMember(projectId: string, userId: string) {
    const deleted = await ProjectMember.destroy({ where: { projectId, userId } });
    return deleted > 0;
  }
}
