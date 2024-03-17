const database = require('../services/database');

exports.getProducts = async (req, res) => {

	try {
		const result = await database.pool.query(`
		SELECT p.id, p.name, p.description, p.price, p.currency, 
			p.quantity, p.active, p.created_date, p.updated_date,
	 
			(SELECT ROW_TO_JSON(category_obj) FROM (
				 SELECT id, name FROM category WHERE id = p.category_id
			) category_obj) AS category
		 
	 	FROM product p`);

		return res.status(200).json(result.rows);
	} catch (error) {
		return res.status(500).json({error: error.message});
	}

}

exports.createProduct = async (req, res) => {
	try {
		const { name, description, price, currency, quantity, category_id } = req.body;

		//check required fields
		if(!name || !price || !category_id) return res.status(422).json({error: "name, price, and category_id are required fields."});
		
		//check if category_id exists
		const existsResult = await database.pool.query({
			text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
			values: [category_id]
		});
		if(!existsResult.rows[0].exists) return res.status(404).json({error: `Category id not found`});


		const result = await database.pool.query({
			text: 
				`INSERT INTO product (name, description, price, currency, quantity, active, category_id)
				VALUES ($1, $2, $3, $4, $5, $6, $7) 
				RETURNING *`,
			values: [
				name,
				description ? description : null,
				price,
				currency ? currency : 'USD',
				quantity ? quantity : 0,
				//if the client sends 'active' as false JS will enter in the else clause, so we check for the presence of the active key in req.body
				'active' in req.body ? active : true,
				category_id
			]
		});

		return res.status(201).json(result.rows[0]);

	} catch (error) {
			return res.status(500).json({error: error.message});
	}
} 

exports.updateProduct = async (req, res) => {
	try {
		const {name, description, price, currency, quantity, active, category_id } = req.body;

		//check fields
		if (!name || !description || !price || !currency || !quantity || !active || !category_id){
			return res.status(422).json({error: 'All fields are required'})
		}

		//check category_id
		const existsResult = await database.pool.query({
			text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
			values: [category_id]
		});

		if(!existsResult.rows[0].exists) return res.status(404).json({error: `Category id not found`});

		const { id } = req.params;
		const result = await database.pool.query({
			text: `
				UPDATE product
				SET name = $1, description = $2, price = $3, currency = $4, quantity = $5, active = $6, category_id = $7, updated_date = CURRENT_TIMESTAMP
				WHERE id = $8
				RETURNING *`,
				values:[name, description, price, currency, quantity, active, category_id, id ]
		});

		if(result.rowCount == 0) {
			return res.status(404).json({error: 'Product not found'})
		} 
		return res.status(200).json(result.rows[0])

	} catch (error) {
			return res.status(500).json({error: error.message});
	}
}

exports.deleteProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await database.pool.query({
			text:'DELETE FROM product WHERE id = $1',
			values:[id]
		})

		if(result.rowCount == 0) return res.status(404).json({error: 'Product not found'});

		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({error: error.message});
	}
}

exports.getProductById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await database.pool.query({
			text:`
				SELECT p.id, p.name, p.description, p.price, p.currency, 
					p.quantity, p.active, p.created_date, p.updated_date,
			
					(SELECT ROW_TO_JSON(category_obj) FROM (
						SELECT id, name FROM category WHERE id = p.category_id
					) category_obj) AS category
				
				FROM product p
				WHERE p.id = $1
				`,
			values:[id]
		});

		if(result.rowCount == 0) return res.status(404).json({error: 'Product not found'});

		return res.status(200).json(result.rows[0])
	} catch (error) {
		return res.status(500).json({error: error.message});
	}
}

exports.getProductsByCatId = async (req, res) => {
	try {
		const { categoryId } = req.params;
		
		//check if category_id exists
		const existsResult = await database.pool.query({
			text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
			values: [categoryId]
		});
		if(!existsResult.rows[0].exists) return res.status(404).json({error: `Category id not found`});
		
		const result = await database.pool.query({
			text:`
				SELECT p.id, p.name, p.description, p.price, p.currency, 
					p.quantity, p.active, p.created_date, p.updated_date,
			
					(SELECT ROW_TO_JSON(category_obj) FROM (
						SELECT id, name FROM category WHERE id = p.category_id
					) category_obj) AS category
				
				FROM product p
				WHERE p.category_id = $1
				`,
			values:[categoryId]
		});

		return res.status(200).json(result.rows)
	} catch (error) {
		return res.status(500).json({error: error.message});
	}
}