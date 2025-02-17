import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class QuickQuestion extends Model {
  public id!: number;
  public question!: string;
  public answer!: string;
}

QuickQuestion.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    answer: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'quick_questions',
    modelName: 'QuickQuestion',
  }
);

export default QuickQuestion;
