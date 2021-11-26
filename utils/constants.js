const path = require("path");

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const publicProjectPath = path.join(__dirname, "../public/projects");

const reactProjectTemplate = {
  files: { "/public/index.html": "", "/index.js": "", "/app.js": "" },
  folders: ["/public"],
};

module.exports = { EMAIL_REGEX, publicProjectPath };
