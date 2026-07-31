import { defineType, defineField } from "sanity";

export const menuItemSchema = defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Item Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "price",
      title: "Price (₹)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "image",
      title: "Food Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "isVeg",
      title: "Veg / Non-Veg",
      type: "boolean",
      description: "True for Pure Veg, False for Non-Veg",
      initialValue: true,
    }),
    defineField({
      name: "isAvailable",
      title: "Live Availability",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "preparationTime",
      title: "Preparation Time (mins)",
      type: "string",
      initialValue: "15-20 mins",
    }),
    defineField({
      name: "isPopular",
      title: "Popular / Best Seller Item",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "restaurant",
      title: "Restaurant Reference",
      type: "reference",
      to: [{ type: "restaurant" }],
    }),
  ],
});
