import { User } from '../Models';

export class UserRepository {
    async findById(id: string) {
        return User.findByPk(id, {
            attributes: { exclude: ['passwordHash'] },
        });
    }

    async findByEmail(email: string) {
        return User.findOne({ where: { email } });
    }

    async findAll() {
        return User.findAll({
            attributes: { exclude: ['passwordHash'] },
        });
    }

    async create(data: Partial<User>) {
        return User.create(data as any);
    }

    async update(id: string, data: Partial<User>) {
        const [affected] = await User.update(data, { where: { id } });
        return affected > 0;
    }

    async delete(id: string) {
        const deleted = await User.destroy({ where: { id } });
        return deleted > 0;
    }
}