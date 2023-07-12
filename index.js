const express = require("express")
const path = require("path")
const session = require('express-session');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const app = express()
const async = require("hbs/lib/async");
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const tempelatePath = path.join(__dirname, 'templates/')
const publicPath = path.join(__dirname, 'public')

console.log(publicPath);

// Configuración de conexión a la base de datos
const pool = new Pool({
    user: 'nabgvtfo',
    host: 'stampy.db.elephantsql.com',
    database: 'nabgvtfo',
    password: 'RhAIz42z-9hcIn1KrAzoYMepb7aVxNRX',
    port: 5432,
});

app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(
    session({
        secret: 'mysecret',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(express.static(publicPath))

app.get('/', (req, res) => {
    res.render('login')
})

const midlleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/');
    }
};

app.get('/index', (req, res) => {
    if (req.session.loggedIn) {
      try {
        const nombre = req.session.nombre;
        const id = req.session.userId;
    
        res.render("index", { id: id, nombre: nombre});
      }catch (e){
        console.log(e)
      }
      
    } else {
      res.redirect('/');
    }
  });

app.get('/login', midlleware, (req, res) => {
    res.send('ruta protegida');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            const pass = result.rows[0].password;
            const nombre = result.rows[0].nombre;
            const id = result.rows[0].id;

            if (password == pass) {
                req.session.loggedIn = true
                req.session.userId = id;
                req.session.nombre = nombre;
                req.session.email = email;
                req.session.password = pass;
                res.status(201).render("index", { id: id, nombre: nombre });

            } else {
                res.send('<script>alert("Contraseña incorrecta"); window.location.href = "/login";</script>');
            }

        } else {
            // Usuario inválido
            res.send('<script>alert("Usuario no existe"); window.location.href = "/login";</script>');
        }

        client.release();
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: 'Error en la consulta' });
    }
});

app.get('/registro', (req, res) => {
    res.render('registro')
});

app.post('/registro', async (req, res) => {
    try {
  
        const { nombre, email, password } = req.body;
  
          const client = await pool.connect();
      
          const checkUser = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);
          if (checkUser.rows.length > 0) {
            res.send('<script>alert("ya hay una cuenta"); window.location.href = "/registro";</script>');
          } else {
            await client.query('INSERT INTO usuario (nombre, email, password) VALUES ($1, $2, $3)', [nombre, email, password]);
  
      
            res.redirect('/');
          }
          
          client.release();
      
    
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error en la consulta' });
    }
  });

  app.get('/actualizar',async (req, res) => {
    const email = req.session.email;
    const nombre = req.session.nombre;
    const password = req.session.password;
    try { 
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);
      const id = result.rows[0].id;
      res.render('actualizar', { id, nombre, email, password });
  
    }catch(error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error en la consulta' });
    }
  
  });

  app.post('/actualizar/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (req.session.loggedIn) {
        const { nombre, email, password } = req.body;
        const updateData = {
          email: req.body.email,
          password: req.body.password1
        }
    
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);
        /* console.log(password)
        console.log(result.rows[0].password) */
        if ( email == result.rows[0].email) {
          
            await client.query(
            'UPDATE usuario SET nombre = $1, email = $2, password = $3 WHERE id = $4',
            [nombre, email, password, id]
          );
    
          // Verificar si se actualizó un registro exitosamente
          if (result.rowCount === 1) {
            res.redirect('/index');
          } else {
            res.send('<script>alert("Registro no encontrado"); window.location.href = "/actualizar/${id}";</script>')
          }
    
          client.release();
        }
      }else{
        res.redirect('/index');       
      
      }
  
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error en la consulta' });
    }
  });
app.post('/eliminar', async (req, res) => {
    try {
      if (req.session.loggedIn) {
        
          const id = req.body.id;
          const client = await pool.connect();
          const checkUser = await client.query('SELECT * FROM usuario WHERE id = $1', [id]);
          if (checkUser.rows.length === 0) {
            res.send('<script>alert("Usuario no encontrado"); window.location.href = "/index";</script>');
            return;
          }
          await client.query('DELETE FROM usuario WHERE id = $1', [id]);
  
          client.release();
          req.session.destroy();
          res.send('<script>alert("Usuario eliminado correctamente"); window.location.href = "/";</script>');
      }else{
        res.send('<script> window.location.href = "/";</script>');
      }
      
    } catch (error) {
      console.error('Error en la consulta:', error);
      res.status(500).json({ error: 'Error en la consulta' });
    }
  });

app.get('/cerrar', (req, res) => {
    req.session.destroy();
  
    res.redirect('/');
  });
  
app.listen(3000, () => {
    console.log('Inicio');
});
