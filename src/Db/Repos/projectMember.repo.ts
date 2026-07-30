import { ProjectMember, User } from '../Models';
import { ProjectUserRole } from '../../Common/enums';

export class ProjectMemberRepository {
  async findMember(projectId: string, userId: string) {
    return ProjectMember.findOne({ where: { projectId, userId } });
  }

  async findMembersByProject(projectId: string) {
    return ProjectMember.findAll({
      where: { projectId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
  }

  async addMember(projectId: string, userId: string, role: ProjectUserRole) {
    return ProjectMember.create({ projectId, userId, role } as any);
  }

  async updateRole(projectId: string, userId: string, role: ProjectUserRole) {
    const [affected] = await ProjectMember.update({ role }, { where: { projectId, userId } });
    return affected > 0;
  }

  async removeMember(projectId: string, userId: string) {
    const deleted = await ProjectMember.destroy({ where: { projectId, userId } });
    return deleted > 0;
  }
}