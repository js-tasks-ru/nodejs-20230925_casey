const {v4: uuid} = require('uuid');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const verificationToken = uuid();
  const user = new User({
    email: ctx.request.body.email,
    displayName: ctx.request.body.displayName,
    verificationToken,
  });

  await user.setPassword(ctx.request.body.password);
  await user.save();

  // отправляем токен для подтверждения
  await sendMail({
    to: user.email,
    subject: 'Подтвердите почту',
    locals: {token: verificationToken},
    template: 'confirmation',
  });

  ctx.body = {status: 'ok'};
};

// при подтверждении из письма
module.exports.confirm = async (ctx, next) => {
  // ищем юзера по значению переданного токена
  const user = await User.findOne({
    verificationToken: ctx.request.body.verificationToken,
  });

  if (!user) {
    ctx.throw(400, 'Ссылка подтверждения недействительна или устарела');
  }
  // если юзер найден - удаляем токен подтверждения
  user.verificationToken = undefined;
  await user.save();

  // аутентифицировать пользователя, сгенерировав для него новый ключ сесии (также, с помощью uuid)
  const token = uuid();
  ctx.body = {token};
};
