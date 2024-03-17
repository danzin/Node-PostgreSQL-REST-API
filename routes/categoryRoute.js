const router = require('express').Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories); 
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;