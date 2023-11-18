import sequelize from "../db.js";
import { Sequelize, Model, DataTypes } from 'sequelize';

class Category extends Model {}

Category.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
}, { sequelize , modelName: 'category'});

export default Category;



