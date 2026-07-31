import { defineType, defineField } from "sanity";

export const customerSchema = defineType({
  name: "customer",
  title: "Customer Account",
  type: "document",
  fields: [
    defineField({
      name: "supabaseUserId",
      title: "Supabase User ID",
      type: "string",
    }),
    defineField({
      name: "fullName",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      initialValue: "customer",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
