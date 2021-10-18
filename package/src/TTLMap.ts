import _ = require("lodash");

export default class TTLMap extends Map {
  private insertionIndex: number;
  private removalIndex: number;
  private ttl: number;
  private evictInterval: number;
  private deleteExpired: any;
  private ledger: Map<any, any>;

  constructor(
    iterable = [],
    ttl = 60000,
    evictInterval = 10000,
    remove = function (value: any, key: any) {}
  ) {
    super();
    this.insertionIndex = 0;
    this.removalIndex = 0;
    this.ttl = ttl;
    this.evictInterval = evictInterval;
    this.deleteExpired = _.throttle(
      () => {
        this.ledger.forEach((value, key) => {
          if (Date.now() > value) {
            this.ledger.delete(key);
            remove(super.get(key), key);
            this.delete(key);
          }
        });
        if (this.ledger.size) this.deleteExpired();
      },
      this.evictInterval,
      {
        leading: false,
      }
    );
    this.ledger = new Map();

    let result = new Map(iterable.map((obj) => [obj["key"], obj["value"]]));
    for (const [key, value] of result) {
      this.set(key, value);
    }
  }
  set(key: any, value: any) {
    this.ledger.set(key, Date.now() + this.ttl);
    this.deleteExpired();
    return super.set(key, value);
  }
  get(key: any) {
    const value = super.get(key);
    if (value) {
      this.ledger.set(key, Date.now() + this.ttl);
      this.deleteExpired();
    }
    return value;
  }
}
