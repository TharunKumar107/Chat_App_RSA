const bcrypt = require('bcrypt');
const saltRounds = 10;

console.log(bcrypt.hashSync("hello1234", saltRounds));

hash = "$2b$10$PA3UaC8N87IFX.5fINdE3O6rUmQQJEn9X9iC2b1.qeSyXx30PKDIO"

console.log(bcrypt.compareSync("hello1234", hash))