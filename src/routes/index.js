const router = require('express').Router();
router.get('/hello', (req, res, next) => {
    res.send('Hello from Hello route.')
});
router.get("/dummy", async (req, res, next) => {
    await req.__databaseConnection.execute(`insert into users(username, email, age) VALUES (?,?,?)`,['test1', 'testingfrombat@gamil.com', 23]);
    await req['__databaseConnection'].commit();
    return res.json({error: false, message: "Data inserted."}).status(200).end();
});
module.exports = router;