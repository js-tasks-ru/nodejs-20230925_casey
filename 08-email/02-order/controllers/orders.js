const Product = require('../models/Product');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mapOrder = require('../mappers/order');
const mapOrderConfirmation = require('../mappers/orderConfirmation');
const sendMail = require('../libs/sendMail');
const mapOrder = require('../mappers/order');
const mapOrderConfirmation = require('../mappers/orderConfirmation');

module.exports.checkout = async function checkout(ctx, next) { // создание заказа
  const user = ctx.user;

  const order = new Order({
    user: user, // наш юзер
    product: ctx.request.body.product,
    phone: ctx.request.body.phone,
    address: ctx.request.body.address,
  });
  // await order.save(); // ??

  // find product by ObjectId from order scheme
  const product = await Product.findById(order.product);

  await sendMail({
    to: user.email,
    subject: 'Подтверждение создания заказа',
    locals: mapOrderConfirmation(order, product),
    template: 'order-confirmation',
  });

  ctx.body = {order: order.id};
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  // возвращаем заказы только нашего юзера
  const orders = await Order.find({user: ctx.user}).populate('product');

  ctx.body = { orders: orders.map(mapOrder)};
};
