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
  aJ48lW: {
    id: "aJ48lW",
    email: "user3@example.com",
    password: "123",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  rtyio: {
    longURL: "https:/bnml",
    userID: "fghj",
  },
};
 
const generateRandomString = function() {
  const id = Math.random().toString(16).substring(2,8);
  return id;
};

function urlsForUser(id) {
  let urls = {};

  for (let url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

app.use(express.urlencoded({ extended: true }));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const userUrls = urlsForUser(userID);
  const templateVars = { urls: userUrls, user : users[req.cookies.user_id] };
  if (!user) {
    res.send('Please <a href= "/login" >Login</a> to view your URLs!');
    return;
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user : users[req.cookies.user_id] };
  const userID = req.cookies.user_id;
  const user = users[userID];
  if(user) {
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const userUrls = urlsForUser(userID);
  if (!user) {
    res.send('Please <a href= "/login" >Login</a> to view your URLs!');
    return;
  } 
  if(!urlDatabase[req.params.id]) {
    res.send("Sorry, the short URL that you entered doesn't exist. Please enter a different short URL id!");
    return;
  }
  if(!userUrls[req.params.id]) {
    res.send('The short URL id that you entered does not exist in your URLs. Please enter a different ID');
    return;  
  }
  
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user : users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = { 
    "longURL": longURL,
    "userID": req.cookies.user_id
  }
  const userID = req.cookies.user_id;
  if(userID) {
    res.redirect("/urls");
    return;
  }
  res.send("Please login to shorten the URLs"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if(!longURL) {
    res.send("Sorry, the short URL that you entered doesn't exist. Please enter a different short URL id!");
    return;
  }
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    res.send('Please login to edit the URLs.');
    return;
  }
  if (!urlDatabase[id]) {
    res.send('The id that you entered does not exist.');
    return;
  }
  const userUrls = urlsForUser(userID);
  if(!userUrls[id]) {
    res.send('The id that you are trying to edit does not exist in your account.');
    return;  
  }
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    res.send('Please login to delete the URLs.');
    return;
  }
  if (!urlDatabase[id]) {
    res.send('The id that you entered does not exist.');
    return;
  }
  const userUrls = urlsForUser(userID);
  if(!userUrls[id]) {
    res.send('The ID that you are trying to delete does not exist in your account.');
    return;  
  }
  delete urlDatabase[id];
  res.redirect('/urls');
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
