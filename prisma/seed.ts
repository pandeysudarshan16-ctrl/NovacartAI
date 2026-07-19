import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Generate a hashed password for seed accounts
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  // 1. Seed Admin
  const adminEmail = "admin@novacart.ai";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "NovaCart Admin",
      passwordHash,
      role: Role.ADMIN,
      profile: {
        create: {},
      },
    },
  });
  console.log(`✅ Seeded ADMIN user: ${admin.email}`);

  // 2. Seed Customer
  const customerEmail = "customer@novacart.ai";
  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      name: "John Doe",
      phoneNumber: "+919999999999",
      passwordHash,
      role: Role.CUSTOMER,
      profile: {
        create: {},
      },
      addresses: {
        create: [
          {
            title: "Home",
            street: "123 Main Street",
            city: "Bangalore",
            state: "Karnataka",
            postalCode: "560001",
            country: "India",
            isDefault: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Seeded CUSTOMER user: ${customer.email}`);

  // 3. Seed Seller
  const sellerEmail = "seller@novacart.ai";
  const seller = await prisma.user.upsert({
    where: { email: sellerEmail },
    update: {},
    create: {
      email: sellerEmail,
      name: "Jane Smith",
      passwordHash,
      role: Role.SELLER,
      profile: {
        create: {},
      },
      sellerProfile: {
        create: {
          shopName: "Nova Electrics",
          shopDescription: "Authorized seller of high quality electronics",
        },
      },
    },
  });
  console.log(`✅ Seeded SELLER user: ${seller.email}`);

  // 4. Seed Delivery Partner
  const deliveryEmail = "delivery@novacart.ai";
  const delivery = await prisma.user.upsert({
    where: { email: deliveryEmail },
    update: {},
    create: {
      email: deliveryEmail,
      name: "Rider Swift",
      passwordHash,
      role: Role.DELIVERY_PARTNER,
      profile: {
        create: {},
      },
      deliveryProfile: {
        create: {
          vehicleType: "MOTORCYCLE",
          vehicleNumber: "KA-01-XX-9999",
          licenseNumber: "DL-1234567890",
        },
      },
    },
  });
  console.log(`✅ Seeded DELIVERY_PARTNER user: ${delivery.email}`);

  console.log("🌱 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
