/**
 * Does something
 *
 * @param {object} obj
 * Hello
 *
 * @param {string} obj.foo
 * Me foo
 *
 * @param {number} obj.bar
 * Me bar
 *
 * @return {undefined}
 */
const log = (obj) => {
  process.stdout.write(`${obj}\n`)
}

module.exports = log
