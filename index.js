import throttle from 'lodash.throttle'

export default class TTLMap extends Map {
  constructor(iterable = [], ttl = 60000, evictInterval = 10000, remove = function (value, key) { }) {
    super()
    this.ttl = ttl
    this.evictInterval = evictInterval
    this.deleteExpired = throttle(
      () => {
        this.ledger.forEach(
          (value, key) => {
            if (Date.now() > value) {
              this.ledger.delete(key)
              remove(super.get(key), key)
              this.delete(key)
            }
          }
        )
        if (this.ledger.size)
          this.deleteExpired()
      },
      this.evictInterval,
      {
        leading: false
      }
    )
    this.ledger = new Map()
    for (const [key, value] of iterable)
      this.set(key, value)
  }
  set(key, value) {
    this.ledger.set(key, Date.now() + this.ttl)
    this.deleteExpired()
    return super.set(key, value)
  }
  get(key) {
    const value = super.get(key)
    if (value) {
      this.ledger.set(key, Date.now() + this.ttl)
      this.deleteExpired()
    }
    return value
  }
}