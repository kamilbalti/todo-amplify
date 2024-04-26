import { useEffect, useState } from "react";

import { generateClient } from "aws-amplify/api";

import { createTodo, deleteTodo, updateTodo } from "../mutations";
import { listTodos } from "../queries";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const initialState = { name: "", description: "" };
const client = generateClient();

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [editInd, setEditInd] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }
  function setBothInput(value) {
    setFormState({ ...formState, ...value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos,
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function updateTodoFunc() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState, id: todos[editInd - 1].id };
      const updatedTodo = [...todos];
      updatedTodo[editInd - 1].name = formState?.name;
      updatedTodo[editInd - 1].description = formState?.description;
      setEditInd(false);
      setTodos(updatedTodo);
      setFormState(initialState);
      await client.graphql({
        query: updateTodo,
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log("error udpating todo:", err);
    }
  }

  async function deleteTodoFunc(ind) {
    if (ind === editInd - 1) setBothInput({ name: "", description: "" });
    try {
      let tempData = [...todos];
      setTodos((prev) => prev?.filter((_, index) => index !== ind));
      const selectedData = tempData[ind];
      const { id, description } = selectedData;
      const todo = { id };
      await client.graphql({
        query: deleteTodo,
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  const editTodoFunc = (index) => {
    setEditInd(index + 1);
    const name = todos[index]?.name;
    const description = todos[index]?.description;
    setBothInput({ name, description });
  };
  const submit = (e) => {
    e.preventDefault();
    editInd ? updateTodoFunc() : addTodo();
  };
  return (
    <form style={styles.container} onSubmit={submit}>
      <h2>Amplify Todo</h2>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput("description", event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} type="submit">
        {editInd ? "Update Todo" : "Create Todo"}
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
          <EditIcon
            style={{ cursor: "pointer" }}
            onClick={() => editTodoFunc(index)}
          />
          <DeleteIcon
            style={{ cursor: "pointer" }}
            onClick={() => deleteTodoFunc(index)}
          />
        </div>
      ))}
    </form>
  );
};

const styles = {
  container: {
    width: 500,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: {
    marginBottom: 15,
    display: "flex",
    gap: "40px",
    alignItems: "center",
    justifyContent: "center",
    height: "50px",
  },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: {
    margin: 0,
    fontSize: 20,
    fontWeight: "bold",
    width: "250px",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  todoDescription: {
    margin: 0,
    width: "350px",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
};

export default App;
