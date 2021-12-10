const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const userExists = users.find(user => user.username === request.headers.username)
  if(!userExists){
    return response.status(404).json({error: "Username not found"});
  }
  next()
}

app.post('/users', (request, response) => {

  const {name, username} = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  const userAlreadyRegistered = users.find(user => user.username === username);

  if(userAlreadyRegistered){
    return response.status(400).json({error: "Username already registered"});
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const { todos } = users.find(user => user.username === username);

  return response.status(200).json(todos)


});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const {title, done, deadline} = request.body;

  const { todos } = users.find(user => user.username === username);
  const newTodos = { 
    id: uuidv4(), 
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  todos.push(newTodos)

  return response.status(201).json(newTodos);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username)
  const todoPut = todos.find(todo => todo.id === request.params.id);
  if(!todoPut){
    return response.status(404).json({error: "Todos not found"});
  }

  const {title, deadline} = request.body;
  todoPut.title = title;
  todoPut.deadline =  new Date(deadline);
  return response.status(201).json(todoPut);

 
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username)
  const todoDone = todos.find(todo => todo.id === request.params.id);
  if(!todoDone){
    return response.status(404).json({error: "Todos not found"});
  }
  todoDone.done = true;
  return response.status(200).json(todoDone);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = users.find(user => user.username === request.headers.username)
  const todoToDelete = todos.findIndex(todo => todo.id === request.params.id);

  if(todoToDelete !== -1){
    todos.splice(todoToDelete, 1);
    return response.status(204).end();
  }else{
    return response.status(404).json({error: "Todos not found"});
  };

});

module.exports = app;