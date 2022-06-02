const fetch = require('node-fetch');
function loadHTML() {
  fetch("./index.html")
    .then((response) => response.text());
}

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: loadHTML(),
  };
  return response;
};
