const checkWeekday = require('../src/middlewares/weekdayMiddleware');
const logRequest = require('../src/middlewares/logMiddleware');
const logs = require('../src/logs');

describe('Middlewares', () => {
  const originalDate = Date;
  let req;
  let res;
  let next;

  beforeEach(() => {
    next = jest.fn();
    req = { originalUrl: '/teste' };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    logs.length = 0;
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    console.log.mockRestore();
  });

  test('checkWeekday permite dia útil', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-16T10:00:00Z')); // quinta-feira

    checkWeekday(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('checkWeekday bloqueia fim de semana', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-19T10:00:00Z')); // sábado

    checkWeekday(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Acesso permitido apenas de segunda a sexta-feira.' });
  });

  test('logRequest adiciona entrada em logs e chama next', () => {
    jest.useFakeTimers();
    const date = new Date('2026-04-16T10:00:00Z');
    jest.setSystemTime(date);

    logRequest(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      url: '/teste',
      date
    });
    expect(console.log).toHaveBeenCalledWith(`[${date}] - Requisição feita para: /teste`);
  });
});
