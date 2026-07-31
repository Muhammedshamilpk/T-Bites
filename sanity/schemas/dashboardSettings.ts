import { defineType, defineField } from "sanity";

export const dashboardSettingsSchema = defineType({
  name: "dashboardSettings",
  title: "Dashboard Settings",
  type: "document",
  fields: [
    defineField({
      name: "restaurant",
      title: "Restaurant Reference",
      type: "reference",
      to: [{ type: "restaurant" }],
    }),
    defineField({
      name: "notificationSound",
      title: "Notification Sound",
      type: "string",
      initialValue: "Chime",
    }),
    defineField({
      name: "notificationEnabled",
      title: "Notification Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "onlineStatus",
      title: "Online Status",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "string",
      options: {
        list: ["Light", "Dark", "System"],
      },
      initialValue: "Light",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "INR (₹)",
    }),
    defineField({
      name: "taxPercentage",
      title: "Tax Percentage (%)",
      type: "number",
      initialValue: 8.5,
    }),
  ],
});
