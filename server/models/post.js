import sequelize from "../db.js";
import { Sequelize, Model, DataTypes } from 'sequelize';

class Post extends Model {
    async getRating() {
        let likes = await this.countLikes({
            where: {
                type: 'like'
            }
        });
        let dislikes = await this.countLikes({
            where: {
                type: 'dislike'
            }
        });
        return likes - dislikes;
    }
}

Post.init({
    // author FK done
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    publishDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    }
    //categories M2M
}, { sequelize , modelName: 'post'});

export default Post;


