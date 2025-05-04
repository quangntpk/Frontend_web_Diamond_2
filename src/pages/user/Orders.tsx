
import { OrderHistory } from "@/components/user/OrderHistory";

const Orders = () => {
  return (
    <div className="py-6 sm:py-8 md:py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Order History</h1>
      <OrderHistory />
    </div>
  );
};

export default Orders;
