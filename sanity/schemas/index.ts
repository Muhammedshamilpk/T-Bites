import { restaurantSchema } from "./restaurant";
import { menuItemSchema } from "./menuItem";
import { orderSchema } from "./order";
import { categorySchema } from "./category";
import { dashboardSettingsSchema } from "./dashboardSettings";

export const schemaTypes = [
  restaurantSchema,
  menuItemSchema,
  orderSchema,
  categorySchema,
  dashboardSettingsSchema,
];
