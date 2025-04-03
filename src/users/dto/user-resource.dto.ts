import { User, UserRole } from '../entities/user.entity';

// export class UserResourceDto {
//   id: number;
//   email: string;
//   name: string;
//   role: UserRole;
//   status: string;
//   created_at: Date;
//   updated_at: Date;
// }

export class UserResourceDto {

  constructor(
    public id: number,
    public email: string,
    public name: string,
    public role: UserRole,
    public status: string,
    public created_at: Date,
    public updated_at: Date,
  ) {}

  static from(user: User): UserResourceDto {
    return new UserResourceDto(
      user.id,
      user.email,
      user.name,
      user.role,
      user.status,
      user.createdAt,
      user.updatedAt,
    );
  }


  // public toResource(user: User): UserResourceDto {
  //   return {
  //     id: user.id,
  //     email: user.email,
  //     name: user.name,
  //     role: user.role,
  //     status: user.status,
  //     created_at: user.createdAt,
  //     updated_at: user.updatedAt,
  //   };
  // }
}
//
// private toResource(user: User): UserResourceDto {
//   return {
//     id: user.id,
//     email: user.email,
//     name: user.name,
//     role: user.role,
//     status: user.status,
//     created_at: user.createdAt,
//     updated_at: user.updatedAt,
//   };
// }

