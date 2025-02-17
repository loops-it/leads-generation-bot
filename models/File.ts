import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class File extends Model {
  public id!: number;
  public user_id!: number;
  public file_id!: string;
}

File.init(
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
    file_id: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'files',
    modelName: 'File',
  }
);

export default File;
