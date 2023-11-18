import sequelize from "../db.js";
import { Sequelize, Model, DataTypes } from 'sequelize';

class Comment extends Model { }

Comment.init({
    //author FK
    publishDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    }
    // post FK
}, { sequelize, modelName: 'comment' })

export default Comment;


