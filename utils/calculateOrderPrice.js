const calculateOrderPrice = (orders) => {
    const orderUpdated = orders.map((order) => {
        let totalPriceOrders = 0;
        order.products.forEach((product, index) => {
        const totalProduct = calculateTotalPriceOrder(product);
        order.products[index].totalPrice = totalProduct;
        totalPriceOrders += totalProduct;
        });

        order.totalPrice = totalPriceOrders;
        return order;
    });
    return orderUpdated;
};

module.exports = { calculateOrderPrice }