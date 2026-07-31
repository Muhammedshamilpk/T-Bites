import { defineType, defineField } from "sanity";

export const orderSchema = defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "restaurant",
      title: "Restaurant Reference",
      type: "reference",
      to: [{ type: "restaurant" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      initialValue: () => `ORD-${Date.now().toString().slice(-6)}`,
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
      type: "string",
    }),
    defineField({
      name: "items",
      title: "Ordered Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "foodItem", title: "Food Item Reference", type: "reference", to: [{ type: "foodItem" }] }),
            defineField({ name: "foodName", title: "Food Name Snapshot", type: "string" }),
            defineField({ name: "quantity", title: "Quantity", type: "number" }),
            defineField({ name: "priceAtOrder", title: "Unit Price At Order", type: "number" }),
          ],
        },
      ],
    }),
    defineField({
      name: "totalAmount",
      title: "Total Amount (INR ₹)",
      type: "number",
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      initialValue: "pending",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
