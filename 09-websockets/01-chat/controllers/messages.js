const Message = require('../models/Message');
const mapMessage = require('../mappers/message');

module.exports.messageList = async function messages(ctx, next) {
  // ищем сообщения по юзер id
  const messages = await Message.find({chat: ctx.user.id}).sort({date: 1}).limit(20);
  ctx.body = {messages: messages.map(mapMessage)};
};
