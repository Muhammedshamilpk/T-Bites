import { defineType, defineField } from "sanity";

export const restaurantSchema = defineType({
  name: "restaurant",
  title: "Restaurant",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Restaurant Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "datasetName",
      title: "Sanity Dataset Name",
      type: "string",
      description: "Dedicated Sanity Dataset for this restaurant (e.g. restaurant_a, restaurant_b)",
      initialValue: "production",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "ownerName",
      title: "Owner Full Name",
      type: "string",
    }),
    defineField({
      name: "logo",
      title: "Logo Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "address",
      title: "Address Line",
      type: "string",
    }),
    defineField({
      name: "contactNumber",
      title: "Contact Phone Number",
      type: "string",
    }),
    defineField({
      name: "ownerEmail",
      title: "Owner Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Suspended", value: "suspended" },
          { title: "Deactivated", value: "deactivated" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
