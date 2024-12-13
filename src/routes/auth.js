import { Router } from "express";
import AuthModel from "../models/auth.js";
import jsonwebtoken from "jsonwebtoken";
const routes = Router();

routes.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const data = await (new AuthModel(req.__databaseConnection).login(username, password));
		const token = jsonwebtoken.sign(data[0], 'THISIS&my@234567uiiuytrw');
		return res.status(200).json({ error: false, message: "Login successful.", token });
	} catch (error) {
		return next(error);
	}
});
export default routes;