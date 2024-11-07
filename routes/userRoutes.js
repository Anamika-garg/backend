const {Router} = require('express');

const {registerUser  ,loginUser , updateData} = require('../controllers/userControllers')

const router = Router();

router.post('/register' , registerUser);
router.post('/login' , loginUser);
router.put('/:id' , updateData)


module.exports = router;

