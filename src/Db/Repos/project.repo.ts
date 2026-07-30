import { Project, ProjectMember, User } from '../Models';

export class ProjectRepository {
  async findById(id: number) {
    return Project.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: ProjectMember,
          include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        },
      ],
    });
  }

  async findProjectsByUser(userId: number) {
    return Project.findAll({
      include: [
        {
          model: ProjectMember,
          where: { userId },
          attributes: [], // Exclude join table fields from result
        },
      ],
    });
  }

  async create(data: Partial<Project>) {
    return Project.create(data as any);
  }

  async update(id: number, data: Partial<Project>) {
    const [affected] = await Project.update(data, { where: { id } });
    return affected > 0;
  }

  async delete(id: number) {
    const deleted = await Project.destroy({ where: { id } });
    return deleted > 0;
  }
}