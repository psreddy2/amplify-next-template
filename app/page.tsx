"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";

import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import { signOut } from "aws-amplify/auth";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  async function deleteTodo(id: string) {
    await client.models.Todo.delete({ id });
    await listTodos();
  }

  async function SignOut() {
    try {
      await signOut({ global: true });
      setTodos([]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  async function listTodos() {
    const { data } = await client.models.Todo.list();
    setTodos(data);
  }

  function setHub() {
    Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          await listTodos();
          break;
      }
    });
  }

  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        await listTodos();
      })
      .catch((err) => console.log("err", err))
      .finally(() => setHub());
  }, []);

  async function createTodo() {
    await client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
    await listTodos();
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
                {todo.content}
              </li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
              Review next steps of this tutorial.
            </a>
          </div>
          <button onClick={SignOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}
