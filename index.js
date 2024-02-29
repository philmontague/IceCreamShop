const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_icecream_shop_db')
const app = express() 

const PORT = process.env.PORT || 3000 

app.use(express.json()) 
app.use(require('morgan')('dev'))


// Route handlers 

// Get all the flavors 
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = ` 
            SELECT * FROM flavors; 
        `
        const response = await client.query(SQL) 
        res.send(response.rows) 
    } catch (error) {
        next(error) 
    }
})

// Get single flavor by ID 
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const flavorId = req.params.id 
        const SQL = `
            SELECT * FROM flavors WHERE id = $1; 
        `
        const response = await client.query(SQL, [flavorId])
        if (response.rows.length === 0) {
            return res.status(404).send('Flavor not found')
        }
        res.send(response.rows[0])
    } catch(error) {
        next(error)
    }
})

// POST create a new flavor 
app.post('/api/flavors', async (req, res, next) => {
    try {
        const { name, is_favorite } = req.body 
        const SQL = ` 
            INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) 
            RETURNING *; 
        `
        const response = await client.query(SQL, [name, is_favorite])
        res.status(201).send(response.rows[0])
    } catch(error) {
        next(error) 
    }
})

// DELETE flavor by ID 




// PUT update a flavor by ID 


const init = async () => { 
    try {
        await client.connect() 
        console.log('Connected to database')

        let SQL = `
            DROP TABLE IF EXISTS flavors;
            CREATE TABLE flavors (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(255) NOT NULL, 
                is_favorite BOOLEAN DEFAULT false, 
                created_at TIMESTAMP DEFAULT now(), 
                updated_at TIMESTAMP DEFAULT now()
            ); 
        `

        await client.query(SQL) 
        console.log('Tables created')

        SQL = `
            INSERT INTO flavors (name, is_favorite) VALUES 
            ('Vanilla', true),
            ('Rocky Road', false), 
            ('Strawberry', true); 
        `

        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`)
        })
    } catch(error) {
        console.log('Error during initialization:', error)
        process.exit(1) 
    }
}

init() 