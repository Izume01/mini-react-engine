import { Rizzy } from "./runtime";


/** @jsx Rizzy.createElement */
const element = (
  <div>
    <h1>Hello, world!</h1>
    <p>This is a simple example of a React-like element.</p>
  </div>
);
const container = document.getElementById("root");


Rizzy.render(element,container)