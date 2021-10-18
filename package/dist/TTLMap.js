"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class TTLMap extends Map {
    constructor(iterable = [], ttl = 60000, evictInterval = 10000, remove = function (value, key) { }) {
        super();
        this.insertionIndex = 0;
        this.removalIndex = 0;
        this.ttl = ttl;
        this.evictInterval = evictInterval;
        this.deleteExpired = _.throttle(() => {
            this.ledger.forEach((value, key) => {
                if (Date.now() > value) {
                    this.ledger.delete(key);
                    remove(super.get(key), key);
                    this.delete(key);
                }
            });
            if (this.ledger.size)
                this.deleteExpired();
        }, this.evictInterval, {
            leading: false,
        });
        this.ledger = new Map();
        let result = new Map(iterable.map((obj) => [obj["key"], obj["value"]]));
        for (const [key, value] of result) {
            this.set(key, value);
        }
    }
    set(key, value) {
        this.ledger.set(key, Date.now() + this.ttl);
        this.deleteExpired();
        return super.set(key, value);
    }
    get(key) {
        const value = super.get(key);
        if (value) {
            this.ledger.set(key, Date.now() + this.ttl);
            this.deleteExpired();
        }
        return value;
    }
}
exports.default = TTLMap;
