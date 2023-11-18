import sequelize from "../db.js";
import { Sequelize, Model, DataTypes } from 'sequelize';

class User extends Model {
    async getRating() {
        let rating = 0;
        let posts = await this.getPosts();
        let comments = await this.getComments();

        posts.forEach(async (post) =>  {
            let likes = await post.countLikes({
                where: { type: 'like' }
            });
            let dislikes = await post.countLikes({
                where: { type: 'dislike' }
            });
            rating += likes - dislikes;
        });
        
        comments.forEach(async (comment) =>  {
            let likes = await comment.countLikes({
                where: { type: 'like' }
            });
            let dislikes = await comment.countLikes({
                where: { type: 'dislike' }
            });
            rating += likes - dislikes;
        });

        return rating;
    }
}

User.init({
    login: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(512),
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    profilePicture: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.ENUM('User', 'Admin'),
        allowNull: false,
        defaultValue: 'User'
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, { sequelize, modelName: 'user' });

export default User;







