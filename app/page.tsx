"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";

import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import { signOut } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

    function deleteTodo(id: string) {
        client.models.Todo.delete({ id })
    }

    function SignOut () {
      try {
        // caches.keys().then((names) => {
        //   names.forEach((name) => {
        //       caches.delete(name);
        //   });
        // })
       //location.reload();
       //localStorage.clear();
       //fetchAuthSession({ forceRefresh: true });
       signOut({ global: true });
      }
      catch (error) {
        console.error('Error signing out:', error);
      }
    };

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  return (
      <Authenticator>
          {({ signOut, user }) => (
           <main>
           <h1>{user?.signInDetails?.loginId}'s todos</h1>
           <button onClick={createTodo}>+ new</button>
           <ul>
               {todos.map((todo) => (
                   <li
                       onClick={() => deleteTodo(todo.id)}
                       key={todo.id}>{todo.content}</li>
               ))}
           </ul>
           <div>
               🥳 App successfully hosted. Try creating a new todo.
               <br/>
               <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
                   Review next steps of this tutorial.
               </a>
           </div>
           <button onClick={SignOut}>Sign out</button>
       </main>
           )
           }
      </Authenticator>
  )
}
