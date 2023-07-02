const getUserByEmail = function (email, database) {
  const user = Object.values(database).find(user => user.email === email);
  return user;
};

module.exports = { getUserByEmail };
