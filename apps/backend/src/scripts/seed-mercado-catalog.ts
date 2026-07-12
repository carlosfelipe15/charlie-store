import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils";
import { createProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows";
import { createBrandWorkflow } from "../workflows/create-brand";
import { createReviewWorkflow } from "../workflows/create-review";

// Adds a real, professional-looking catalog to the "Rodi Mercado" categories
// (currently empty — the initial seed only creates the demo apparel
// catalog). Products, images, brands and reviews are sourced from
// dummyjson.com/products (groceries, beauty, fragrances, kitchen-accessories
// and skin-care categories). Safe to re-run: skips any handle that already
// exists instead of duplicating (same convention as add-supermarket-categories.ts).
//
// Category coverage: Panadería, Snacks y dulces and Bebé have no products —
// dummyjson.com has no bakery/snacks/baby categories to source from.

type SeedReview = {
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerEmail: string;
};

type SeedProduct = {
  title: string;
  handle: string;
  description: string;
  categoryHandle: string;
  sku: string;
  weight: number;
  priceUsd: number;
  stock: number;
  thumbnail: string;
  images: string[];
  brand?: string;
  reviews: SeedReview[];
};

const GROCERIES: SeedProduct[] = [
  {
    title: "Apple",
    handle: "apple",
    description:
      "Fresh and crisp apples, perfect for snacking or incorporating into various recipes.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-APP-016",
    weight: 9,
    priceUsd: 1.99,
    stock: 8,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/apple/1.webp"],
    reviews: [
      { rating: 5, comment: "Very satisfied!", reviewerName: "Sophia Brown", reviewerEmail: "sophia.brown@x.dummyjson.com" },
      { rating: 1, comment: "Very dissatisfied!", reviewerName: "Scarlett Bowman", reviewerEmail: "scarlett.bowman@x.dummyjson.com" },
      { rating: 3, comment: "Very unhappy with my purchase!", reviewerName: "William Gonzalez", reviewerEmail: "william.gonzalez@x.dummyjson.com" },
    ],
  },
  {
    title: "Beef Steak",
    handle: "beef-steak",
    description: "High-quality beef steak, great for grilling or cooking to your preferred level of doneness.",
    categoryHandle: "carnes",
    sku: "GRO-BRD-BEE-017",
    weight: 10,
    priceUsd: 12.99,
    stock: 86,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/beef-steak/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/beef-steak/1.webp"],
    reviews: [
      { rating: 3, comment: "Would not recommend!", reviewerName: "Eleanor Tyler", reviewerEmail: "eleanor.tyler@x.dummyjson.com" },
      { rating: 4, comment: "Fast shipping!", reviewerName: "Alexander Jones", reviewerEmail: "alexander.jones@x.dummyjson.com" },
      { rating: 5, comment: "Great value for money!", reviewerName: "Natalie Harris", reviewerEmail: "natalie.harris@x.dummyjson.com" },
    ],
  },
  {
    title: "Cat Food",
    handle: "cat-food",
    description: "Nutritious cat food formulated to meet the dietary needs of your feline friend.",
    categoryHandle: "mascotas",
    sku: "GRO-BRD-FOO-018",
    weight: 10,
    priceUsd: 8.99,
    stock: 46,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/cat-food/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/cat-food/1.webp"],
    reviews: [
      { rating: 3, comment: "Would not recommend!", reviewerName: "Noah Lewis", reviewerEmail: "noah.lewis@x.dummyjson.com" },
      { rating: 3, comment: "Very unhappy with my purchase!", reviewerName: "Ruby Andrews", reviewerEmail: "ruby.andrews@x.dummyjson.com" },
      { rating: 2, comment: "Very disappointed!", reviewerName: "Ethan Thompson", reviewerEmail: "ethan.thompson@x.dummyjson.com" },
    ],
  },
  {
    title: "Chicken Meat",
    handle: "chicken-meat",
    description: "Fresh and tender chicken meat, suitable for various culinary preparations.",
    categoryHandle: "carnes",
    sku: "GRO-BRD-CHI-019",
    weight: 1,
    priceUsd: 9.99,
    stock: 97,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/1.webp",
      "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/2.webp",
    ],
    reviews: [
      { rating: 5, comment: "Great product!", reviewerName: "Mateo Bennett", reviewerEmail: "mateo.bennett@x.dummyjson.com" },
      { rating: 4, comment: "Highly recommended!", reviewerName: "Jackson Evans", reviewerEmail: "jackson.evans@x.dummyjson.com" },
      { rating: 3, comment: "Not worth the price!", reviewerName: "Sadie Morales", reviewerEmail: "sadie.morales@x.dummyjson.com" },
    ],
  },
  {
    title: "Cooking Oil",
    handle: "cooking-oil",
    description: "Versatile cooking oil suitable for frying, sautéing, and various culinary applications.",
    categoryHandle: "despensa",
    sku: "GRO-BRD-COO-020",
    weight: 5,
    priceUsd: 4.99,
    stock: 10,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/cooking-oil/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/cooking-oil/1.webp"],
    reviews: [
      { rating: 5, comment: "Very happy with my purchase!", reviewerName: "Victoria McDonald", reviewerEmail: "victoria.mcdonald@x.dummyjson.com" },
      { rating: 2, comment: "Would not recommend!", reviewerName: "Hazel Evans", reviewerEmail: "hazel.evans@x.dummyjson.com" },
      { rating: 5, comment: "Would buy again!", reviewerName: "Zoe Bennett", reviewerEmail: "zoe.bennett@x.dummyjson.com" },
    ],
  },
  {
    title: "Cucumber",
    handle: "cucumber",
    description: "Crisp and hydrating cucumbers, ideal for salads, snacks, or as a refreshing side.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-CUC-021",
    weight: 4,
    priceUsd: 1.49,
    stock: 84,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/cucumber/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/cucumber/1.webp"],
    reviews: [
      { rating: 4, comment: "Great product!", reviewerName: "Lincoln Kelly", reviewerEmail: "lincoln.kelly@x.dummyjson.com" },
      { rating: 4, comment: "Great value for money!", reviewerName: "Savannah Gomez", reviewerEmail: "savannah.gomez@x.dummyjson.com" },
      { rating: 2, comment: "Poor quality!", reviewerName: "James Davis", reviewerEmail: "james.davis@x.dummyjson.com" },
    ],
  },
  {
    title: "Dog Food",
    handle: "dog-food",
    description: "Specially formulated dog food designed to provide essential nutrients for your canine companion.",
    categoryHandle: "mascotas",
    sku: "GRO-BRD-FOO-022",
    weight: 10,
    priceUsd: 10.99,
    stock: 71,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/dog-food/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/dog-food/1.webp"],
    reviews: [
      { rating: 5, comment: "Excellent quality!", reviewerName: "Nicholas Edwards", reviewerEmail: "nicholas.edwards@x.dummyjson.com" },
      { rating: 5, comment: "Awesome product!", reviewerName: "Zachary Lee", reviewerEmail: "zachary.lee@x.dummyjson.com" },
      { rating: 4, comment: "Great product!", reviewerName: "Nova Cooper", reviewerEmail: "nova.cooper@x.dummyjson.com" },
    ],
  },
  {
    title: "Eggs",
    handle: "eggs",
    description: "Fresh eggs, a versatile ingredient for baking, cooking, or breakfast.",
    categoryHandle: "lacteos-huevos",
    sku: "GRO-BRD-EGG-023",
    weight: 2,
    priceUsd: 2.99,
    stock: 9,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/eggs/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/eggs/1.webp"],
    reviews: [
      { rating: 3, comment: "Disappointing product!", reviewerName: "Penelope King", reviewerEmail: "penelope.king@x.dummyjson.com" },
      { rating: 3, comment: "Poor quality!", reviewerName: "Eleanor Tyler", reviewerEmail: "eleanor.tyler@x.dummyjson.com" },
      { rating: 4, comment: "Very pleased!", reviewerName: "Benjamin Foster", reviewerEmail: "benjamin.foster@x.dummyjson.com" },
    ],
  },
  {
    title: "Fish Steak",
    handle: "fish-steak",
    description: "Quality fish steak, suitable for grilling, baking, or pan-searing.",
    categoryHandle: "carnes",
    sku: "GRO-BRD-FIS-024",
    weight: 6,
    priceUsd: 14.99,
    stock: 74,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/fish-steak/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/fish-steak/1.webp"],
    reviews: [
      { rating: 2, comment: "Would not buy again!", reviewerName: "Caleb Perkins", reviewerEmail: "caleb.perkins@x.dummyjson.com" },
      { rating: 5, comment: "Excellent quality!", reviewerName: "Isabella Jackson", reviewerEmail: "isabella.jackson@x.dummyjson.com" },
      { rating: 4, comment: "Great value for money!", reviewerName: "Nathan Dixon", reviewerEmail: "nathan.dixon@x.dummyjson.com" },
    ],
  },
  {
    title: "Green Bell Pepper",
    handle: "green-bell-pepper",
    description: "Fresh and vibrant green bell pepper, perfect for adding color and flavor to your dishes.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-GRE-025",
    weight: 2,
    priceUsd: 1.29,
    stock: 33,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/green-bell-pepper/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/green-bell-pepper/1.webp"],
    reviews: [
      { rating: 4, comment: "Highly recommended!", reviewerName: "Avery Carter", reviewerEmail: "avery.carter@x.dummyjson.com" },
      { rating: 3, comment: "Would not recommend!", reviewerName: "Henry Hill", reviewerEmail: "henry.hill@x.dummyjson.com" },
      { rating: 5, comment: "Excellent quality!", reviewerName: "Addison Wright", reviewerEmail: "addison.wright@x.dummyjson.com" },
    ],
  },
  {
    title: "Green Chili Pepper",
    handle: "green-chili-pepper",
    description: "Spicy green chili pepper, ideal for adding heat to your favorite recipes.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-GRE-026",
    weight: 7,
    priceUsd: 0.99,
    stock: 3,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/green-chili-pepper/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/green-chili-pepper/1.webp"],
    reviews: [
      { rating: 4, comment: "Great product!", reviewerName: "Luna Russell", reviewerEmail: "luna.russell@x.dummyjson.com" },
      { rating: 1, comment: "Waste of money!", reviewerName: "Noah Lewis", reviewerEmail: "noah.lewis@x.dummyjson.com" },
      { rating: 3, comment: "Very disappointed!", reviewerName: "Clara Berry", reviewerEmail: "clara.berry@x.dummyjson.com" },
    ],
  },
  {
    title: "Honey Jar",
    handle: "honey-jar",
    description: "Pure and natural honey in a convenient jar, perfect for sweetening beverages or drizzling over food.",
    categoryHandle: "despensa",
    sku: "GRO-BRD-HON-027",
    weight: 2,
    priceUsd: 6.99,
    stock: 34,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/honey-jar/1.webp"],
    reviews: [
      { rating: 1, comment: "Very disappointed!", reviewerName: "Autumn Gomez", reviewerEmail: "autumn.gomez@x.dummyjson.com" },
      { rating: 4, comment: "Highly impressed!", reviewerName: "Benjamin Wilson", reviewerEmail: "benjamin.wilson@x.dummyjson.com" },
      { rating: 2, comment: "Very disappointed!", reviewerName: "Nicholas Edwards", reviewerEmail: "nicholas.edwards@x.dummyjson.com" },
    ],
  },
  {
    title: "Ice Cream",
    handle: "ice-cream",
    description: "Creamy and delicious ice cream, available in various flavors for a delightful treat.",
    categoryHandle: "congelados",
    sku: "GRO-BRD-CRE-028",
    weight: 1,
    priceUsd: 5.49,
    stock: 27,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/ice-cream/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/1.webp",
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/2.webp",
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/3.webp",
      "https://cdn.dummyjson.com/product-images/groceries/ice-cream/4.webp",
    ],
    reviews: [
      { rating: 5, comment: "Very pleased!", reviewerName: "Elijah Cruz", reviewerEmail: "elijah.cruz@x.dummyjson.com" },
      { rating: 4, comment: "Excellent quality!", reviewerName: "Jace Smith", reviewerEmail: "jace.smith@x.dummyjson.com" },
      { rating: 5, comment: "Highly impressed!", reviewerName: "Sadie Morales", reviewerEmail: "sadie.morales@x.dummyjson.com" },
    ],
  },
  {
    title: "Juice",
    handle: "juice",
    description: "Refreshing fruit juice, packed with vitamins and great for staying hydrated.",
    categoryHandle: "bebidas",
    sku: "GRO-BRD-JUI-029",
    weight: 1,
    priceUsd: 3.99,
    stock: 50,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/juice/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/juice/1.webp"],
    reviews: [
      { rating: 5, comment: "Excellent quality!", reviewerName: "Nolan Gonzalez", reviewerEmail: "nolan.gonzalez@x.dummyjson.com" },
      { rating: 4, comment: "Would buy again!", reviewerName: "Bella Grant", reviewerEmail: "bella.grant@x.dummyjson.com" },
      { rating: 5, comment: "Awesome product!", reviewerName: "Aria Flores", reviewerEmail: "aria.flores@x.dummyjson.com" },
    ],
  },
  {
    title: "Kiwi",
    handle: "kiwi",
    description: "Nutrient-rich kiwi, perfect for snacking or adding a tropical twist to your dishes.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-KIW-030",
    weight: 5,
    priceUsd: 2.49,
    stock: 99,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/kiwi/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/kiwi/1.webp"],
    reviews: [
      { rating: 4, comment: "Highly recommended!", reviewerName: "Emily Brown", reviewerEmail: "emily.brown@x.dummyjson.com" },
      { rating: 2, comment: "Would not buy again!", reviewerName: "Jackson Morales", reviewerEmail: "jackson.morales@x.dummyjson.com" },
      { rating: 4, comment: "Fast shipping!", reviewerName: "Nora Russell", reviewerEmail: "nora.russell@x.dummyjson.com" },
    ],
  },
  {
    title: "Lemon",
    handle: "lemon",
    description:
      "Zesty and tangy lemons, versatile for cooking, baking, or making refreshing beverages.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-LEM-031",
    weight: 3,
    priceUsd: 0.79,
    stock: 31,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/lemon/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/lemon/1.webp"],
    reviews: [
      { rating: 5, comment: "Awesome product!", reviewerName: "Logan Lawson", reviewerEmail: "logan.lawson@x.dummyjson.com" },
      { rating: 5, comment: "Highly impressed!", reviewerName: "Avery Perez", reviewerEmail: "avery.perez@x.dummyjson.com" },
      { rating: 5, comment: "Very satisfied!", reviewerName: "Benjamin Foster", reviewerEmail: "benjamin.foster@x.dummyjson.com" },
    ],
  },
  {
    title: "Milk",
    handle: "milk",
    description:
      "Fresh and nutritious milk, a staple for various recipes and daily consumption.",
    categoryHandle: "lacteos-huevos",
    sku: "GRO-BRD-MIL-032",
    weight: 5,
    priceUsd: 3.49,
    stock: 27,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/milk/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/milk/1.webp"],
    reviews: [
      { rating: 4, comment: "Very satisfied!", reviewerName: "Nicholas Bailey", reviewerEmail: "nicholas.bailey@x.dummyjson.com" },
      { rating: 3, comment: "Would not buy again!", reviewerName: "Harper Turner", reviewerEmail: "harper.turner@x.dummyjson.com" },
      { rating: 5, comment: "Great value for money!", reviewerName: "Autumn Gomez", reviewerEmail: "autumn.gomez@x.dummyjson.com" },
    ],
  },
  {
    title: "Mulberry",
    handle: "mulberry",
    description:
      "Sweet and juicy mulberries, perfect for snacking or adding to desserts and cereals.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-MUL-033",
    weight: 5,
    priceUsd: 4.99,
    stock: 99,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/mulberry/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/mulberry/1.webp"],
    reviews: [
      { rating: 5, comment: "Fast shipping!", reviewerName: "Avery Barnes", reviewerEmail: "avery.barnes@x.dummyjson.com" },
      { rating: 2, comment: "Not worth the price!", reviewerName: "Sadie Morales", reviewerEmail: "sadie.morales@x.dummyjson.com" },
      { rating: 1, comment: "Would not buy again!", reviewerName: "Oscar Powers", reviewerEmail: "oscar.powers@x.dummyjson.com" },
    ],
  },
  {
    title: "Nescafe Coffee",
    handle: "nescafe-coffee",
    description:
      "Quality coffee from Nescafe, available in various blends for a rich and satisfying cup.",
    categoryHandle: "despensa",
    sku: "GRO-BRD-NES-034",
    weight: 6,
    priceUsd: 7.99,
    stock: 57,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/1.webp"],
    reviews: [
      { rating: 5, comment: "Very pleased!", reviewerName: "Gabriel Adams", reviewerEmail: "gabriel.adams@x.dummyjson.com" },
      { rating: 5, comment: "Highly recommended!", reviewerName: "Ella Cook", reviewerEmail: "ella.cook@x.dummyjson.com" },
      { rating: 4, comment: "Would buy again!", reviewerName: "Logan Torres", reviewerEmail: "logan.torres@x.dummyjson.com" },
    ],
  },
  {
    title: "Potatoes",
    handle: "potatoes",
    description:
      "Versatile and starchy potatoes, great for roasting, mashing, or as a side dish.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-POT-035",
    weight: 9,
    priceUsd: 2.29,
    stock: 13,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/potatoes/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/potatoes/1.webp"],
    reviews: [
      { rating: 5, comment: "Highly impressed!", reviewerName: "Eleanor Collins", reviewerEmail: "eleanor.collins@x.dummyjson.com" },
      { rating: 4, comment: "Fast shipping!", reviewerName: "Lily Torres", reviewerEmail: "lily.torres@x.dummyjson.com" },
      { rating: 5, comment: "Highly recommended!", reviewerName: "Ariana Ross", reviewerEmail: "ariana.ross@x.dummyjson.com" },
    ],
  },
  {
    title: "Protein Powder",
    handle: "protein-powder",
    description:
      "Nutrient-packed protein powder, ideal for supplementing your diet with essential proteins.",
    categoryHandle: "farmacia",
    sku: "GRO-BRD-PRO-036",
    weight: 9,
    priceUsd: 19.99,
    stock: 80,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/protein-powder/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/protein-powder/1.webp"],
    reviews: [
      { rating: 3, comment: "Very unhappy with my purchase!", reviewerName: "Aurora Rodriguez", reviewerEmail: "aurora.rodriguez@x.dummyjson.com" },
      { rating: 4, comment: "Would buy again!", reviewerName: "Miles Stevenson", reviewerEmail: "miles.stevenson@x.dummyjson.com" },
      { rating: 4, comment: "Very happy with my purchase!", reviewerName: "Clara Berry", reviewerEmail: "clara.berry@x.dummyjson.com" },
    ],
  },
  {
    title: "Red Onions",
    handle: "red-onions",
    description:
      "Flavorful and aromatic red onions, perfect for adding depth to your savory dishes.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-ONI-037",
    weight: 9,
    priceUsd: 1.99,
    stock: 82,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/red-onions/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/red-onions/1.webp"],
    reviews: [
      { rating: 4, comment: "Fast shipping!", reviewerName: "Maya Reed", reviewerEmail: "maya.reed@x.dummyjson.com" },
      { rating: 3, comment: "Very dissatisfied!", reviewerName: "Evelyn Gonzalez", reviewerEmail: "evelyn.gonzalez@x.dummyjson.com" },
      { rating: 5, comment: "Awesome product!", reviewerName: "Jackson Evans", reviewerEmail: "jackson.evans@x.dummyjson.com" },
    ],
  },
  {
    title: "Rice",
    handle: "rice",
    description:
      "High-quality rice, a staple for various cuisines and a versatile base for many dishes.",
    categoryHandle: "despensa",
    sku: "GRO-BRD-RIC-038",
    weight: 5,
    priceUsd: 5.99,
    stock: 59,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/rice/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/rice/1.webp"],
    reviews: [
      { rating: 5, comment: "Would buy again!", reviewerName: "Sophia Brown", reviewerEmail: "sophia.brown@x.dummyjson.com" },
      { rating: 4, comment: "Very satisfied!", reviewerName: "Grace Perry", reviewerEmail: "grace.perry@x.dummyjson.com" },
      { rating: 1, comment: "Very disappointed!", reviewerName: "Cameron Burke", reviewerEmail: "cameron.burke@x.dummyjson.com" },
    ],
  },
  {
    title: "Soft Drinks",
    handle: "soft-drinks",
    description:
      "Assorted soft drinks in various flavors, perfect for refreshing beverages.",
    categoryHandle: "bebidas",
    sku: "GRO-BRD-SOF-039",
    weight: 9,
    priceUsd: 1.99,
    stock: 53,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/soft-drinks/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/soft-drinks/1.webp"],
    reviews: [
      { rating: 2, comment: "Would not recommend!", reviewerName: "Zachary Lee", reviewerEmail: "zachary.lee@x.dummyjson.com" },
      { rating: 2, comment: "Would not recommend!", reviewerName: "Oscar Powers", reviewerEmail: "oscar.powers@x.dummyjson.com" },
      { rating: 5, comment: "Highly recommended!", reviewerName: "Hannah Robinson", reviewerEmail: "hannah.robinson@x.dummyjson.com" },
    ],
  },
  {
    title: "Strawberry",
    handle: "strawberry",
    description:
      "Sweet and succulent strawberries, great for snacking, desserts, or blending into smoothies.",
    categoryHandle: "frescos",
    sku: "GRO-BRD-STR-040",
    weight: 1,
    priceUsd: 3.99,
    stock: 46,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/strawberry/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/strawberry/1.webp"],
    reviews: [
      { rating: 3, comment: "Would not buy again!", reviewerName: "Amelia Perez", reviewerEmail: "amelia.perez@x.dummyjson.com" },
      { rating: 3, comment: "Would not buy again!", reviewerName: "Olivia Wilson", reviewerEmail: "olivia.wilson@x.dummyjson.com" },
      { rating: 4, comment: "Would buy again!", reviewerName: "Hunter Gordon", reviewerEmail: "hunter.gordon@x.dummyjson.com" },
    ],
  },
  {
    title: "Tissue Paper Box",
    handle: "tissue-paper-box",
    description:
      "Convenient tissue paper box for everyday use, providing soft and absorbent tissues.",
    categoryHandle: "limpieza",
    sku: "GRO-BRD-TIS-041",
    weight: 1,
    priceUsd: 2.49,
    stock: 86,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/1.webp",
      "https://cdn.dummyjson.com/product-images/groceries/tissue-paper-box/2.webp",
    ],
    reviews: [
      { rating: 1, comment: "Not as described!", reviewerName: "Ariana Ross", reviewerEmail: "ariana.ross@x.dummyjson.com" },
      { rating: 5, comment: "Fast shipping!", reviewerName: "Carter Baker", reviewerEmail: "carter.baker@x.dummyjson.com" },
      { rating: 5, comment: "Great value for money!", reviewerName: "Penelope Harper", reviewerEmail: "penelope.harper@x.dummyjson.com" },
    ],
  },
  {
    title: "Water",
    handle: "water",
    description:
      "Pure and refreshing bottled water, essential for staying hydrated throughout the day.",
    categoryHandle: "bebidas",
    sku: "GRO-BRD-WAT-042",
    weight: 4,
    priceUsd: 0.99,
    stock: 53,
    thumbnail: "https://cdn.dummyjson.com/product-images/groceries/water/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/groceries/water/1.webp"],
    reviews: [
      { rating: 5, comment: "Highly impressed!", reviewerName: "Jonathan Pierce", reviewerEmail: "jonathan.pierce@x.dummyjson.com" },
      { rating: 2, comment: "Would not recommend!", reviewerName: "Grayson Coleman", reviewerEmail: "grayson.coleman@x.dummyjson.com" },
      { rating: 3, comment: "Not as described!", reviewerName: "Ethan Fletcher", reviewerEmail: "ethan.fletcher@x.dummyjson.com" },
    ],
  },
];

