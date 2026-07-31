import { defineType, defineField } from "sanity";

export const restaurantOwnerSchema = defineType({
  name: "restaurantOwner",
  title: "Restaurant Owner Auth Account",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Owner Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "passwordHash",
      title: "Bcrypt Password Hash",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "restaurant",
      title: "Linked Restaurant",
      type: "reference",
      to: [{ type: "restaurant" }],
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      initialValue: "restaurant_owner",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
