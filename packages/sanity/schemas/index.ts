import { restaurantSchema } from "./restaurant";
import { foodItemSchema } from "./foodItem";
import { orderSchema } from "./order";
import { restaurantSettingsSchema } from "./restaurantSettings";
import { restaurantOwnerSchema } from "./restaurantOwner";

export const schemaTypes = [
  restaurantSchema,
  foodItemSchema,
  orderSchema,
  restaurantSettingsSchema,
  restaurantOwnerSchema,
];

export {
  restaurantSchema,
  foodItemSchema,
  orderSchema,
  restaurantSettingsSchema,
  restaurantOwnerSchema,
};
