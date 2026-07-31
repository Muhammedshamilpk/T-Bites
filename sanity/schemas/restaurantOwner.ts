import { defineType, defineField } from "sanity";

export const restaurantOwnerSchema = defineType({
  name: "restaurantOwner",
  title: "Restaurant Owner Profile & Reference",
  type: "document",
  fields: [
    defineField({
      name: "supabaseUserId",
      title: "Supabase User ID",
      type: "string",
      description: "UUID from Supabase Auth auth.users table",
    }),
    defineField({
      name: "email",
      title: "Owner Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "restaurant",
      title: "Assigned Restaurant",
      type: "reference",
      to: [{ type: "restaurant" }],
      validation: (Rule) => Rule.required(),
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
