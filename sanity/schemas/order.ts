import { defineType, defineField } from "sanity";

export const orderSchema = defineType({
  name: "order",
  title: "Kitchen Order",
  type: "document",
  fields: [
    defineField({
      name: "orderId",
      title: "Order ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
    }),
    defineField({
      name: "customerPhone",
      title: "Customer Phone",
      type: "string",
    }),
    defineField({
      name: "deliveryAddress",
      title: "Delivery Address",
      type: "text",
    }),
    defineField({
      name: "orderedItems",
      title: "Ordered Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "foodName", title: "Food Name", type: "string" },
            { name: "quantity", title: "Quantity", type: "number" },
            { name: "unitPrice", title: "Unit Price", type: "number" },
            {
              name: "menuItemRef",
              title: "Menu Item Reference",
              type: "reference",
              to: [{ type: "menuItem" }],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "totalAmount",
      title: "Total Amount (₹)",
      type: "number",
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      initialValue: "Online / UPI",
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: ["Pending", "Paid", "Failed"],
      },
      initialValue: "Paid",
    }),
    defineField({
      name: "orderStatus",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "Pending" },
          { title: "Accepted", value: "Accepted" },
          { title: "Preparing", value: "Preparing" },
          { title: "Ready", value: "Ready" },
          { title: "Out for Delivery", value: "Out for Delivery" },
          { title: "Delivered", value: "Delivered" },
          { title: "Cancelled", value: "Cancelled" },
        ],
      },
      initialValue: "Preparing",
    }),
    defineField({
      name: "orderTime",
      title: "Order Time",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "restaurant",
      title: "Restaurant Reference",
      type: "reference",
      to: [{ type: "restaurant" }],
    }),
  ],
});
