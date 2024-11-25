import { Router } from "express";
import { login } from "../models/auth.js";
import jsonwebtoken from "jsonwebtoken";
const routes = Router();

routes.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const data = await login(username, password);
		const token = jsonwebtoken.sign(data, 'THISIS&my@234567uiiuytrw');
		res.status(200).json({ error: false, token });
	} catch (error) {
		next(error)
	} finally {
		return res.end();
	}
});
export default routes;