import { Table, Model, Column, AllowNull } from 'sequelize-typescript';

@Table({
  tableName: 't_user',
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @AllowNull(false)
  @Column({
    unique: {
      name: 'name',
      msg: '该英文名已存在',
    },
  })
  name: string;

  @AllowNull(false)
  @Column
  nameCn: string;

  @AllowNull(false)
  @Column({
    unique: {
      name: 'email',
      msg: '该邮箱已注册',
    },
  })
  email: string;
}
