import sequelize from "../db.js";
import { Sequelize, Model, DataTypes } from 'sequelize';

class Token extends Model {}

Token.init({
    token: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {sequelize});

export default Token;
