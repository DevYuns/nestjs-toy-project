import { Category } from './../entities/category.entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let cagteory = await this.findOne({
      slug: categorySlug,
    });
    if (!cagteory) {
      cagteory = await this.save(
        this.create({
          slug: categorySlug,
          name: categoryName,
        }),
      );
    }

    return cagteory;
  }
}
