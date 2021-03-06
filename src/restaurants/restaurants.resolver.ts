import { DeleteDishOutput, DeleteDishInput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { CreateDishOutput, CreateDishInput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import {
  SearchRestaurantOutput,
  SearchRestaurantInput,
} from './dtos/search-restaurant.dto';
import {
  SeeRestaurantInput,
  SeeRestaurantOutput,
} from './dtos/see-restaurant.dto';
import {
  RestaurantsOutPut,
  RestaurantsInput,
} from './dtos/all-restaurants.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { allCategoriesOutput } from './dtos/all-categories.dto';
import { Category } from './entities/category.entity';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantOutput,
  EditRestaurantInput,
} from './dtos/edit-restaurant.dto';
import { Role } from './../auth/role.decorator';
import { User } from './../users/entities/user.entity';
import { AuthUser } from './../auth/auth-user.decorator';
import { RestaurantService } from './restaurants.service';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => RestaurantsOutPut)
  allRestaurant(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutPut> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(() => SeeRestaurantOutput)
  seeRestaurant(
    @Args('input') seeRestaurantInput: SeeRestaurantInput,
  ): Promise<SeeRestaurantOutput> {
    return this.restaurantService.findRestaurantById(seeRestaurantInput);
  }

  @Query(() => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }

  @Mutation(() => CreateRestaurantOutput)
  @Role(['OWNER'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation(() => EditRestaurantOutput)
  @Role(['OWNER'])
  async editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(() => EditRestaurantOutput)
  @Role(['OWNER'])
  async deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Number)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(() => allCategoriesOutput)
  async allCategories(): Promise<allCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(() => CategoryOutput)
  findCategoryBySlug(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateDishOutput)
  @Role(['OWNER'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(() => EditDishOutput)
  @Role(['OWNER'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(() => DeleteDishOutput)
  @Role(['OWNER'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}