// Kitchen appliances (no brand in source data) — the only dummyjson items
// that fit Electrodomésticos; cookware/utensils from the same source category
// were skipped since there's no matching Rodi Mercado category for them.
const ELECTRODOMESTICOS: SeedProduct[] = [
  {
    title: "Boxed Blender",
    handle: "boxed-blender",
    description:
      "The Boxed Blender is a powerful and compact blender perfect for smoothies, shakes, and more. Its convenient design and multiple functions make it a versatile kitchen appliance.",
    categoryHandle: "electrodomesticos",
    sku: "KIT-BRD-BOX-051",
    weight: 1,
    priceUsd: 39.99,
    stock: 9,
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/4.webp",
    ],
    reviews: [
      { rating: 5, comment: "Very pleased!", reviewerName: "Ella Adams", reviewerEmail: "ella.adams@x.dummyjson.com" },
      { rating: 5, comment: "Would buy again!", reviewerName: "Ruby Andrews", reviewerEmail: "ruby.andrews@x.dummyjson.com" },
      { rating: 5, comment: "Very happy with my purchase!", reviewerName: "Aurora Lawson", reviewerEmail: "aurora.lawson@x.dummyjson.com" },
    ],
  },
  {
    title: "Electric Stove",
    handle: "electric-stove",
    description:
      "The Electric Stove provides a portable and efficient cooking solution. Ideal for small kitchens or as an additional cooking surface for various culinary needs.",
    categoryHandle: "electrodomesticos",
    sku: "KIT-BRD-ELE-056",
    weight: 5,
    priceUsd: 49.99,
    stock: 21,
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/4.webp",
    ],
    reviews: [
      { rating: 1, comment: "Would not recommend!", reviewerName: "Ava Harris", reviewerEmail: "ava.harris@x.dummyjson.com" },
      { rating: 2, comment: "Very dissatisfied!", reviewerName: "Liam Smith", reviewerEmail: "liam.smith@x.dummyjson.com" },
      { rating: 4, comment: "Very pleased!", reviewerName: "Christian Perez", reviewerEmail: "christian.perez@x.dummyjson.com" },
    ],
  },
  {
    title: "Hand Blender",
    handle: "hand-blender",
    description:
      "The Hand Blender is a versatile kitchen appliance for blending, pureeing, and mixing. Its compact design and powerful motor make it a convenient tool for various recipes.",
    categoryHandle: "electrodomesticos",
    sku: "KIT-BRD-HAN-061",
    weight: 5,
    priceUsd: 34.99,
    stock: 84,
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/hand-blender/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/kitchen-accessories/hand-blender/1.webp"],
    reviews: [
      { rating: 5, comment: "Excellent quality!", reviewerName: "Hazel Evans", reviewerEmail: "hazel.evans@x.dummyjson.com" },
      { rating: 4, comment: "Highly impressed!", reviewerName: "Hannah Howard", reviewerEmail: "hannah.howard@x.dummyjson.com" },
      { rating: 1, comment: "Would not buy again!", reviewerName: "Jonathan Pierce", reviewerEmail: "jonathan.pierce@x.dummyjson.com" },
    ],
  },
  {
    title: "Microwave Oven",
    handle: "microwave-oven",
    description:
      "The Microwave Oven is a versatile kitchen appliance for quick and efficient cooking, reheating, and defrosting. Its compact size makes it suitable for various kitchen setups.",
    categoryHandle: "electrodomesticos",
    sku: "KIT-BRD-MIC-066",
    weight: 9,
    priceUsd: 89.99,
    stock: 59,
    thumbnail: "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/4.webp",
    ],
    reviews: [
      { rating: 3, comment: "Very dissatisfied!", reviewerName: "Nora Russell", reviewerEmail: "nora.russell@x.dummyjson.com" },
      { rating: 4, comment: "Fast shipping!", reviewerName: "Alice Smith", reviewerEmail: "alice.smith@x.dummyjson.com" },
      { rating: 2, comment: "Very disappointed!", reviewerName: "Ethan Fletcher", reviewerEmail: "ethan.fletcher@x.dummyjson.com" },
    ],
  },
];

