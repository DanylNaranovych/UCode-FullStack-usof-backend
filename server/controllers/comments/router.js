import { Router } from 'express';
const router = Router();
import { User, Post, Category, Comment, Like, Token } from '../../model.js';
import sanitize from "sanitize-filename";
import { passLoggedIn, passAdmin } from '../../utils/passUsers.js';



router.get('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let comment = await Comment.findByPk(Number(id));
        if (!comment) return res.sendStatus(404);
        return res.json(comment);
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.get('/:id/like', async (req, res) => {
    try {
        let id = req.params.id;
        let comment = await Comment.findByPk(Number(id), {
            include: Like
        });
        if (!comment) return res.sendStatus(404);
        let likes = await comment.getLikes();
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

router.post('/:id/like', passLoggedIn, async (req, res) => {
    try {
        let user = await User.findByPk(req.session.user.id);
        if (!user) return res.sendStatus(403);
        let comment = await Comment.findByPk(Number(req.params.id));
        if (!comment) return res.sendStatus(404);
        let testLike = await comment.getLikes({
            where: {
                authorId: user.id
            }
        });
        if (testLike.length > 0) return res.sendStatus(202);
        let like = Like.build({
            likeableType: 'comment',
            likeableId: comment.id
        });
        if (req.body?.dislike) {
            like.type = 'dislike';
        }
        await like.setAuthor(user, {save: false});
        await like.save();
        await user.save();
        await comment.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.patch('/:id', passLoggedIn, async (req, res) => {
    try {
        let user = req.session.user;
        let id = req.params.id;
        let comment = await Comment.findByPk(Number(id), { include: {model: User, as: 'author'} });
        if (!comment) return res.sendStatus(404);
        let commentUser = await comment.getAuthor();
        if (user.id != commentUser.id && user.role != 'Admin') {
            return res.sendStatus(403);
        }
        let params = req.body;
        if (params.content) comment.content = params.content.trim();
        await comment.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.delete('/:id', passLoggedIn, async (req, res) => {
    try {
        let user = await User.findByPk(req.session.user.id);
        if (!user) return res.sendStatus(401);
        let comment = await Comment.findByPk(Number(req.params.id));
        if (!comment) return res.sendStatus(404);
        let commentAuthor = await comment.getAuthor();
        if (user.id != commentAuthor.id && user.role != 'Admin') {
            return res.sendStatus(403);
        }
        await comment.destroy();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.delete('/:id/like', passLoggedIn, async (req, res) => {
    try {
        let user = await User.findByPk(req.session.user.id);
        if (!user) return res.sendStatus(401);
        let comment = await Comment.findByPk(Number(req.params.id), { include: [{model: User, as: 'author'}, Like] });
        if (!comment) return res.sendStatus(404);
        let commentLikes = await comment.getLikes({
            where: {
                authorId: user.id
            }
        });
        if (commentLikes.length > 0) {
            let like = commentLikes[0];
            await like.destroy();
        }
        await comment.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

export default router;
