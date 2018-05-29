export const F = f => done => f().then(done).catch(done.fail);
