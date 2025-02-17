import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class Agent extends Model {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public phone!: string;
  public status!: string;
  public profile_picture!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Agent.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: new DataTypes.INTEGER(),
      allowNull: false,
    },
    name: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    phone: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    status: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    profile_picture: {
        type: new DataTypes.STRING(),
        allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'other_agent_details',
    modelName: 'Agent',
  }
);

export default Agent;
