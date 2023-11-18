import sequelize from "../db.js";
import { Sequelize, Model, DataTypes } from 'sequelize';

// Helper function
const uppercaseFirst = str => `${str[0].toUpperCase()}${str.substr(1)}`;

class Like extends Model {
    getLikeable(options) {
        if (!this.likeableType) return Promise.resolve(null);
        const mixinMethodName = `get${uppercaseFirst(this.likeableType)}`;
        return this[mixinMethodName](options);
    }
}

Like.init({
    //author FK
    publishDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    likeableType: {
        type: DataTypes.ENUM('post', 'comment'),
        allowNull: false
    },
    likeableId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false,
        defaultValue: 'like'
    }
    //post/comment reference
}, { sequelize, modelName: 'like' });

export default Like;



