import { Router } from "express";
const router = Router();
import { randomBytes } from "node:crypto";
import { User, Post, Category, Comment, Like, Token } from "../../model.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { createTransport } from "nodemailer";
import sanitize from "sanitize-filename";
import pkg from "jwt-simple";
const { encode, decode } = pkg;
const jwtSecret = "securepass";

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "danyl.naranovych@gmail.com",
    pass: "ahskdfhajksdhfl",
  },
});

const profile_picturePath = __dirname + "/../../resources/profile_pictures/";

router.post("/register", async (req, res) => {
  let params = req.body;
  if (
    !params.login ||
    !params.password ||
    !params.password_confirm ||
    !params.email ||
    !params.fullName
  ) {
    return res.sendStatus(400);
  }
  if (params.password != params.password_confirm) return res.sendStatus(403);
  try {
    var user = null;
    try {
      user = await User.create({
        login: params.login.trim(),
        password: hashPassword(params.password.trim()),
        email: params.email.trim(),
        fullName: params.fullName.trim(),
      });
    } catch (err) {
      return res.sendStatus(403);
    }
    if (user == null) return res.sendStatus(403);
    //TODO - send confirmation email
    // create passing token
    let randStr = randomBytes(32).toString("hex");
    let token = await Token.create({ token: randStr });
    await token.setUser(user);
    console.log(token);
    await token.save();
    let jwt_token = encode({ userId: user.id, token: randStr }, jwtSecret);
    let email_url =
      req.protocol +
      "://" +
      req.get("host") +
      req.baseUrl +
      "/email-confirmation/" +
      jwt_token;
    let mail_opts = {
      from: "danyl.naranovych@gmail.com",
      to: user.email,
      subject: "USOF Registration confirmation",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>To confirm your registration click the button below</h1>
    <button><a href="${email_url}">Confirm</a></button>
    <h3>Or click the link: <a href="${email_url}">${email_url}</a></h3>
</body>
</html>
            `,
    };
    transporter.sendMail(mail_opts, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    if (req.files?.profile_picture) {
      let file = req.files?.profile_picture;
      let path = profile_picturePath + sanitize(params.login) + file.name;
      await file.mv(path);
      user.profilePicture = sanitize(params.login) + file.name;
      await user.save();
      return res.sendStatus(200);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post("/email-confirmation/:token", async (req, res) => {
  try {
    let jwt_token = req.params.token;
    let token = await decode(jwt_token, jwtSecret);
    let user = await User.findByPk(token.userId);
    let baseToken = await user.getToken();
    if (!baseToken) return res.sendStatus(404);
    if (baseToken.token == token.token) {
      user.active = true;
      await user.setToken(null);
      await user.save();
      await baseToken.destroy();
      return res.sendStatus(200);
    } else return res.sendStatus(404);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post("/login", async (req, res) => {
  let params = req.body;
  if (!params.login || !params.password || !params.email) {
    return res.sendStatus(400);
  }
  try {
    let user = await User.findOne({
      where: {
        login: params.login.trim(),
      },
    });
    if (!user) return res.sendStatus(404);
    if (user.email.trim() != params.email.trim()) return res.sendStatus(404);
    if (!user.active) return res.sendStatus(403);

    if (!comparePassword(params.password, user.password))
      return res.sendStatus(403);

    let session = req.session;
    session.user = user;
    session.save();
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post("/logout", async (req, res) => {
  let session = req.session;
  session.destroy(() => {
    res.sendStatus(200);
  });
});

router.post("/password-reset", async (req, res) => {
  //TODO - sending an email to reset password
  try {
    let params = req.body;
    if (!params.email) return res.sendStatus(400);
    let randStr = randomBytes(32).toString("hex");
    let token = await Token.create({ token: randStr });
    let user = await User.findOne({
      where: {
        email: params.email.trim(),
      },
    });
    await user.setToken(null);
    await user.save();
    token.setUser(user);
    await token.save();
    let jwt_token = encode({ userId: user.id, token: randStr }, jwtSecret);
    let email_url =
      req.protocol + "://" + req.get("host") + "/password-reset/" + jwt_token;
    let mail_opts = {
      from: "danyl.naranovych@gmail.com",
      to: user.email,
      subject: "USOF Password reset",
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <h1>To change your password click the button below</h1>
        <button><a href="${email_url}">Reset</a></button>
        <h3>Or click the link: <a href="${email_url}">${email_url}</a></h3>
    </body>
    </html>
                `,
    };
    transporter.sendMail(mail_opts, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post("/password-reset/:token", async (req, res) => {
  //TODO - password recovery confirmation
  try {
    if (!req.body.new_password) return res.sendStatus(400);
    let new_password = req.body.new_password.trim();
    if (!new_password) return res.sendStatus(400);
    let jwt_token = req.params.token;
    let token = decode(jwt_token, jwtSecret);
    let user = await User.findByPk(token.userId);
    let baseToken = await user.getToken();
    if (!baseToken) return res.sendStatus(404);
    if (baseToken.token != token.token) return res.sendStatus(404);

    await user.setToken(null);
    user.password = hashPassword(new_password);
    await user.save();
    await baseToken.destroy();

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

export default router;
