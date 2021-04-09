import { CategoryOutput, CategoryInput } from './dtos/category.dto';
import { allCategoriesOutput } from './dtos/all-categories.dto';
import {
  DeleteRestaurantOutput,
  DeleteRestaurantInput,
} from './dtos/delete-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { User } from './../users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantRepository.create(
        createRestaurantInput,
      );

      newRestaurant.owner = owner;
      const category = await this.categoryRepository.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurantRepository.save(newRestaurant);
      return {
        isSucceeded: true,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(
        editRestaurantInput.restaurantId,
      );

      if (!restaurant) {
        return {
          isSucceeded: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          isSucceeded: false,
          error: "you can't edit a restaurant that you don't own",
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categoryRepository.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      await this.restaurantRepository.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return {
        isSucceeded: true,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const { restaurantId } = deleteRestaurantInput;
      const restaurant = await this.restaurantRepository.findOne(restaurantId);

      if (!restaurant) {
        return {
          isSucceeded: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          isSucceeded: false,
          error: "you can't delete a restaurant that you don't own",
        };
      }

      await this.restaurantRepository.delete(restaurantId);
      return { isSucceeded: true };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async allCategories(): Promise<allCategoriesOutput> {
    try {
      const categories = await this.categoryRepository.find();
      return {
        isSucceeded: true,
        categories,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurantRepository.count({ category });
  }

  async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoryRepository.findOne(
        { slug },
        { relations: ['restaurants'] },
      );
      if (!category) {
        return {
          isSucceeded: false,
          error: 'Category not found',
        };
      }
      return {
        isSucceeded: true,
        category,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }
}
