import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class ChatTimer extends Model {
  public id!: number;
  public message_id!: string;
  public agent!: string;
  public time!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ChatTimer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    message_id: {
        type: new DataTypes.STRING(),
        allowNull: false,
      },
    agent: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    time: {
      type: new DataTypes.DOUBLE(),
      allowNull: false,
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
    tableName: 'live_chat_timer',
    modelName: 'ChatTimer',
  }
);

export default ChatTimer;
