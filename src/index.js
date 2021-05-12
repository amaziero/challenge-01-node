const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response
      .status(400)
      .json({ error: "Please provide a valid username!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users
    .find(
      (usernameCreated) => usernameCreated.username === username
  )

  if(usernameExists) {
    return response.status(400).json({ error: "User already exists" })
  }

  const operationCreateUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(operationCreateUser)

  return response.status(201).json(operationCreateUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const makeTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  const { user } = request;

  user.todos.push(makeTodo);

  return response.status(201).json(makeTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } =  request;

  const todoToUpdate = user.todos.findIndex((todo) => todo.id === id);
  if(todoToUpdate < 0) {
    return response.status(404).json({ error: 'Id not fund' })
  }

  const newTodo = {
    id: user.todos[todoToUpdate].id,
    title,
    done: user.todos[todoToUpdate].done,
    deadline,
    created_at: user.todos[todoToUpdate].created_at
  }

  user.todos[todoToUpdate] = newTodo
  
  return response.status(200).json(newTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoToUpdate = user.todos.findIndex((todo) => todo.id === id);
  if(todoToUpdate < 0) {
    return response.status(404).json({ error: 'Id not fund' })
  };

  user.todos[todoToUpdate].done = true;

  return response.status(200).json(user.todos[todoToUpdate]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToUpdate = user.todos.findIndex((todo) => todo.id === id);
  
  if(todoToUpdate < 0) {
    return response.status(404).json({ error: 'Id not fund' })
  };

  user.todos.splice(todoToUpdate, 1);

  return response.status(204).json(user);
});

module.exports = app;