import { defineType, defineField } from "sanity";

export const restaurantSchema = defineType({
  name: "restaurant",
  title: "Restaurant Profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Restaurant Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ownerName",
      title: "Owner Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
    }),
    defineField({
      name: "logo",
      title: "Logo Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bannerImage",
      title: "Banner Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "storeStatus",
      title: "Store Status",
      type: "string",
      options: {
        list: [
          { title: "Open", value: "Open" },
          { title: "Closed", value: "Closed" },
          { title: "Holiday", value: "Holiday" },
        ],
        layout: "radio",
      },
      initialValue: "Open",
    }),
    defineField({
      name: "deliveryRadius",
      title: "Delivery Radius (km)",
      type: "number",
      initialValue: 8.5,
    }),
    defineField({
      name: "operatingHours",
      title: "Operating Hours",
      type: "string",
      initialValue: "Mon - Sat: 09:00 AM - 10:00 PM",
    }),
    defineField({
      name: "notificationsEnabled",
      title: "Notifications Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "acceptDelivery",
      title: "Accept Delivery",
      type: "boolean",
      initialValue: true,
    }),
  ],
});
