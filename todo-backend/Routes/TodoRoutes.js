const express = require("express");
const router = express.Router();

// Controllers
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
} = require("../Controllers/TodoController");


// CREATE TODO
router.post("/", createTodo);

// GET TODOS (with pagination)
router.get("/", getTodos);

// UPDATE TODO
router.put("/:id", updateTodo);

// DELETE TODO
router.delete("/:id", deleteTodo);

module.exports = router;