// Beauty + fragrances: not thematically "mercado" but the only items in the
// source data carrying real brand names — seeded under Aseo personal so the
// Brands filter/admin has realistic data to test against.
const ASEO_PERSONAL: SeedProduct[] = [
  {
    title: "Essence Mascara Lash Princess",
    handle: "essence-mascara-lash-princess",
    description:
      "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.",
    categoryHandle: "aseo-personal",
    sku: "BEA-ESS-ESS-001",
    weight: 4,
    priceUsd: 9.99,
    stock: 99,
    brand: "Essence",
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"],
    reviews: [
      { rating: 3, comment: "Would not recommend!", reviewerName: "Eleanor Collins", reviewerEmail: "eleanor.collins@x.dummyjson.com" },
      { rating: 4, comment: "Very satisfied!", reviewerName: "Lucas Gordon", reviewerEmail: "lucas.gordon@x.dummyjson.com" },
      { rating: 5, comment: "Highly impressed!", reviewerName: "Eleanor Collins", reviewerEmail: "eleanor.collins@x.dummyjson.com" },
    ],
  },
  {
    title: "Eyeshadow Palette with Mirror",
    handle: "eyeshadow-palette-with-mirror",
    description:
      "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.",
    categoryHandle: "aseo-personal",
    sku: "BEA-GLA-EYE-002",
    weight: 9,
    priceUsd: 19.99,
    stock: 34,
    brand: "Glamour Beauty",
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp"],
    reviews: [
      { rating: 5, comment: "Great product!", reviewerName: "Savannah Gomez", reviewerEmail: "savannah.gomez@x.dummyjson.com" },
      { rating: 4, comment: "Awesome product!", reviewerName: "Christian Perez", reviewerEmail: "christian.perez@x.dummyjson.com" },
      { rating: 1, comment: "Poor quality!", reviewerName: "Nicholas Bailey", reviewerEmail: "nicholas.bailey@x.dummyjson.com" },
    ],
  },
  {
    title: "Powder Canister",
    handle: "powder-canister",
    description:
      "The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.",
    categoryHandle: "aseo-personal",
    sku: "BEA-VEL-POW-003",
    weight: 8,
    priceUsd: 14.99,
    stock: 89,
    brand: "Velvet Touch",
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp"],
    reviews: [
      { rating: 4, comment: "Would buy again!", reviewerName: "Alexander Jones", reviewerEmail: "alexander.jones@x.dummyjson.com" },
      { rating: 5, comment: "Highly impressed!", reviewerName: "Elijah Cruz", reviewerEmail: "elijah.cruz@x.dummyjson.com" },
      { rating: 1, comment: "Very dissatisfied!", reviewerName: "Avery Perez", reviewerEmail: "avery.perez@x.dummyjson.com" },
    ],
  },
  {
    title: "Red Lipstick",
    handle: "red-lipstick",
    description:
      "The Red Lipstick is a classic and bold choice for adding a pop of color to your lips. With a creamy and pigmented formula, it provides a vibrant and long-lasting finish.",
    categoryHandle: "aseo-personal",
    sku: "BEA-CHI-LIP-004",
    weight: 1,
    priceUsd: 12.99,
    stock: 91,
    brand: "Chic Cosmetics",
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp"],
    reviews: [
      { rating: 4, comment: "Great product!", reviewerName: "Liam Garcia", reviewerEmail: "liam.garcia@x.dummyjson.com" },
      { rating: 5, comment: "Great product!", reviewerName: "Ruby Andrews", reviewerEmail: "ruby.andrews@x.dummyjson.com" },
      { rating: 5, comment: "Would buy again!", reviewerName: "Clara Berry", reviewerEmail: "clara.berry@x.dummyjson.com" },
    ],
  },
  {
    title: "Red Nail Polish",
    handle: "red-nail-polish",
    description:
      "The Red Nail Polish offers a rich and glossy red hue for vibrant and polished nails. With a quick-drying formula, it provides a salon-quality finish at home.",
    categoryHandle: "aseo-personal",
    sku: "BEA-NAI-NAI-005",
    weight: 8,
    priceUsd: 8.99,
    stock: 79,
    brand: "Nail Couture",
    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp",
    images: ["https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/1.webp"],
    reviews: [
      { rating: 2, comment: "Poor quality!", reviewerName: "Benjamin Wilson", reviewerEmail: "benjamin.wilson@x.dummyjson.com" },
      { rating: 5, comment: "Great product!", reviewerName: "Liam Smith", reviewerEmail: "liam.smith@x.dummyjson.com" },
      { rating: 1, comment: "Very unhappy with my purchase!", reviewerName: "Clara Berry", reviewerEmail: "clara.berry@x.dummyjson.com" },
    ],
  },
  {
    title: "Calvin Klein CK One",
    handle: "calvin-klein-ck-one",
    description:
      "CK One by Calvin Klein is a classic unisex fragrance, known for its fresh and clean scent. It's a versatile fragrance suitable for everyday wear.",
    categoryHandle: "aseo-personal",
    sku: "FRA-CAL-CAL-006",
    weight: 7,
    priceUsd: 49.99,
    stock: 29,
    brand: "Calvin Klein",
    thumbnail: "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/3.webp",
    ],
    reviews: [
      { rating: 2, comment: "Very disappointed!", reviewerName: "Layla Young", reviewerEmail: "layla.young@x.dummyjson.com" },
      { rating: 4, comment: "Fast shipping!", reviewerName: "Daniel Cook", reviewerEmail: "daniel.cook@x.dummyjson.com" },
      { rating: 3, comment: "Not as described!", reviewerName: "Jacob Cooper", reviewerEmail: "jacob.cooper@x.dummyjson.com" },
    ],
  },
  {
    title: "Chanel Coco Noir Eau De",
    handle: "chanel-coco-noir-eau-de",
    description:
      "Coco Noir by Chanel is an elegant and mysterious fragrance, featuring notes of grapefruit, rose, and sandalwood. Perfect for evening occasions.",
    categoryHandle: "aseo-personal",
    sku: "FRA-CHA-CHA-007",
    weight: 7,
    priceUsd: 129.99,
    stock: 58,
    brand: "Chanel",
    thumbnail: "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/3.webp",
    ],
    reviews: [
      { rating: 4, comment: "Highly impressed!", reviewerName: "Ruby Andrews", reviewerEmail: "ruby.andrews@x.dummyjson.com" },
      { rating: 5, comment: "Awesome product!", reviewerName: "Leah Henderson", reviewerEmail: "leah.henderson@x.dummyjson.com" },
      { rating: 5, comment: "Very happy with my purchase!", reviewerName: "Xavier Wright", reviewerEmail: "xavier.wright@x.dummyjson.com" },
    ],
  },
  {
    title: "Dior J'adore",
    handle: "dior-jadore",
    description:
      "J'adore by Dior is a luxurious and floral fragrance, known for its blend of ylang-ylang, rose, and jasmine. It embodies femininity and sophistication.",
    categoryHandle: "aseo-personal",
    sku: "FRA-DIO-DIO-008",
    weight: 4,
    priceUsd: 89.99,
    stock: 98,
    brand: "Dior",
    thumbnail: "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/3.webp",
    ],
    reviews: [
      { rating: 5, comment: "Great value for money!", reviewerName: "Nicholas Bailey", reviewerEmail: "nicholas.bailey@x.dummyjson.com" },
      { rating: 4, comment: "Great value for money!", reviewerName: "Penelope Harper", reviewerEmail: "penelope.harper@x.dummyjson.com" },
      { rating: 4, comment: "Great product!", reviewerName: "Emma Miller", reviewerEmail: "emma.miller@x.dummyjson.com" },
    ],
  },
  {
    title: "Dolce Shine Eau de",
    handle: "dolce-shine-eau-de",
    description:
      "Dolce Shine by Dolce & Gabbana is a vibrant and fruity fragrance, featuring notes of mango, jasmine, and blonde woods. It's a joyful and youthful scent.",
    categoryHandle: "aseo-personal",
    sku: "FRA-DOL-DOL-009",
    weight: 6,
    priceUsd: 69.99,
    stock: 4,
    brand: "Dolce & Gabbana",
    thumbnail: "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/3.webp",
    ],
    reviews: [
      { rating: 4, comment: "Would buy again!", reviewerName: "Mateo Bennett", reviewerEmail: "mateo.bennett@x.dummyjson.com" },
      { rating: 4, comment: "Highly recommended!", reviewerName: "Nolan Gonzalez", reviewerEmail: "nolan.gonzalez@x.dummyjson.com" },
      { rating: 5, comment: "Very happy with my purchase!", reviewerName: "Aurora Lawson", reviewerEmail: "aurora.lawson@x.dummyjson.com" },
    ],
  },
  {
    title: "Gucci Bloom Eau de",
    handle: "gucci-bloom-eau-de",
    description:
      "Gucci Bloom by Gucci is a floral and captivating fragrance, with notes of tuberose, jasmine, and Rangoon creeper. It's a modern and romantic scent.",
    categoryHandle: "aseo-personal",
    sku: "FRA-GUC-GUC-010",
    weight: 7,
    priceUsd: 79.99,
    stock: 91,
    brand: "Gucci",
    thumbnail: "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/3.webp",
    ],
    reviews: [
      { rating: 1, comment: "Very dissatisfied!", reviewerName: "Cameron Perez", reviewerEmail: "cameron.perez@x.dummyjson.com" },
      { rating: 5, comment: "Very happy with my purchase!", reviewerName: "Daniel Cook", reviewerEmail: "daniel.cook@x.dummyjson.com" },
      { rating: 4, comment: "Highly impressed!", reviewerName: "Addison Wright", reviewerEmail: "addison.wright@x.dummyjson.com" },
    ],
  },
];

