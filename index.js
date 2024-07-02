const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.json());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "193.203.184.7",
  user: "u223830212_deep",
  password: "TenC@1234",
  database: "u223830212_deepanshu",
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT NOT NULL,
       done BOOLEAN DEFAULT FALSE,
       status VARCHAR(50) DEFAULT 'pending'
    )
  `;

  connection.query(createTableQuery, (err, result) => {
    connection.release();
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    console.log("Table 'todos' created successfully");
  });
});

app.post("/todos", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.json({ error: "Title and description are required" });
  }

  const insertQuery = "INSERT INTO todos (title, description) VALUES (?, ?)";

  pool.query(insertQuery, [title, description], (err, result) => {
    if (err) {
      console.error("Error inserting todo:", err);
      return res.json({ error: "Error inserting todo" });
    }

    const todo = {
      id: result.insertId,
      title,
      description,
      done: false,
      status: "pending",
    };
    console.log(todo);
    console.log("1 record inserted");
    res.json({ todo });
  });
});

app.get("/getlist", (req, res) => {
  const selectQuery = "SELECT * FROM todos";

  pool.query(selectQuery, (err, result) => {
    if (err) {
      console.error("Error fetching todos:", err);
      return res.json({ error: "Error fetching todos" });
    }
    console.log(result);
    res.json(result);
  });
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;

  const deleteQuery = "DELETE FROM todos WHERE id = ?";

  pool.query(deleteQuery, [parseInt(id)], (err, result) => {
    if (err) {
      console.error("Error deleting todo:", err);
      return res.json({ error: "Error deleting todo" });
    }

    if (result.affectedRows === 0) {
      return res.json({ error: "Todo not found" });
    }

    console.log(`Todo with id ${id} deleted`);
    res.json({ message: "Todo deleted successfully" });
  });
});

app.put("/todos/update/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (isNaN(id)) {
    return res.json({ error: "Invalid ID" });
  }

  if (!title || !description) {
    return res.json({ error: "Title and description are required" });
  }

  const updateQuery =
    "UPDATE todos SET title = ?, description = ? WHERE id = ?";

  pool.query(updateQuery, [title, description, parseInt(id)], (err, result) => {
    if (err) {
      console.error("Error updating todo:", err);
      return res.json({ error: "Error updating todo" });
    }

    if (result.affectedRows === 0) {
      return res.json({ error: "Todo not found" });
    }

    console.log(`Todo with id ${id} updated`);
    console.log(` ${id}, ${title}, ${description} `);
    return res.json({
      message: "Todo updated successfully",
      title,
      description,
    });
  });
});

// app.put("/markdone/:id", (req, res) => {
//   const { id } = req.params;
//   const sql = "UPDATE todos SET done = true WHERE id = ?";

//   pool.query(sql, [id], (err, result) => {
//     if (err) {
//       console.error("Error marking todo as done:", err);
//       return res.json({ error: "Internal Server Error" });
//     }
//     if (!result || result.affectedRows === 0) {
//       return res.json({ error: "Todo not found" });
//     }
//     res.json({ message: "Todo marked as done" });
//   });
// });
app.put("/markdone/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE todos SET status = 'complete' WHERE id = ?";

  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error marking todo as done:", err);
      return res.json({ error: "Internal Server Error" });
    }
    if (!result || result.affectedRows === 0) {
      return res.json({ error: "Todo not found" });
    }
    res.json({ message: "Todo marked as done" });
  });
});

app.get("/completedtodos", (req, res) => {
  const sql = "SELECT * FROM todos WHERE done = true";
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching completed todos:", err);
      return res.send("Error fetching completed todos");
    }
    res.json(results);
  });
});
app.get("/pendingtodos", (req, res) => {
  const sql = "SELECT * FROM todos WHERE done = false";
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching pending todos:", err);
      return res.send("Error fetching pending todos");
    }
    res.json(results);
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
