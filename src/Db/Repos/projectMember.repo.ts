import { ProjectMember, User } from '../Models';
import { ProjectUserRole } from '../../Common/enums';

export class ProjectMemberRepository {
  async findMember(projectId: number, userId: number) {
    return ProjectMember.findOne({ where: { projectId, userId } });
  }

  async findMembersByProject(projectId: number) {
    return ProjectMember.findAll({
      where: { projectId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
  }

  async addMember(projectId: number, userId: number, role: ProjectUserRole) {
    return ProjectMember.create({ projectId, userId, role } as any);
  }

  async updateRole(projectId: number, userId: number, role: ProjectUserRole) {
    const [affected] = await ProjectMember.update({ role }, { where: { projectId, userId } });
    return affected > 0;
  }

  async removeMember(projectId: number, userId: number) {
    const deleted = await ProjectMember.destroy({ where: { projectId, userId } });
    return deleted > 0;
  }
}