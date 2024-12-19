import { Router } from "express";
import AuthModel from "../models/auth.js";
import jsonwebtoken from "jsonwebtoken";
import Logger from "../managers/logger.js";
const routes = Router();

routes.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;
		req.__loggerInstance.info(req.__id, "Login requesst execution...");
		const data = await (new AuthModel(req.__databaseConnection).login(username, password));
		console.log(data);
		if (data.length === 0) return res.status(401).json({ error: true, message: "Invalid username or password." });
		const token = jsonwebtoken.sign(data[0], 'THISIS&my@234567uiiuytrw');
		req.__loggerInstance.info(req.__id, "Login requesst execution success.");
		return res.status(200).json({ error: false, message: "Login successful.", token });
	} catch (error) {
		req.__loggerInstance.info(req.__id, "Login request execution failed.");
		return next(error);
	}
});

routes.get('/list', async (req, res, next) => {
	try {
		if (typeof req.query.search === 'string') req.query.search = [req.query.search]
		req.query.search = req.query.search.reduce((acc, curr) => {
			const [key, value] = curr.split(':');
			acc[key] = value;
			return acc;
		}, {});
		console.log(req.query.search);
		const data = await new AuthModel(req.__databaseConnection).getAll(req.query.search, req.query.limit, req.query.offset);
		return res.json({ error: false, message: 'List of users found.', data });
	} catch (error) {
		req.__loggerInstance.info(req.__id, "User listing request execution failed.");
		return next(error);
	}
});

routes.patch('/edit/:id', async (req, res, next) => {
	try {

	} catch (error) {
		req.__loggerInstance.info(req.__id, "Edit user request execution failed.");
		return next(error);
	}
});
routes.delete('/delete/:id', async (req, res, next) => {
	try {

	} catch (error) {
		req.__loggerInstance.info(req.__id, "Delete user request execution failed.");
		return next(error);
	}
});

routes.post('/add', async (req, res, next) => {
	try {

	} catch (error) {
		req.__loggerInstance.info(req.__id, "Register request execution failed.");
		return next(error);
	}
});
export default routes;