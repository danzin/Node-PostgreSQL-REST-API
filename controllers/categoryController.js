const database = require('../services/database');


exports.getCategories = async (req, res) => {
	try {
	const result = await database.pool.query('SELECT * FROM category');
	return res.status(200).json(result.rows);
	} catch (error) {
		return res.status(500).json({error: error.message});
	} 
}

exports.createCategory = async (req, res) => {
	try {
		//check if name is empty
		if(!req.body.name){
			//422 - unprocessable entity
			return res.status(422).json({error: "Name is required"})
		}

		//check if name is taken
		const existsResult = await database.pool.query({
			text: 'SELECT EXISTS (SELECT * FROM category WHERE name = $1)',
			values: [req.body.name]
		})

		if (existsResult.rows[0].exists) {
			return res.status(409).json({error: `Category '${req.body.name}' already exists`})
		}

		//Creating the query with the query object
		const result = await database.pool.query({
			//query text, $1 is the first parameter of values array, in this case that's name
			//RETURNING * because if we don't return anything the rows inside the result will be null
			text: 'INSERT INTO category (name) VALUES ($1) RETURNING * ',
			values: [req.body.name]
		})
		//result.rows is an array, better for the client to work with an object
		return res.status(201).json(result.rows[0]);
	} catch (error) {
			return res.status(500).json({error: error.message});
	}
 
}

exports.updateCategory = async (req, res) => {
	try {
		const { name } = req.body;
		const { id } = req.params;

		if( !name ){ 
			return res.status(422).json({error: 'name is required'});
		} else {
			const existsResult = await database.pool.query({
				text: 'SELECT EXISTS (SELECT * FROM category WHERE name = $1)',
				values: [name]
			})
	
			if (existsResult.rows[0].exists) {
				return res.status(409).json({error: `Category '${name}' already exists`})
			}
		}

	
		const result = await database.pool.query({
			text: `
			UPDATE category
			SET name = $1, updated_date = CURRENT_TIMESTAMP
			WHERE id = $2
			RETURNING * `,
			values: [name, id]
		})

		if (result.rowCount == 0) { 
			return res.status(404).json({error: "category not found"})
		}
		return res.status(200).json(result.rows[0]);

	} catch (error) {
		return res.status(500).json({error: error.message});
	}
}

exports.deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;

		const countResult = await database.pool.query({
			text:'SELECT COUNT (*) FROM product WHERE category_id = $1',
			values:[id]
		});

		if(countResult.rows[0].count > 0 ) {
			return res.status(409).json({error: `Category is used by ${countResult.rows[0].count} product(s)`})
		}

		const result = await database.pool.query({
			text:'DELETE FROM category WHERE id = $1',
			values:[id]
		});

		//if result has no rowCount the category doesn't exist
		if(result.rowCount == 0 ) return res.status(404).json({error: 'Category not found.'});

		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({error: error.message});
	}

}