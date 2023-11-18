import sequelize from "./db.js";
import { Sequelize, Model, DataTypes } from 'sequelize';
import User from './models/user.js';
import Post from './models/post.js';
import Category from './models/category.js';
import Comment from './models/comment.js';
import Like from './models/like.js';
import Token from './models/token.js';

User.hasOne(Token, {
    onDelete: 'CASCADE'
});
Token.belongsTo(User);

Post.belongsTo(User, { as: 'author' , foreignKey: 'authorId'});
User.hasMany(Post, {foreignKey: 'authorId'});

//Many to Many with categories
Post.belongsToMany(Category, {
    through: 'posts_categories'
});

Post.hasMany(Comment);

Post.hasMany(Like, {
    foreignKey: 'likeableId',
    constraints: false,
    scope: {
        likeableType: 'post'
    }
});

Category.belongsToMany(Post, {
    through: 'posts_categories'
});
User.hasMany(Comment, { foreignKey: 'authorId'});
Comment.belongsTo(User, { as: 'author', foreignKey: 'authorId'});
//Comment can belong only to a post
Comment.belongsTo(Post);

Comment.hasMany(Like, {
    foreignKey: 'likeableId',
    constraints: false,
    scope: {
        likeableType: 'comment'
    }
});

Like.belongsTo(Post, {
    foreignKey: 'likeableId',
    constraints: false
});

Like.belongsTo(Comment, {
    foreignKey: 'likeableId',
    constraints: false
});

Like.belongsTo(User, { as: 'author'});
User.hasMany(Like, {foreignKey: 'authorId'});

Like.addHook('afterFind', findResult => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    findResult.forEach((instance) => {
        if (instance.likeableType === "post" && instance.post !== undefined) {
            instance.likeable = instance.post;
        } else if (instance.likeableType === "comment" && instance.comment !== undefined) {
            instance.likeable = instance.comment;
        }

        // To prevent mistakes:
        delete instance.post;
        delete instance.comment;
    });
});

export {
    User,
    Post,
    Category,
    Comment,
    Like,
    Token,
    sequelize
}

