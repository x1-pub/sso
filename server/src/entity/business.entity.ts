import {
  Table,
  Model,
  AllowNull,
  Unique,
  Column,
  DataType,
  Default,
} from 'sequelize-typescript';

@Table({
  tableName: 't_business',
  timestamps: true,
  paranoid: true,
})
export class Business extends Model {
  @AllowNull(false)
  @Column
  nameCn: string;

  @Unique
  @AllowNull(false)
  @Column
  appId: string;

  @Unique
  @AllowNull(false)
  @Default(DataType.UUIDV4)
  @Column
  appSecret: string;

  @AllowNull(false)
  @Column
  receiveTicketUrl: string;

  @AllowNull(false)
  @Column
  creator: number;

  @Column
  domain: string;

  @Column
  description: string;
}
