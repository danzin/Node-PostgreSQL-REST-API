const express = require('express');
const app = express();
const PORT = 3013;

//read json
app.use(express.json())
//routes
app.use('/category',require('./routes/categoryRoute'))
app.use('/product', require('./routes/productRoute'))


app.listen(PORT, () => console.log('server started on port', PORT));