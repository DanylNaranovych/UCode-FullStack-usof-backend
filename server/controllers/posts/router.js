import { Router } from 'express';
const router = Router();
import { User, Post, Category, Comment, Like, Token } from '../../model.js';
import { Op } from 'sequelize';
import { passLoggedIn, passAdmin, isAdminLoggedIn } from '../../utils/passUsers.js';
const pageSize = 25;

// TODO - pagination done
router.get('/', async (req, res) => {
    try {
        let page = req.query?.page;
        if (!page) page = req.body?.page;
        let sort = req.query?.sort;
        if (!sort) sort = req.body?.sort;
        let category = req.query?.category;
        if (!category) category = req.body?.category;
        let showInactive = req.query?.showInactive;
        if (!showInactive) showInactive = req.body?.showInactive;
        let maxDate = req.query?.maxDate;
        if (!maxDate) maxDate = req.body?.maxDate;
        let minDate = req.query?.minDate;
        if (!minDate) minDate = req.body?.minDate;
        let opts = {
            include: [Like]
        }
        if (sort) {
            if (sort.toLowerCase() == 'date') {
                opts = {
                    ...opts,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                };
            }
        }
        if (page) {
            opts = {
                ...opts,
                offset: pageSize * (page - 1),
                limit: pageSize
            }
        }
        
        if (!showInactive) {
            opts = {
                ...opts,
                where: {
                    ...opts.where,
                    status: 'active'
                }
            }
        }
        if (maxDate) {
            opts.where = {
                ...opts.where,
                publishDate: {
                    ...opts.where.publishDate,
                    [Op.lte]: maxDate
                }
            }
        }
        if (minDate) {
            opts.where = {
                ...opts.where,
                publishDate: {
                    ...opts.where.publishDate,
                    [Op.gte]: minDate
                }
            }
        }
        if (category) {
            category = [...category];
            opts.include = [...opts.include, {
                model: Category,
                where: {
                    id: {
                        [Op.in]: category
                    }
                }
            }]

        }
        let posts = await Post.findAll(opts);
        for (const post of posts) {
            post.dataValues.rating = await post.getRating();
            delete post.dataValues.likes;
            delete post.dataValues.categories;
        }
        if (sort) {
            if (sort.toLowerCase() == 'rating') {
                posts = posts.sort((a, b) => b.dataValues.rating - a.dataValues.rating);
            }
        }
        else {
            posts = posts.sort((a, b) => b.dataValues.rating - a.dataValues.rating);
        }
        
        return res.json({ posts });
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.get('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let opts = {};
        if (!isAdminLoggedIn(req)) {
            opts = {
                ...opts,
                where: {
                    status: 'active'
                }
            }
        }
        let post = await Post.findByPk(Number(id), opts);
        if (!post) return res.sendStatus(404);
        return res.json( post );
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});


router.get('/:id/comments', async (req, res) => {
    try {
        let id = req.params.id;
        let post = await Post.findByPk(Number(id), {
            include: {
                model: Comment,
                order: [
                    ['createdAt', 'DESC']
                ]
            }
        });
        if (!post) return res.sendStatus(404);
        let comments = await post.getComments();
        return res.json({ comments });

    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.post('/:id/comment', passLoggedIn, async (req, res) => {
    try {
        let params = req.body;
        if (!params.content) return res.sendStatus(400);
        let user = await User.findByPk(req.session.user.id);
        if (!user) return res.sendStatus(403);
        let postId = req.params.id;
        let post = await Post.findByPk(Number(postId));
        if (!post) return res.sendStatus(404);
        let newComment = await Comment.create({
            content: params.content
        });
        await newComment.setPost(post);
        await newComment.setAuthor(user);
        await newComment.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.get('/:id/categories', async (req, res) => {
    try {
        let id = req.params.id;
        let post = await Post.findByPk(Number(id), {
            include: Category
        });
        if (!post) return res.sendStatus(404);
        let categories = await post.getCategories();
        return res.json({ categories });

    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.get('/:id/like', async (req, res) => {
    try {
        let postId = req.params.id;
        let post = await Post.findByPk(Number(postId), {
            include: Category
        });
        if (!post) return res.sendStatus(404);
        let likes = await post.getLikes();
        let myLikes = []
        likes.forEach((like) => {
            myLikes.push({
                id: like.id,
                type: like.type
            })
        });
        return res.json({ likes: myLikes });

    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.post('/', passLoggedIn, async (req, res) => {
    try {
        let params = req.body;
        if (!params.content || !params.title || !params.categories) return res.sendStatus(400);
        let user = await User.findByPk(req.session.user.id);
        if (!user) return res.sendStatus(403);
        let post = await Post.create({
            title: params.title,
            content: params.content,
            author: user
        });
        await post.setAuthor(user);
        for (const category of params.categories) {
            let cat = await Category.findByPk(category);
            if (!cat) continue;
            await post.addCategory(cat);
            await cat.save();
        }
        await post.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.post('/:id/like', passLoggedIn, async (req, res) => {
    try {
        let user = await User.findByPk(req.session.user.id);
        if (!user) return res.sendStatus(403);
        let postId = req.params.id;
        let post = await Post.findByPk(Number(postId));
        if (!post) return res.sendStatus(404);
        let testLike = await post.getLikes({
            where: {
                authorId: user.id
            }
        });
        if (testLike.length > 0) return res.sendStatus(202);
        let like = Like.build({
            likeableType: 'post',
            likeableId: post.id
        });
        if (req.body?.dislike) {
            like.type = 'dislike';
        }
        await like.setAuthor(user, {save: false});
        await like.save();
        await user.save();
        await post.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.patch('/:id', passLoggedIn, async (req, res) => {
    try {
        let user = req.session.user;
        let postId = req.params.id;
        let post = await Post.findByPk(Number(postId), { include: {model: User, as: 'author'} });
        let postAuthor = await post.getAuthor();
        if (!post) return res.sendStatus(404);
        if (user.id != postAuthor.id) {
            return res.sendStatus(403);
        }
        let params = req.body;
        if (params.content) post.content = params.content.trim();
        if (params.title) post.title = params.title.trim();
        if (params.categories) {
            await post.setCategories([]);
            for (const category of params.categories) {
                let cat = await Category.findByPk(category);
                if (!cat) continue;
                await post.addCategory(cat);
                await cat.save();
            }
        }
        await post.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.delete('/:id', passLoggedIn, async (req, res) => {
    try {
        let user = await User.findByPk(req.session.user.id);
        let postId = req.params.id;
        let post = await Post.findByPk(Number(postId));
        let postAuthor = await post.getAuthor();
        if (!post) return res.sendStatus(404);
        if (user.id != postAuthor.id && user.role != 'Admin') {
            return res.sendStatus(403);
        }
        await post.destroy();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.delete('/:id/like', passLoggedIn, async (req, res) => {
    try {
        let user = await User.findByPk(req.session.user.id);
        let postId = req.params.id;
        let post = await Post.findByPk(Number(postId), { include: [{model: User, as: 'author'}, Like] });
        let postAuthor = await post.getAuthor();
        if (!post) return res.sendStatus(404);
        let postLikes = await post.getLikes({
            where: {
                authorId: user.id 
            }
        });
        if (postLikes.length > 0) {
            let like = postLikes[0];
            await like.destroy();
        }
        await post.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

export default router;
