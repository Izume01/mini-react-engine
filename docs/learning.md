Let's say we have this React Element written in JSX:

```jsx
<div>
  <h1>Hello, world!</h1>
  <p>This is a simple example of a React-like element.</p>
</div>
```

Under the hood, this JSX is transpiled into `React.createElement` calls:

```javascript
React.createElement(
  "div",                      // element (type)
  null,                       // props
  React.createElement(
    "h1",
    null,
    "Hello, world!"           // children
  ),
  React.createElement(
    "p",
    null,
    "This is a simple example of a React-like element." // children
  )
)
```

These `createElement` calls produce JavaScript objects that React uses to build the DOM.

For a simpler example, consider this JSX:

**JSX:**
```jsx
<h1>Hello</h1>
```

This creates an "element object" with the following structure:

**`createElement` form:**
```json
{
  "type": "h1",
  "props": {
    "children": [...]
  }
}
```

**Resulting element object:**
```json
{
  "type": "h1",
  "props": {
    "children": "Hello"
  }
}
```
