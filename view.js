//import libraries
const http = require('http');
const fs = require('fs');
const ejs = require('ejs');

const Pizza = require('./models/db').Pizza;
const PizzaToppings = require('./models/db').PizzaToppings;
const Customer = require('./models/db').Customer;
const NonPizza = require('./models/db').NonPizza;
const Toppings = require('./models/db').Toppings;
const Line  =require('./models/db').Line;
const Orders = require('./models/db').Orders;
const Payment = require('./models/db').Payment;
const clearData = require('./models/db').clearData;
const getReqData = require('./getReqData.js');

//create a host and port
const HOST_NAME = '127.0.0.1';
const PORT_NUM = process.env.PORT || 3000;
//location of template files
const filePath = __dirname + '/views/pages/'; //__dirname is always the current directory, same as ./
const index_path = filePath + 'index.ejs';
const about_path = filePath + 'about.ejs';
const login_path = filePath + 'login.ejs';
const register_path = filePath + 'register.ejs';
const create_path = filePath + 'create.ejs';
const cart_path = filePath + 'cart.ejs';
const confirm_path = filePath + 'confirm.ejs';
const thanks_path = filePath + 'thanks.ejs';
const card_path = filePath + 'card.ejs';

const static = require('node-static');
const file = new (static.Server)();

let customer;
let refresh = false;

http.createServer((request, response) => {
    file.serve(request, response);
}).listen(3001);
//create a HTTP server


