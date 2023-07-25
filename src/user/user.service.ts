import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/typeorm/entities/Post';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import {
  CreateUserParams,
  CreateUserPostParams,
  CreateUserProfileParams,
  UpdateUserParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  findUsers() {
    return this.userRepository.find({
      relations: ['profile', 'posts'], // 回傳關聯的 entity
    });
  }

  createUser(createUserDetails: CreateUserParams) {
    const newUser = this.userRepository.create({
      ...createUserDetails,
      createAt: new Date(),
    });

    return this.userRepository.save(newUser);
  }

  updateUser(id: number, updateUserDetails: UpdateUserParams) {
    return this.userRepository.update({ id }, { ...updateUserDetails });
  }

  deleteUser(id: number) {
    return this.userRepository.delete({ id });
  }

  async createUserProfile(
    id: number,
    createUserProfileDetails: CreateUserProfileParams,
  ) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new HttpException(
        'User not found. Cannot Profile',
        HttpStatus.BAD_REQUEST,
      );

    const newProfile = this.profileRepository.create({
      ...createUserProfileDetails,
    });
    const savedProfile = await this.profileRepository.save(newProfile);
    user.profile = savedProfile;

    return this.userRepository.save(user);
  }

  async createUserPost(
    id: number,
    createUserPostDetails: CreateUserPostParams,
  ) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new HttpException(
        'User not found. Cannot Profile',
        HttpStatus.BAD_REQUEST,
      );

    const newPost = this.postRepository.create({
      ...createUserPostDetails,
      user,
    });

    return this.postRepository.save(newPost);
  }
}
