import { Router } from 'express';
const router = Router();
import { User, Post, Category, Comment, Like, Token } from '../../model.js';
// import sanitize from "sanitize-filename";


import { passLoggedIn, passAdmin } from '../../utils/passUsers.js';

router.get('/', async (req, res) => {
    try {
        let categories = await Category.findAll();
        return res.json({ categories });
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.get('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let category = await Category.findByPk(Number(id));
        if (!category) return res.sendStatus(404);
        return res.json(category);
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.get('/:id/posts', async (req, res) => {
    try {
        let id = req.params.id;
        let category = await Category.findByPk(Number(id), {
            include: Post
        });
        if (!category) return res.sendStatus(404);
        let posts = await category.getPosts();
        return res.json({ posts });
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

router.post('/', passAdmin, async (req, res) => {
    let params = req.body;
    if (!params.title) res.sendStatus(400);
    try {
        let cat = Category.build({
            title: params.title.trim()
        });
        if (params.description) cat.description = params.description.trim();
        await cat.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.patch('/:id', passAdmin, async (req, res) => {
    try {
        let id = req.params.id;
        let params = req.body;
        let category = await Category.findByPk(Number(id));
        if (!category) return res.sendStatus(404);
        if (params.title) category.title = params.title.trim();
        if (params.description) category.description = params.description.trim();
        await category.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.delete('/:id', passAdmin, async (req, res) => {
    try {
        let id = req.params.id;
        let cat = await Category.findByPk(Number(id));
        if (!cat) return res.sendStatus(404);
        await cat.destroy();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})



export default router;
