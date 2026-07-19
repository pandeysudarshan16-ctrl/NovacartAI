import { prisma } from "@/core/database/prisma";
import { Prisma, Product } from "@prisma/client";

export class ProductRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            shopName: true,
          },
        },
        category: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            shopName: true,
            shopDescription: true,
            shopLogo: true,
          },
        },
        category: true,
        reviews: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  async findMany(filters: {
    categorySlug?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const { categorySlug, query, minPrice, maxPrice, sort, page = 1, limit = 12 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      status: "APPROVED",
    };

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

    if (sort) {
      if (sort === "price-low") orderBy = { price: "asc" };
      else if (sort === "price-high") orderBy = { price: "desc" };
      else if (sort === "name-asc") orderBy = { name: "asc" };
      else if (sort === "name-desc") orderBy = { name: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              shopName: true,
            },
          },
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
    });
  }
}
