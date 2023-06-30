const express = require("express");
const cookies = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.use(cookies());

app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function() {
  const id = Math.random().toString(16).substring(2,8);
  return id;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));


// generateRandomString();

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user : users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user : users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id: req.params.id, longURL: longURL, user : users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  if (!emailExists(req.body.email)) {
    return res.status(403).send("Sorry the email you entered is not registered with TinyApp.");
  } else {
    if(!passwordExists(req.body.password)) {
      return res.status(403).send("Sorry the password you entered doesn't match our records.");
    } else {
      const user = Object.values(users).find(user => user.email === req.body.email);
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
  }
  // res.redirect("/urls");
});


app.get("/login", (req, res) => {
  const templateVars = { user : users[req.cookies.user_id] };
  res.render("login_template", templateVars);
});

app.get("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { user : users[req.cookies.user_id] };
  res.render("registeration_template", templateVars);
});

const emailExists = function(email) {
  return Object.values(users).some(user => user.email === email);
}

const passwordExists = function(password) {
  return Object.values(users).some(user => user.password === password);
}
app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password || emailExists(req.body.email)) {
    return res.status(400).send("invalid email or password"); 
 }
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = generateRandomString();
  users[userID] = { 
    id: userID,
    email: userEmail,
    password: userPassword
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