// Skin-care items — real brands (Attitude, Olay, Vaseline), fits Farmacia
// (drugstore-style personal care/health) better than Aseo personal, which
// already has the beauty/fragrance items above.
const FARMACIA: SeedProduct[] = [
  {
    title: "Attitude Super Leaves Hand Soap",
    handle: "attitude-super-leaves-hand-soap",
    description:
      "Attitude Super Leaves Hand Soap is a natural and nourishing hand soap enriched with the goodness of super leaves. It cleanses and moisturizes your hands, leaving them feeling fresh and soft.",
    categoryHandle: "farmacia",
    sku: "SKI-ATT-ATT-118",
    weight: 1,
    priceUsd: 8.99,
    stock: 94,
    brand: "Attitude",
    thumbnail: "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/1.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/2.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/3.webp",
    ],
    reviews: [
      { rating: 5, comment: "Very satisfied!", reviewerName: "Liam Garcia", reviewerEmail: "liam.garcia@x.dummyjson.com" },
      { rating: 4, comment: "Great product!", reviewerName: "Victoria McDonald", reviewerEmail: "victoria.mcdonald@x.dummyjson.com" },
      { rating: 5, comment: "Very happy with my purchase!", reviewerName: "Hannah Robinson", reviewerEmail: "hannah.robinson@x.dummyjson.com" },
    ],
  },
  {
    title: "Olay Ultra Moisture Shea Butter Body Wash",
    handle: "olay-ultra-moisture-shea-butter-body-wash",
    description:
      "Olay Ultra Moisture Shea Butter Body Wash is a luxurious body wash that hydrates and nourishes your skin with the moisturizing power of shea butter. Enjoy a rich lather and silky-smooth skin.",
    categoryHandle: "farmacia",
    sku: "SKI-OLA-OLA-119",
    weight: 4,
    priceUsd: 12.99,
    stock: 34,
    brand: "Olay",
    thumbnail: "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/2.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/3.webp",
    ],
    reviews: [
      { rating: 4, comment: "Very satisfied!", reviewerName: "Abigail Rivera", reviewerEmail: "abigail.rivera@x.dummyjson.com" },
      { rating: 4, comment: "Great value for money!", reviewerName: "Hunter Gordon", reviewerEmail: "hunter.gordon@x.dummyjson.com" },
      { rating: 4, comment: "Very pleased!", reviewerName: "Zoe Bennett", reviewerEmail: "zoe.bennett@x.dummyjson.com" },
    ],
  },
  {
    title: "Vaseline Men Body and Face Lotion",
    handle: "vaseline-men-body-and-face-lotion",
    description:
      "Vaseline Men Body and Face Lotion is a specially formulated lotion designed to provide long-lasting moisture to men's skin. It absorbs quickly and helps keep the skin hydrated and healthy.",
    categoryHandle: "farmacia",
    sku: "SKI-VAS-VAS-120",
    weight: 4,
    priceUsd: 9.99,
    stock: 95,
    brand: "Vaseline",
    thumbnail: "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/thumbnail.webp",
    images: [
      "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/2.webp",
      "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/3.webp",
    ],
    reviews: [
      { rating: 4, comment: "Excellent quality!", reviewerName: "Aria Ferguson", reviewerEmail: "aria.ferguson@x.dummyjson.com" },
      { rating: 5, comment: "Very pleased!", reviewerName: "Nova Cooper", reviewerEmail: "nova.cooper@x.dummyjson.com" },
      { rating: 4, comment: "Great product!", reviewerName: "Madison Collins", reviewerEmail: "madison.collins@x.dummyjson.com" },
    ],
  },
];

