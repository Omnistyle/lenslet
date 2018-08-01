const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();


// Serve static content in public/ directory.
app.use(express.static(path.join(__dirname, 'public')));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
  
app.get('/', (req, res) => res.render('pages/index'))

// Listen on the given port.
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
