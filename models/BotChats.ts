import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class BotChats extends Model {
  public id!: number;
  public message_id!: string;
  public language!: string;
  public message!: string;
  public message_sent_by!: string;
  public viewed_by_admin!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

BotChats.init(
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
    language: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    message: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    message_sent_by: {
        type: new DataTypes.STRING(),
        allowNull: true,
      },
    viewed_by_admin: {
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
    tableName: 'chat_bot_chats',
    modelName: 'BotChats',
  }
);

export default BotChats;