// Products with no brand in the source data — created in a single batch call.
const UNBRANDED_PRODUCTS = [...GROCERIES, ...ELECTRODOMESTICOS];
// Products with a distinct brand each — createProductsWorkflow only accepts
// one shared additional_data.brand_id per call, so these are created one at
// a time (see loop below).
const BRANDED_PRODUCTS = [...ASEO_PERSONAL, ...FARMACIA];
const ALL_PRODUCTS = [...UNBRANDED_PRODUCTS, ...BRANDED_PRODUCTS];

function toPrices(priceUsd: number) {
  const usd = Math.round(priceUsd * 100) / 100;
  const eur = Math.round(priceUsd * 0.92 * 100) / 100;
  return [
    { amount: eur, currency_code: "eur" },
    { amount: usd, currency_code: "usd" },
  ];
}

export default async function seedMercadoCatalog({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { handle: ALL_PRODUCTS.map((p) => p.handle) },
  });
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle));

  const toCreateUnbranded = UNBRANDED_PRODUCTS.filter((p) => !existingHandles.has(p.handle));
  const toCreateBranded = BRANDED_PRODUCTS.filter((p) => !existingHandles.has(p.handle));

  if (!toCreateUnbranded.length && !toCreateBranded.length) {
    logger.info("El catálogo de mercado ya está sembrado. Nada que crear.");
    return;
  }

  const categoryHandles = [
    "frescos",
    "despensa",
    "lacteos-huevos",
    "carnes",
    "bebidas",
    "congelados",
    "mascotas",
    "aseo-personal",
    "limpieza",
    "electrodomesticos",
    "farmacia",
  ];
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: categoryHandles },
  });
  const categoryIdByHandle = new Map(categories.map((c: any) => [c.handle, c.id]));
  const missingCategories = categoryHandles.filter((h) => !categoryIdByHandle.has(h));
  if (missingCategories.length) {
    throw new Error(
      `Faltan categorías requeridas (${missingCategories.join(
        ", "
      )}). Correr primero: pnpm medusa exec ./src/scripts/add-supermarket-categories.ts`
    );
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfiles[0];
  if (!shippingProfile) {
    throw new Error("No hay shipping_profile en la BD. Correr primero el seed inicial.");
  }

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultSalesChannel =
    salesChannels.find((sc: any) => sc.name === "Default Sales Channel") ?? salesChannels[0];
  if (!defaultSalesChannel) {
    throw new Error("No hay sales channel en la BD. Correr primero el seed inicial.");
  }

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  const stockLocation = stockLocations[0];
  if (!stockLocation) {
    throw new Error("No hay stock location en la BD. Correr primero el seed inicial.");
  }

  // 1) Brands — reuse existing brand by name, create missing ones.
  const brandNames = Array.from(
    new Set(toCreateBranded.map((p) => p.brand).filter((b): b is string => !!b))
  );
  const { data: existingBrands } = await query.graph({
    entity: "brand",
    fields: ["id", "name"],
  });
  const brandIdByName = new Map(existingBrands.map((b: any) => [b.name, b.id]));

  for (const name of brandNames) {
    if (brandIdByName.has(name)) continue;
    const { result: brand } = await createBrandWorkflow(container).run({
      input: { name },
    });
    brandIdByName.set(name, (brand as any).id);
  }
  logger.info(`Marcas listas: ${brandNames.join(", ") || "(ninguna nueva)"}`);

  // 2) Products — unbranded products go in a single batch call; branded
  // products are created one at a time (see UNBRANDED_PRODUCTS/BRANDED_PRODUCTS above).
  const buildProductInput = (p: SeedProduct) => ({
    title: p.title,
    handle: p.handle,
    description: p.description,
    category_ids: [categoryIdByHandle.get(p.categoryHandle) as string],
    weight: p.weight,
    status: ProductStatus.PUBLISHED,
    shipping_profile_id: shippingProfile.id,
    thumbnail: p.thumbnail,
    images: p.images.map((url) => ({ url })),
    options: [{ title: "Presentación", values: ["Único"] }],
    variants: [
      {
        title: "Único",
        sku: p.sku,
        options: { Presentación: "Único" },
        prices: toPrices(p.priceUsd),
      },
    ],
    sales_channels: [{ id: defaultSalesChannel.id }],
  });

  if (toCreateUnbranded.length) {
    await createProductsWorkflow(container).run({
      input: { products: toCreateUnbranded.map(buildProductInput) },
    });
    logger.info(`Creados ${toCreateUnbranded.length} productos sin marca.`);
  }

  for (const p of toCreateBranded) {
    const brand_id = p.brand ? brandIdByName.get(p.brand) : undefined;
    await createProductsWorkflow(container).run({
      input: {
        products: [buildProductInput(p)],
        additional_data: brand_id ? { brand_id } : undefined,
      },
    });
  }
  if (toCreateBranded.length) {
    logger.info(`Creados ${toCreateBranded.length} productos con marca.`);
  }

  // 3) Inventory levels + reviews for the products just created.
  const createdHandles = [...toCreateUnbranded, ...toCreateBranded].map((p) => p.handle);
  const { data: createdProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.sku", "variants.inventory_items.inventory_item_id"],
    filters: { handle: createdHandles },
  });

  const bySkuInventoryItem = new Map<string, string>();
  const idByHandle = new Map<string, string>();
  for (const product of createdProducts as any[]) {
    idByHandle.set(product.handle, product.id);
    for (const variant of product.variants ?? []) {
      const inventoryItemId = variant.inventory_items?.[0]?.inventory_item_id;
      if (inventoryItemId) {
        bySkuInventoryItem.set(variant.sku, inventoryItemId);
      }
    }
  }

  const inventoryLevels = [...toCreateUnbranded, ...toCreateBranded]
    .map((p) => {
      const inventoryItemId = bySkuInventoryItem.get(p.sku);
      if (!inventoryItemId) return null;
      return {
        location_id: stockLocation.id,
        stocked_quantity: p.stock,
        inventory_item_id: inventoryItemId,
      };
    })
    .filter((level): level is NonNullable<typeof level> => !!level);

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
    logger.info(`Cargados niveles de inventario para ${inventoryLevels.length} variantes.`);
  }

  let reviewCount = 0;
  for (const p of [...toCreateUnbranded, ...toCreateBranded]) {
    const productId = idByHandle.get(p.handle);
    if (!productId) continue;
    for (const review of p.reviews) {
      await createReviewWorkflow(container).run({
        input: {
          product_id: productId,
          customer_id: review.reviewerEmail,
          rating: review.rating,
          title: null,
          body: review.comment,
        },
      });
      reviewCount++;
    }
  }
  logger.info(`Creadas ${reviewCount} reseñas.`);

  logger.info("Catálogo de mercado sembrado correctamente.");
  if (toCreateUnbranded.length || toCreateBranded.length) {
    logger.info(
      "Recordá correr `pnpm medusa exec ./src/scripts/reindex-search.ts` — el Index Engine no se entera de productos/marcas creados por un script medusa exec hasta que se fuerza un reindex (ver comentario en ese archivo)."
    );
  }
}
