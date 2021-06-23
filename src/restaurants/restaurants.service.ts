import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { Dish } from './entities/dish.entity';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import {
  SeeRestaurantInput,
  SeeRestaurantOutput,
} from './dtos/see-restaurant.dto';
import {
  RestaurantsInput,
  RestaurantsOutPut,
} from './dtos/all-restaurants.dto';
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
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishRespository: Repository<Dish>,
    private readonly categoryRepository: CategoryRepository,
  ) {}
  private readonly _PAGINATION_RANGE = 5;

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutPut> {
    try {
      const [
        restaurants,
        totalResults,
      ] = await this.restaurantRepository.findAndCount({
        skip: (page - 1) * this._PAGINATION_RANGE,
        take: this._PAGINATION_RANGE,
        order: {
          isPromoted: 'DESC',
        },
      });
      return {
        isSucceeded: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / this._PAGINATION_RANGE),
        totalResults,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: SeeRestaurantInput): Promise<SeeRestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(restaurantId, {
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          isSucceeded: false,
          error: 'Restaurant not found',
        };
      }
      return {
        isSucceeded: true,
        restaurant,
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [
        restaurants,
        totalResults,
      ] = await this.restaurantRepository.findAndCount({
        where: {
          name: ILike(`%${query}%`),
          skip: (page - 1) * this._PAGINATION_RANGE,
          take: this._PAGINATION_RANGE,
          order: {
            isPromoted: 'DESC',
          },
        },
      });
      return {
        isSucceeded: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / this._PAGINATION_RANGE),
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

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

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categoryRepository.findOne({ slug });
      if (!category) {
        return {
          isSucceeded: false,
          error: 'Category not found',
        };
      }

      const restaurants = await this.restaurantRepository.find({
        where: {
          category,
        },
        take: this._PAGINATION_RANGE,
        skip: (page - 1) * this._PAGINATION_RANGE,
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        isSucceeded: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / this._PAGINATION_RANGE),
      };
    } catch (error) {
      return {
        isSucceeded: false,
        error,
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(
        createDishInput.restaurantId,
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
          error: "You can't do that",
        };
      }

      await this.dishRespository.save(
        this.dishRespository.create({ ...createDishInput, restaurant }),
      );

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

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishRespository.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          isSucceeded: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          isSucceeded: false,
          error: "You can't do that",
        };
      }

      this.dishRespository.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
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

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishRespository.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          isSucceeded: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          isSucceeded: false,
          error: "You can't do that",
        };
      }
      await this.dishRespository.delete(dishId);
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
}
