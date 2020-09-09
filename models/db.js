const sqlite3 = require('sqlite3').verbose();
const dbName = './database.db';
const db = new sqlite3.Database(dbName);

class Customer{
    static all(cb){
        db.all('SELECT * FROM customer', cb);
    }

    static find(id1, id2, cb)
    {
        db.get('SELECT * FROM customer where email = ? and password = ?', id1, id2, cb);
    }

    static create(data, cb)
    {
        const sql = 'INSERT INTO customer VALUES (NULL, ?, ?, ?, ?, ?)';
        db.run(sql, data.email, data.password, data.name, data.address, data.phone, cb);
    }

    static delete(id, cb)
    {
        if(!id) return cb(new Error('Please provide Customer ID'));
        db.run('DELETE FROM customer WHERE customerId = ?', id, cb);
    }

}

class Line{
    static all(cb){
        db.all('SELECT * FROM line', cb);
    }

    static find(id, cb)
    {
        db.all('SELECT * FROM line where customerId = ?', id, cb);
    }

    static detailedSearch(data, cb)
    {
        db.get('SELECT * FROM line WHERE customerId = ? AND size = ? AND crust = ? AND extraCheese = ? AND itemName = ?', data.customerId, data.size, data.crust, data.extraCheese, data.itemName, cb);
    }

    static basicSearch(data, cb)
    {
        db.get('SELECT * FROM line WHERE customerId = ? and itemName = ?', data.customerId, data.itemName, cb);
    }


    static addPizza(data, cb)
    {
        const sql = 'INSERT INTO line (customerId, itemId, itemName, quantity, price, size, crust, extraCheese) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, data.customerId, data.itemId, data.itemName,  data.quantity, data.price, data.size, data.crust, data.extraCheese, cb);
    }

    static addNonPizza(data, cb)
    {
        const sql = 'INSERT INTO line (customerId, itemId, itemName, quantity, price, size, crust, extraCheese) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, data.customerId, data.itemId, data.itemName, data.quantity, data.price, data.size, data.crust, data.extraCheese, cb);
    }

    static delete(data,  cb)
    {
        if(!data) return cb(new Error('Please provide data'));
        db.run('DELETE FROM line WHERE customerId = ? AND itemName = ? AND quantity = ? AND price = ?', data.customerId, data.itemName, data.quantity, data.price, cb);
    }

    static update(data, cb)
    {
        db.run('UPDATE line SET quantity = ?, price = ? WHERE lineId = ?', data.quantity, data.price, data.lineId, cb)
    }
}

class NonPizza{
    static all(cb){
        db.all('SELECT * FROM nonPizza', cb);
    }

    static find(id, cb)
    {
        db.get('SELECT * FROM nonPizza where nonPizzaId = ?', id, cb);
    }

    static create(data, cb)
    {
        const sql = 'INSERT INTO nonPizza VALUES (?, ?, ?)';
        db.run(sql, data.nonPizzaId, data.name, data.price, cb);
    }

    static delete(id, cb)
    {
        if(!id) return cb(new Error('Please provide Non Pizza ID'));
        db.run('DELETE FROM nonPizza WHERE nonPizzaId = ?', id, cb);
    }
}

class Orders{
    static all(cb){
        db.all('SELECT * FROM orders', cb);
    }

    static find(id, cb)
    {
        db.get('SELECT * FROM orders where orderId = ?', id, cb);
    }

    static create(data, cb)
    {
        const sql = 'INSERT INTO orders (customerId, paymentMethod, deliveryMode) VALUES (?, ?, ?)';
        db.run(sql, data.customerId, data.paymentMethod, data.deliveryMode, cb);
    }

    static delete(id, cb)
    {
        if(!id) return cb(new Error('Please provide Order ID'));
        db.run('DELETE FROM orders WHERE orderId = ?', id, cb);
    }
}

class Pizza{
    static all(cb){
        db.all('SELECT * FROM pizza', cb);
    }

    static create(data, cb)
    {
        const sql = 'INSERT INTO pizza VALUES (?, ?, ?, ?)';
        db.run(sql, data.pizzaId, data.name, data.price, data.sauce, cb);
    }

    static find(id, cb)
    {
        db.get('SELECT * FROM pizza where pizzaId = ?', id, cb);
    }

    static delete(id, cb)
    {
        if(!id) return cb(new Error('Please provide Pizza ID'));
        db.run('DELETE FROM pizza WHERE pizzaId = ?', id, cb);
    }
}

class PizzaToppings
{
    static all(cb){
        db.all('SELECT * FROM pizzaToppings', cb);
    }

    static find(id, cb)
    {
        db.all('SELECT * FROM toppings WHERE toppingId IN (SELECT toppingId FROM pizzaToppings WHERE pizzaId = ?)', id, cb);
    }


    static create(data, cb)
    {
        const sql = 'INSERT INTO pizzaToppings VALUES (?, ?)';
        db.run(sql, data.pizzaId, data.toppingId, cb);
    }

    static delete(id1, id2, cb)
    {
        if(!id) return cb(new Error('Please provide Pizza ID'));
        db.run('DELETE FROM pizzaToppings WHERE pizzaId = ? AND toppingId = ?', id1, id2,  cb);
    }
}

class Toppings
{
    static all(cb){
        db.all('SELECT * FROM toppings', cb);
    }

    static find(id, cb)
    {
        db.get('SELECT toppingId FROM toppings where name = ?', id, cb);
    }

    static create(data, cb)
    {
        const sql = 'INSERT INTO toppings VALUES (?, ?, ?)';
        db.run(sql, data.toppingId, data.name, data.type, cb);
    }

    static delete(id, cb)
    {
        if(!id) return cb(new Error('Please provide topping ID'));
        db.run('DELETE FROM toppings WHERE toppingId = ?', id, cb);
    }
}

class Payment
{
    static find(id, cb)
    {
        db.get('DELETE FROM payment WHERE customerId = ?', id, cb)
    }

    static delete(id, cb)
    {
        db.run('DELETE FROM payment WHERE customerId = ?', id, cb)
    }

    static create(data, cb)
    {
        const sql = 'INSERT INTO payment VALUES (?, ?, ?, ?)';
        db.run(sql, data.customerId, data.cardNumber, data.cardDate, data.cvv, cb);
    }

}

class clearData
{
    static remove()
    {
        db.run('DELETE FROM line;', (err) =>
        {
            if(err)
            {
                console.log(err);
            }
            db.run('DELETE FROM sqlite_sequence WHERE name =\'line\'', (err) =>
            {
                if(err)
                {
                    console.log(err);
                }
            })
        })
    }

}

module.exports = db;
module.exports.Customer = Customer;
module.exports.Line = Line;
module.exports.NonPizza = NonPizza;
module.exports.Orders = Orders;
module.exports.Pizza = Pizza;
module.exports.PizzaToppings = PizzaToppings;
module.exports.Toppings = Toppings;
module.exports.clearData = clearData;
module.exports.Payment = Payment;

// FINDING INGREDIENT: SELECT * from toppings
// WHERE toppingId IN(SELECT toppingId FROM pizzaToppings
// WHERE toppingId = 1 AND pizzaId = "P1");