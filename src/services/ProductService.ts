import { ProductRepository } from "@/repositories/ProductRepository";
import { NotFoundError } from "@/core/exceptions";
import { Product } from "@prisma/client";

export class ProductService {
  private productRepository = new ProductRepository();

  async getProducts(filters: {
    categorySlug?: string;
    query?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const pageNum = filters.page ? parseInt(filters.page, 10) : 1;
    const limitNum = filters.limit ? parseInt(filters.limit, 10) : 12;
    const minPriceNum = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
    const maxPriceNum = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;

    const { products, total } = await this.productRepository.findMany({
      categorySlug: filters.categorySlug,
      query: filters.query,
      minPrice: isNaN(minPriceNum as number) ? undefined : minPriceNum,
      maxPrice: isNaN(maxPriceNum as number) ? undefined : maxPriceNum,
      sort: filters.sort,
      page: isNaN(pageNum) ? 1 : pageNum,
      limit: isNaN(limitNum) ? 12 : limitNum,
    });

    return {
      products,
      total,
      page: isNaN(pageNum) ? 1 : pageNum,
      limit: isNaN(limitNum) ? 12 : limitNum,
    };
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundError(`Product with slug '${slug}' not found`);
    }
    return product;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }
    return product;
  }
}
