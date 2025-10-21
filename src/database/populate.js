var fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const config = require("../config/app-config.js");

var users = fs
  .readFileSync(path.join(__dirname, "ecommerce_users.sql"))
  .toString();
var products = fs
  .readFileSync(path.join(__dirname, "ecommerce_products.sql"))
  .toString();
var sizes = fs
  .readFileSync(path.join(__dirname, "ecommerce_sizes.sql"))
  .toString();
var cart = fs
  .readFileSync(path.join(__dirname, "ecommerce_cart.sql"))
  .toString();
var orders = fs
  .readFileSync(path.join(__dirname, "ecommerce_orders.sql"))
  .toString();
var ordersItems = fs
  .readFileSync(path.join(__dirname, "ecommerce_orders_items.sql"))
  .toString();
var user_tokens = fs
  .readFileSync(path.join(__dirname, "ecommerce_user_tokens.sql"))
  .toString();

con = mysql.createConnection(config.populateCon);

populateDb(users).then(() => {
  console.log("Users table create!");
});
populateDb(products).then(() => {
  console.log("Products table create!");
});
populateDb(sizes).then(() => {
  console.log("Sizes table create!");
});
populateDb(cart).then(() => {
  console.log("Cart table create!");
});
populateDb(orders).then(() => {
  console.log("Orders table create!");
});
populateDb(ordersItems).then(() => {
  console.log("Orders_items table create!");
});

populateDb(user_tokens).then(() => {
  console.log("user_tokens table create!");
});

function populateDb(file) {
  return new Promise((resolve, reject) => {
    con.query(file, function (err, result) {
      if (err) {
        console.error(" Lỗi SQL:", err.message);
        console.log(
          " SQL được thực thi:",
          file.substring(0, 200) + "..."
        );
        reject(new Error(err));
      } else {
        resolve();
      }
    });
  });
}
