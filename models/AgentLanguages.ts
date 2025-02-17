import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class AgentLanguages extends Model {
  public id!: number;
  public user_id!: number;
  public language!: string;
}

AgentLanguages.init(
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
      language: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'agent_languages',
    modelName: 'AgentLanguages',
  }
);

export default AgentLanguages;
