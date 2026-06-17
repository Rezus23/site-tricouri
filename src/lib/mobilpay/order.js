class Order {
  constructor({ orderId, amount, currency, details }) {
    this.orderId = orderId;
    this.amount = amount;
    this.currency = currency;
    this.details = details;
  }

  toObject() {
    return {
      orderId: this.orderId,
      amount: this.amount,
      currency: this.currency,
      details: this.details,
    };
  }
}

module.exports = Order;
