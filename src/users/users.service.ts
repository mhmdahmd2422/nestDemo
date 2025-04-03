import { Injectable, Req } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserException } from './user.exception';
import { HashHelper } from '../helpers/hash/hash.helper';
import { UserResourceDto } from './dto/user-resource.dto';
import { RequestHelper } from '../helpers/request/request.helper';
import { DatabaseHelper } from '../helpers/database/database.helper';
import { PageOptionsDto } from '../helpers/pagination/page-options.dto';
import { PaginationDto } from '../helpers/pagination/pagination.dto';
import { PageMetaDto } from '../helpers/pagination/page-meta.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private databaseHelper: DatabaseHelper,
    private exception: UserException,
  ) {}

  async create(user: CreateUserDto): Promise<UserResourceDto> {
    user.password = await this.hashPassword(user.password);
    const userByEmail =  await this.usersRepository.findOne({
      where: { email: user.email.trim().toLowerCase() },
    })
    if (userByEmail) {
      this.exception.usedEmail();
    }
    const newUser = this.usersRepository.save(user);
    return UserResourceDto.from(await newUser);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    queryOptions: RequestHelper.QueryOptions<User> = {},
  ): Promise<PaginationDto<UserResourceDto>> {
    const queryBuilder =  this.databaseHelper.applyQueryOptions(
      this.usersRepository,
      queryOptions,
    )

    queryBuilder
      // .orderBy("user.createdAt", pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const userResources = entities.map(user => UserResourceDto.from(user));
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PaginationDto(userResources, pageMetaDto);
  }

  async findOne(id: number): Promise<UserResourceDto | null> {
    if (isNaN(id)) {
      id = 0;
    }
    const user = await this.usersRepository.findOneBy({ id });
    return user ? UserResourceDto.from(user) : this.exception.notFoundById()
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResourceDto> {
    const updatedUser = await this.usersRepository.save({ id, ...updateUserDto });
    return UserResourceDto.from(updatedUser);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async hashPassword(password: string): Promise<string> {
    return HashHelper.run(password)
  }

  async verifyPassword(user: User, password: string): Promise<void> {
    const isMatch = HashHelper.verify(password, user.password)

    if (isMatch) {
      return
    } else {
      throw new Error(`Password is incorrect.`)
    }
  }
}