const server = http.createServer((req, res) => {
    if (req.url === '/' ) {
        if (customer === undefined) {
            res.writeHead(301, {
                'Location': '/login'
            });
        }

        if(refresh)
        {
            res.writeHead(301, {
                'Location': '/'
            });
            refresh = false;
        }

        if(req.method === "POST")
        {
            getReqData.collectRequestData(req, (result) =>
            {
                if(result.itemId.includes("P"))
                {
                    Pizza.find(result.itemId, (err, row) =>
                    {
                        let price = row.price;
                        if(result.size !== "SMALL")
                        {
                            result.size === "MEDIUM" ? price += 2 : price += 4;
                        }

                        if(result.crust === "THIN")
                        {
                            price += 1.5;
                        }

                        if(result.extraCheese === "Y")
                        {
                            price += 2;
                        }
                        price *= result.quantity;
                        let lineObject ={"customerId" : customer.customerId, "itemId" : result.itemId, "itemName" : row.name, "quantity" : result.quantity, "price" : price, "size" : result.size, "crust" : result.crust, "extraCheese" : result.extraCheese};

                        Line.detailedSearch(lineObject, (err, result) =>
                        {

                            if(result === undefined)
                            {
                                Line.addPizza(lineObject, (err) =>
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                });
                            }
                            else
                            {
                                let newQuantity = parseInt(result.quantity) + parseInt(lineObject.quantity);
                                let lineIdentifier = result.lineId;
                                let newPrice = parseFloat(result.price) + parseFloat(price);
                                let updateObject = {"quantity" : newQuantity, "price" : newPrice, "lineId": lineIdentifier};

                                Line.update(updateObject, (err) =>
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                });
                            }

                        });

                    });
                }
                else
                {
                    NonPizza.find(result.itemId, (err, row) =>
                    {
                        let price = row.price;

                        price *= result.quantity;
                        let lineObject ={"customerId" : customer.customerId, "itemId" : result.itemId, "itemName" : row.name, "quantity" : result.quantity, "price" : price, "size" : result.size, "crust" : result.crust, "extraCheese" : result.extraCheese};

                        Line.basicSearch(lineObject, (err, result) =>
                        {

                            if(result === undefined)
                            {
                                Line.addNonPizza(lineObject, (err) =>
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                });
                            }
                            else
                            {
                                let newQuantity = parseInt(result.quantity) + parseInt(lineObject.quantity);
                                let lineIdentifier = result.lineId;
                                let newPrice = parseFloat(result.price) + parseFloat(price);
                                let updateObject = {"quantity" : newQuantity, "price" : newPrice, "lineId": lineIdentifier};

                                Line.update(updateObject, (err) =>
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                });
                            }

                        });

                    });
                }
            });
        }
        Pizza.all((err, rows) =>{
            let pizzas = [];
            let nonPizzas = [];
            let length = rows.length;
            let counter = 0;

           rows.forEach((row) =>
           {

               let pizza = {"pizzaId" : "", "name " : "", "price" : 0.0, "sauce": "TOMATO", "ingredients" : []};
               pizza.pizzaId = row.pizzaId;
               pizza.name = row.name;
               pizza.price = row.price;
               pizza.sauce = row.sauce;

              PizzaToppings.find(pizza.pizzaId, (err, rows) =>
              {
                  rows.forEach((row) =>
                  {
                     pizza.ingredients.push(row);
                  });
                  counter++;
                  pizzas.push(pizza);
                  if(counter === length)
                  {
                      NonPizza.all((err, rows)=>
                      {
                         rows.forEach((row) =>
                         {
                             nonPizzas.push(row);
                         });
                         ejs.renderFile(index_path, {pizzas : pizzas, nonPizzas : nonPizzas, customer:customer}, (err, data) =>
                         {
                             res.end(data);
                         })
                      });
                  }
              });
           })

        });

    } else if (req.url === '/about') {

        ejs.renderFile(about_path, (err, data) => {
            res.end(data);
        });
    } else if (req.url === '/login' && req.method === "GET") {
        ejs.renderFile(login_path, (err, data) => {
            res.end(data);
        });
    } else if (req.url === "/login" && req.method === "POST") {

        getReqData.collectRequestData(req, result => {

            Customer.find(result.email, result.password, (err, row) => {
                if (err) {
                    console.log(err);
                }

                if (row === undefined) {
                    res.writeHead(301, {
                        'Location': '/login'
                    });
                    res.end();
                } else {
                    customer = row;
                    res.writeHead(301, {
                        'Location': '/'
                    });
                    res.end();
                }
            });

        });
    } else if (req.url === '/register' && req.method === "GET") {

        ejs.renderFile(register_path, (err, data) => {
            res.end(data);
        });
    } else if (req.url === '/register' && req.method === "POST") {
        getReqData.collectRequestData(req, result => {
            Customer.create(result, (err) => {
                if (err) {
                    console.log(err);
                }
            });

            Customer.all((err, rows) => {
                console.log(rows);
            });
        });
        res.writeHead(301, {
            'Location': '/login'
        });
        res.end();
    } else if (req.url === "/create") {
        Toppings.all((err, rows) => {
            ejs.renderFile(create_path, {ingredients: rows}, (err, data) => {
                res.end(data);
            });
        });
        if (req.method === "POST") {
            getReqData.collectRequestData(req, result => {
                let ingredientList = [];
                let toppingIdList = [];


                Pizza.all((err, rows) => {
                    let price = 7.0;


                    let pizzaNumber = "";
                    pizzaNumber = "P" + (rows.length + 1);

                    if (result.ingredients === undefined) {
                        ingredientList.push("no ingredients chosen");
                    } else if (typeof result.ingredients === "string") {
                        ingredientList.push(result.ingredients);
                    } else {
                        result.ingredients.forEach((ingredient) => {
                            ingredientList.push(ingredient);
                        });
                    }
                    ingredientList.forEach((name) => {
                        Toppings.find(name, (err, number) => {
                            if (number !== undefined) {
                                toppingIdList.push(number.toppingId);
                            }
                            if (toppingIdList.length === ingredientList.length) {
                                if (ingredientList.length > 2) {
                                    let extraToppings = ingredientList.length - 2;
                                    let additionFactor = extraToppings * 0.5;
                                    price += additionFactor;

                                }

                                let pizzaObject = {
                                    "pizzaId": pizzaNumber,
                                    "name": result.name,
                                    "price": price,
                                    "sauce": result.sauce
                                };
                                Pizza.create(pizzaObject, (err) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        toppingIdList.forEach((toppingId) => {
                                            let bridgingObject = {"pizzaId": pizzaNumber, "toppingId": toppingId};
                                            PizzaToppings.create(bridgingObject, (err) => {
                                                if (err) {
                                                    console.log(err);
                                                }


                                            });
                                        });
                                    }
                                })
                            }
                        });
                    });

                });


            });
            refresh = true;
            res.writeHead(301, {
                'Location': '/'
            });
            res.end();
        }
    }
    else if(req.url==="/cart")
    {
        let orderedPizzas = [];
        let orderedNonPizzas = [];
        let grandTotal = 0.0;

        Line.find(customer.customerId, (err, rows) =>
        {
            if(rows.length === 0)
            {
                ejs.renderFile(cart_path, {orderedPizzas : [], orderedNonPizzas : [], grandTotal:0.0}, (err, data) =>
                {
                    res.end(data);
                });
            }
            else
            {
                rows.forEach((row) =>
                {
                    grandTotal += row.price;
                   if(row.itemId.includes("P"))
                   {
                        orderedPizzas.push(row);
                   }
                   else
                   {
                      orderedNonPizzas.push(row);
                   }
                });
            }
            ejs.renderFile(cart_path, {orderedPizzas : orderedPizzas, orderedNonPizzas : orderedNonPizzas, grandTotal : grandTotal}, (err, data) =>
            {
                res.end(data);
            });

        });

        if(req.method === "POST")
        {
            getReqData.collectRequestData(req, (result) =>
            {
                result.customerId = parseInt(result.customerId);
                Line.delete(result, (err) =>
                {
                    if(err)
                    {
                        console.log(err);
                    }
                });
                res.writeHead(301, {
                    'Location' : './cart'
                });
            });
        }
    }

    else if(req.url === '/confirm')
    {

        if(req.method === "POST")
        {
           getReqData.collectRequestData(req, (result) =>
           {
                let orderObject = {"customerId" : customer.customerId, "paymentMethod" : result.paymentMethod, "deliveryMode" : result.deliveryMode}
                Orders.create(orderObject, (err) =>
                {
                    if(err)
                    {
                        console.log(err)
                    }

                });
                if(result.paymentMethod === "CARD")
                {
                    res.writeHead(301, {
                        'Location' : '/card'
                    })
                }
                else {
                    res.writeHead(301, {
                        'Location': '/thanks'
                    })
                }
           });
        }

        let total = 0.0;
        Line.all((err, rows) =>
        {
            rows.forEach((row) =>
           {
               total += row.price;
           });
            ejs.renderFile(confirm_path, {total : total}, (err, data) =>
            {
                res.end(data);
            });
        });

    }

    else if(req.url === "/card")
    {
        if(req.method === "POST")
        {
            getReqData.collectRequestData(req, (result) =>
            {
                console.log(result);
                cardObject = {"customerId" : customer.customerId, "cardNumber" : result.cardNumber, "cardDate" : result.cardDate, "cvv": result.cvv};
                Payment.find(customer.customerId, (err, row) =>
                {
                   if(row === undefined)
                   {
                       Payment.create(cardObject, (err) =>
                       {
                           if(err)
                           {
                               console.log(err);
                           }
                       })
                   }
                   else
                   {
                       Payment.delete(cardObject.customerId, (err) =>
                       {
                           if(err)
                           {
                               console.log(err);
                           }
                           Payment.create(cardObject, (err) =>
                           {
                               if(err)
                               {
                                   console.log(err);
                               }
                           })
                       })
                   }
                });

            });
            res.writeHead(301, {
                'Location': '/thanks'
            })
        }
        ejs.renderFile(card_path , (err, data) =>
        {
            res.end(data);
        })
    }

    else if(req.url === "/thanks")
    {
        if(req.method === "POST")
        {
            clearData.remove();
            res.writeHead(301, {
                'Location' : '/'
            })
        }


        ejs.renderFile(thanks_path, (err, data) =>
        {
            res.end(data);
        })

    }

    else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

//listen to the http server with the dedicated port number
server.listen(PORT_NUM, HOST_NAME, () => {
    console.log(`Server is running at ${HOST_NAME}:${PORT_NUM}`);
});