import { defineType, defineField } from "sanity";

export const restaurantSettingsSchema = defineType({
  name: "restaurantSettings",
  title: "Restaurant Settings",
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
      name: "businessHours",
      title: "Business Hours",
      type: "object",
      fields: [
        defineField({ name: "openTime", title: "Opening Time", type: "string" }),
        defineField({ name: "closeTime", title: "Closing Time", type: "string" }),
      ],
    }),
    defineField({
      name: "deliveryRadius",
      title: "Delivery Radius (in km)",
      type: "number",
      initialValue: 5,
    }),
    defineField({
      name: "isAcceptingOrders",
      title: "Accepting Orders",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "minOrderAmount",
      title: "Minimum Order Amount (INR ₹)",
      type: "number",
      initialValue: 150,
    }),
  ],
});
