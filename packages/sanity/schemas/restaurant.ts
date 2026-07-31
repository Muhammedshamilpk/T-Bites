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
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
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
