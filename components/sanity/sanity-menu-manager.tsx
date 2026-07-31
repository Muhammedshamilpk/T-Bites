"use client";

import { useState, useTransition, useMemo } from "react";
import {
  addSanityMenuItemAction,
  updateSanityMenuItemAction,
  toggleSanityMenuItemAction,
  deleteSanityMenuItemAction,
} from "@/lib/sanity/sanity-store.service";
import type { SanityMenuItem } from "@/lib/sanity/sanity-store.service";
import {
  Plus,
  Trash2,
  Loader2,
  UtensilsCrossed,
  Sparkles,
  Edit2,
  TrendingUp,
  X,
  Flame,
  Activity,
  Award,
  Camera,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  initialItems: SanityMenuItem[];
  restaurantId?: string;
}

interface DetailedDish extends SanityMenuItem {
  ingredients?: string;
  calories?: string;
  protein?: string;
  fat?: string;
}

const CATEGORIES = [
  "All Items",
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
  "Chef's Specials",
];

export function SanityMenuManager({ initialItems, restaurantId }: Props) {
  const [items, setItems] = useState<DetailedDish[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState<DetailedDish | null>(null);
  const [selectedDishModal, setSelectedDishModal] = useState<DetailedDish | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  // New & Edit form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [isVeg, setIsVeg] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All Items") return items;
    return items.filter((i) => (i.category || "Main Course") === activeCategory);
  }, [items, activeCategory]);

  const activeCount = useMemo(
    () => items.filter((i) => i.isAvailable).length,
    [items]
  );
  const coveragePercent =
    items.length > 0 ? Math.round((activeCount / items.length) * 100) : 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const openAddModal = () => {
    setName("");
    setPrice("");
    setDescription("");
    setCategory("Main Course");
    setIsVeg(true);
    setImagePreview(null);
    setImageFile(null);
    setShowAddModal(true);
  };

  const openEditModal = (dish: DetailedDish) => {
    setEditingDish(dish);
    setName(dish.name);
    setPrice(String(dish.price));
    setDescription(dish.description || "");
    setCategory(dish.category || "Main Course");
    setIsVeg(dish.isVeg);
    setImagePreview(dish.imageUrl || dish.image || null);
    setImageFile(null);
    setSelectedDishModal(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      toast.error("Please provide both name and price.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("isVeg", String(isVeg));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    startTransition(async () => {
      const res = await addSanityMenuItemAction(formData);
      if (res.success) {
        toast.success("🎉 Food item & photo saved to Sanity CMS!");
        setShowAddModal(false);
        const newItem: DetailedDish = {
          _id: res.item?._id || `sanity-item-${Date.now()}`,
          name,
          price: parseFloat(price) || 0,
          description,
          isVeg,
          isAvailable: true,
          category,
          imageUrl: (res.item as any)?.imageUrl,
          image:
            imagePreview ||
            (res.item as any)?.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
          ingredients: "Fresh organic ingredients, herbs, house spices",
          calories: "320 kcal",
          protein: "18g",
          fat: "14g",
        };
        setItems([newItem, ...items]);
        setName("");
        setPrice("");
        setDescription("");
        setImagePreview(null);
        setImageFile(null);
      } else {
        toast.error(res.message || "Failed to add item");
      }
    });
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    if (!name.trim() || !price.trim()) {
      toast.error("Please provide both name and price.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("isVeg", String(isVeg));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const updatedDish: DetailedDish = {
      ...editingDish,
      name,
      price: parseFloat(price) || 0,
      description,
      category,
      isVeg,
      image: imagePreview || editingDish.image,
    };

    setItems(items.map((i) => (i._id === editingDish._id ? updatedDish : i)));
    if (selectedDishModal?._id === editingDish._id) {
      setSelectedDishModal(updatedDish);
    }

    setEditingDish(null);
    setImageFile(null);
    setImagePreview(null);

    startTransition(async () => {
      await updateSanityMenuItemAction(editingDish._id, formData);
      toast.success(`🎉 Updated ${updatedDish.name} in Sanity CMS!`);
    });
  };

  const handleToggleAvailability = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setItems(items.map((i) => (i._id === id ? { ...i, isAvailable: nextStatus } : i)));

    if (selectedDishModal && selectedDishModal._id === id) {
      setSelectedDishModal({ ...selectedDishModal, isAvailable: nextStatus });
    }

    startTransition(async () => {
      await toggleSanityMenuItemAction(id, nextStatus);
      toast.success(nextStatus ? "Item marked ACTIVE" : "Item marked INACTIVE");
    });
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this dish from the menu?")) return;

    setItems(items.filter((i) => i._id !== id));
    if (selectedDishModal?._id === id) setSelectedDishModal(null);

    startTransition(async () => {
      await deleteSanityMenuItemAction(id);
      toast.success("Dish removed from menu!");
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#251912] tracking-tight">
            Menu Manager
          </h2>
          <p className="text-sm font-semibold text-[#584235] mt-2">
            Curate your culinary offerings and live kitchen availability.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#ff7a00] text-white px-8 py-4 rounded-[18px] font-black text-sm hover:bg-[#994700] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/20 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>+ ADD NEW DISH</span>
        </button>
      </section>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-black text-xs transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#251912] text-white shadow-md"
                  : "bg-[#ffeadf] text-[#584235] hover:bg-[#fbe3d7]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Food Items Grid or Clean Empty State */}
      {filteredItems.length === 0 ? (
        <div className="min-h-[40vh] bg-white rounded-[32px] border border-[#e0c0af]/30 p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#ffeadf] flex items-center justify-center text-[#ff7a00]">
            <UtensilsCrossed className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-black text-[#251912]">No Menu Items Found</h3>
            <p className="text-sm font-semibold text-[#584235] leading-relaxed">
              Start building your restaurant menu by adding your first culinary creation.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#ff7a00] text-white px-8 py-3.5 rounded-2xl font-black text-xs hover:bg-[#994700] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Dish</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredItems.map((dish) => (
            <div
              key={dish._id}
              onClick={() => setSelectedDishModal(dish)}
              className="group bg-white rounded-[24px] overflow-hidden ambient-glow border border-[#e0c0af]/30 hover:border-[#ff7a00] transition-all flex flex-col shadow-xs cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden bg-[#fff1ea]">
                <img
                  src={
                    dish.imageUrl ||
                    dish.image ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {dish.isVeg ? (
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-black text-[10px] text-green-700 border border-green-200 flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 bg-green-600 rounded-full" /> VEG
                    </span>
                  ) : (
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-black text-[10px] text-red-700 border border-red-200 flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 bg-red-600 rounded-full" /> NON-VEG
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(dish);
                    }}
                    className="bg-white/80 backdrop-blur-md text-[#251912] w-9 h-9 rounded-full flex items-center justify-center hover:bg-white hover:text-[#994700] transition-colors shadow-xs"
                    title="Edit dish"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteItem(e, dish._id)}
                    className="bg-white/80 backdrop-blur-md text-red-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-xs"
                    title="Delete dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex flex-col flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-lg text-[#251912] leading-tight">
                    {dish.name}
                  </h3>
                  <span className="font-black text-base text-[#994700] shrink-0 ml-2">
                    ₹{Number(dish.price).toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#584235] line-clamp-2 leading-relaxed">
                  {dish.description ||
                    "Freshly cooked gourmet dish prepared with finest local ingredients."}
                </p>

                <div
                  className="mt-auto pt-4 border-t border-[#e0c0af]/20 flex justify-between items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-black text-[10px] uppercase tracking-wider text-[#8c7263]">
                    {dish.category || "MAIN COURSE"}
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dish.isAvailable}
                      onChange={() =>
                        handleToggleAvailability(dish._id, dish.isAvailable)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#ffeadf] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff7a00]" />
                    <span className="ml-2.5 font-black text-xs text-[#251912]">
                      {dish.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail View Modal */}
      {selectedDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl flex flex-col md:flex-row border border-[#e0c0af]/30">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDishModal(null)}
              className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-md hover:bg-white text-[#251912] w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-[#fff1ea]">
              <img
                src={
                  selectedDishModal.imageUrl ||
                  selectedDishModal.image ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                }
                alt={selectedDishModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {selectedDishModal.isVeg ? (
                    <span className="px-3 py-1 rounded-full font-black text-[10px] text-green-700 bg-green-50 border border-green-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-600" /> VEG
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full font-black text-[10px] text-red-700 bg-red-50 border border-red-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600" /> NON-VEG
                    </span>
                  )}
                  <span className="font-black text-xs text-[#8c7263] uppercase tracking-wider">
                    {selectedDishModal.category || "MAIN COURSE"}
                  </span>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#251912] leading-tight">
                    {selectedDishModal.name}
                  </h2>
                  <span className="text-2xl font-black text-[#994700] ml-3">
                    ₹{Number(selectedDishModal.price).toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#584235] leading-relaxed mb-6">
                  {selectedDishModal.description}
                </p>

                <div className="space-y-6">
                  {/* Ingredients */}
                  <div>
                    <h4 className="font-black text-xs text-[#251912] uppercase mb-2 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-[#994700]" />
                      <span>Key Ingredients</span>
                    </h4>
                    <p className="text-xs font-semibold text-[#584235] leading-relaxed">
                      {selectedDishModal.ingredients ||
                        "Fresh organic ingredients, herbs, house spices"}
                    </p>
                  </div>

                  {/* Nutrition */}
                  <div className="bg-[#fff1ea] p-5 rounded-2xl border border-[#e0c0af]/20">
                    <h4 className="font-black text-xs text-[#251912] uppercase mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#994700]" />
                      <span>Nutritional Facts</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[10px] font-bold text-[#8c7263] mb-0.5">
                          Calories
                        </p>
                        <p className="font-black text-sm text-[#251912]">
                          {selectedDishModal.calories || "380 kcal"}
                        </p>
                      </div>
                      <div className="border-x border-[#e0c0af]/30">
                        <p className="text-[10px] font-bold text-[#8c7263] mb-0.5">
                          Protein
                        </p>
                        <p className="font-black text-sm text-[#251912]">
                          {selectedDishModal.protein || "24g"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#8c7263] mb-0.5">
                          Fat
                        </p>
                        <p className="font-black text-sm text-[#251912]">
                          {selectedDishModal.fat || "18g"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-[#e0c0af]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDishModal.isAvailable}
                      onChange={() =>
                        handleToggleAvailability(
                          selectedDishModal._id,
                          selectedDishModal.isAvailable
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#ffeadf] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff7a00]" />
                  </label>
                  <span className="font-black text-xs text-[#251912]">
                    {selectedDishModal.isAvailable ? "Active" : "Inactive"}
                  </span>
                </div>

                <button
                  onClick={() => openEditModal(selectedDishModal)}
                  className="flex items-center gap-2 bg-[#251912] text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-[#994700] transition-all shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>EDIT DISH</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {editingDish && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e0c0af]/20 pb-4">
              <h3 className="text-xl font-black text-[#251912] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#994700]" />
                <span>Edit Culinary Dish</span>
              </h3>
              <button
                onClick={() => setEditingDish(null)}
                className="p-1 rounded-full hover:bg-[#ffeadf] text-[#584235]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Update Item Photo
                </label>
                <div className="relative group">
                  {imagePreview ? (
                    <div className="relative h-36 w-full rounded-2xl overflow-hidden border-2 border-[#ff7a00]">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 w-full rounded-2xl border-2 border-dashed border-[#e0c0af] bg-[#fff1ea] hover:bg-[#ffeadf] hover:border-[#ff7a00] cursor-pointer transition-all">
                      <div className="flex flex-col items-center text-center space-y-1">
                        <Camera className="w-7 h-7 text-[#994700]" />
                        <span className="text-xs font-black text-[#251912]">
                          Upload New Photo
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Dish Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                  >
                    {CATEGORIES.filter((c) => c !== "All Items").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Dietary Preference
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-[#251912]">
                    <input
                      type="radio"
                      name="dietEdit"
                      checked={isVeg}
                      onChange={() => setIsVeg(true)}
                      className="text-[#ff7a00] focus:ring-[#ff7a00]"
                    />
                    <span>🟢 Pure Veg</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-[#251912]">
                    <input
                      type="radio"
                      name="dietEdit"
                      checked={!isVeg}
                      onChange={() => setIsVeg(false)}
                      className="text-[#ff7a00] focus:ring-[#ff7a00]"
                    />
                    <span>🔴 Non-Veg</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-5 py-3 rounded-xl border border-[#8c7263] text-xs font-black text-[#584235]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#ff7a00] text-white text-xs font-black shadow-lg shadow-orange-500/20 hover:bg-[#994700] transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Dish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Add New Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e0c0af]/20 pb-4">
              <h3 className="text-xl font-black text-[#251912] flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-[#994700]" />
                <span>Add New Culinary Dish</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-[#ffeadf] text-[#584235]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Dish Photo Upload */}
              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Item Photo
                </label>
                <div className="relative group">
                  {imagePreview ? (
                    <div className="relative h-36 w-full rounded-2xl overflow-hidden border-2 border-[#ff7a00]">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 w-full rounded-2xl border-2 border-dashed border-[#e0c0af] bg-[#fff1ea] hover:bg-[#ffeadf] hover:border-[#ff7a00] cursor-pointer transition-all">
                      <div className="flex flex-col items-center text-center space-y-1">
                        <Camera className="w-7 h-7 text-[#994700]" />
                        <span className="text-xs font-black text-[#251912]">
                          Upload Dish Photo
                        </span>
                        <span className="text-[10px] font-bold text-[#8c7263]">
                          PNG, JPG or WEBP (max 5MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Dish Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Truffle Pizza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                  >
                    {CATEGORIES.filter((c) => c !== "All Items").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Fresh ingredients, herbs, sauce details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fff1ea] border-none rounded-xl text-xs font-bold text-[#251912] focus:ring-2 focus:ring-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#584235] mb-1.5">
                  Dietary Preference
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-[#251912]">
                    <input
                      type="radio"
                      name="diet"
                      checked={isVeg}
                      onChange={() => setIsVeg(true)}
                      className="text-[#ff7a00] focus:ring-[#ff7a00]"
                    />
                    <span>🟢 Pure Veg</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-[#251912]">
                    <input
                      type="radio"
                      name="diet"
                      checked={!isVeg}
                      onChange={() => setIsVeg(false)}
                      className="text-[#ff7a00] focus:ring-[#ff7a00]"
                    />
                    <span>🔴 Non-Veg</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl border border-[#8c7263] text-xs font-black text-[#584235]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 rounded-xl bg-[#ff7a00] text-white text-xs font-black shadow-lg shadow-orange-500/20 hover:bg-[#994700] transition-all flex items-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Save Dish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
