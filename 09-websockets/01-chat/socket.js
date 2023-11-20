const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const token = socket.handshake.query.token;

    if (!token) return next(new Error('anonymous sessions are not allowed'));
    // по токену получаем сессию и текущего юзера
    const session = await Session.findOne({token}).populate('user');

    if (!session) return next(new Error('wrong or expired session token'));
    // записываем в сокет текущего юзера
    socket.user = session.user;

    next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      const date = new Date();
      // при получении сообщения с веб-сокетов - записываем его в БД
      await Message.create({
        chat: socket.user.id,
        user: socket.user.displayName,
        text: msg,
        date: date,
      });
    });
  });

  return io;
}

module.exports = socket;
