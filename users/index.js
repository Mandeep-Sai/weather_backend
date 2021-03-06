const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("./schema");
const router = express.Router();
const atob = require("atob");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const [username, password] = atob(
    req.headers.authorization.split(" ")[1]
  ).split(":");
  const user = await userModel.find({ username });

  if (user && user[0].role === "admin") {
    const users = await userModel.find();
    res.send(users);
  } else {
    res.send("Unauthorized");
  }
});
router.post("/addToFavs", async (req, res) => {
  try {
    console.log(req.cookies.accessToken);
    console.log(req.body.place);
    // const token = req.headers.authorization.split(" ")[1];
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await userModel.findById(decoded.id);
    const favs = user.favorites;
    favs.push(req.body.place);
    console.log(favs);
    await userModel.findByIdAndUpdate(decoded.id, { favorites: favs });
    res.send("added");
  } catch (error) {
    console.log(error);
    res.status(401).send("Token expired");
  }
});
router.post("/register", async (req, res) => {
  const userExists = await userModel.find({ username: req.body.username });
  console.log(userExists);
  if (userExists.length > 0) {
    res.send("username exists");
  } else {
    const plainPassword = req.body.password;
    req.body.password = await bcrypt.hash(plainPassword, 8);
    const newUser = new userModel(req.body);
    await newUser.save();
    res.send("sucess");
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  const user = await userModel.findOne({ email: req.body.email });
  const isAuthorized = await bcrypt.compare(req.body.password, user.password);
  console.log(isAuthorized);
  if (isAuthorized) {
    const secretkey = process.env.SECRET_KEY;
    const payload = { id: user._id };
    const token = await jwt.sign(payload, secretkey, { expiresIn: "1 week" });
    console.log(token);
    res.cookie("accessToken", token, {
      httpOnly: true,
    });
    res.send("ok");
    // res.status(200).redirect("http://localhost:3000/home");
  } else {
    res.send("Invalid credentials");
  }
});

router.put("/changePassword/:id", async (req, res) => {
  if (req.body.oldPassword && req.body.newPassword) {
    const user = await userModel.findById(req.params.id);
    const isAuthorized = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );
    if (isAuthorized) {
      const plainPassword = req.body.newPassword;
      password = await bcrypt.hash(plainPassword, 8);
      await userModel.findByIdAndUpdate(req.params.id, password);
    }
  }
});

router.delete("/me", async (req, res) => {
  const [username, password] = atob(
    req.headers.authorization.split(" ")[1]
  ).split(":");
  const user = await userModel.find({ username });
  const isAuthorized = await bcrypt.compare(password, user[0].password);
  if (isAuthorized) {
    await userModel.findOneAndDelete({ username });
    res.send("deleted");
  } else {
    res.send("Unauthorized");
  }
});

module.exports = router;
