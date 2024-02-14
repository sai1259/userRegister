const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
const dbpath = path.join(__dirname, 'userData.db')
const app = express()
app.use(express.json())
module.exports = app
let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is runnig at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initialize()

//api 1

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 5)
  const selectedQuery = `
    SELECT
      *
    FROM
      user
    WHERE
      username = '${username}';`
  const dbUser = await db.get(selectedQuery)

  if (dbUser === undefined) {
    const postNewUser = `
      INSERT INTO
        user (username, name, password, gender, location)
      VALUES
        (
          '${username}',
          '${name}',
          '${password}',
          '${gender}',
          '${location}'
        );`
    if (password.length < 5) {
      response.status(200)
      response.send(`User created successfully`)
    } else {
      await db.get(postNewUser)
      response.status(400)
      response.send('Password is too short')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

//Login User api 2
