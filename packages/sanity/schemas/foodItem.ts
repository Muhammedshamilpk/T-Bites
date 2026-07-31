import { defineType, defineField } from "sanity";

export const foodItemSchema = defineType({
  name: "foodItem",
  title: "Food Item",
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
      name: "name",
      title: "Dish Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "price",
      title: "Price (INR ₹)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "image",
      title: "Food Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      initialValue: "Main Course",
    }),
    defineField({
      name: "available",
      title: "Available in Kitchen",
      type: "boolean",
      initialValue: true,
    }),
  ],
});
