import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating database product prices...");
  
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to update.`);

  for (const product of products) {
    const originalPrice = Number(product.price);
    const newPrice = originalPrice + 1000;
    
    let newComparePrice: number | null = null;
    if (product.comparePrice) {
      newComparePrice = Number(product.comparePrice) + 1000;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        price: newPrice,
        comparePrice: newComparePrice,
      },
    });

    console.log(`Updated "${product.name}" price from ${originalPrice} to ${newPrice}`);
  }

  console.log("Database update complete!");
}

main()
  .catch((err) => {
    console.error("Error updating prices:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
