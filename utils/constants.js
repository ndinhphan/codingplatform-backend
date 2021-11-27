const path = require("path");

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const publicProjectPath = path.join(__dirname, "../public/projects");

const reactProjectTemplate = {
  files: {
    "/public/index.html": `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>`,
    "/index.js": `import React, { StrictMode } from "react";
    import ReactDOM from "react-dom";
    import "./styles.css";
    
    import App from "./App";
    
    const rootElement = document.getElementById("root");
    ReactDOM.render(
      <StrictMode>
        <App />
      </StrictMode>,
      rootElement
    );`,
    "/App.js": `export default function App() {
      return <h1>Hello World</h1>;
    }
    `,
    "/style.css": `body {
      font-family: sans-serif;
      -webkit-font-smoothing: auto;
      -moz-font-smoothing: auto;
      -moz-osx-font-smoothing: grayscale;
      font-smoothing: auto;
      text-rendering: optimizeLegibility;
      font-smooth: always;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    h1 {
      font-size: 1.5rem;
    }
    `,
  },
  folders: ["/public", "/public/assets"],
};

module.exports = { EMAIL_REGEX, publicProjectPath, reactProjectTemplate };
