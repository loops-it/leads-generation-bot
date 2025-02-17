import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class Admin extends Model {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public phone!: string;
  public status!: string;
}

Admin.init(
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
  },
  {
    sequelize,
    tableName: 'other_admin_details',
    modelName: 'Admin',
  }
);

export default Admin;
