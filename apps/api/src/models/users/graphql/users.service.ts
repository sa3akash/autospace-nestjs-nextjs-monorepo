import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FindManyUserArgs, FindUniqueUserArgs } from './dtos/find.args';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  LoginInput,
  LoginOutput,
  RegisterWithCredentialsInput,
  RegisterWithProviderInput,
} from './dtos/create-user.input';
import { UpdateUserInput } from './dtos/update-user.input';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async registerWithProvider({
    image,
    name,
    id,
    type,
    providerAccountId,
  }: RegisterWithProviderInput) {
    const existingUser = await this.prisma.credentials.findUnique({
      where: { id: id },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email.');
    }

    return this.prisma.user.create({
      data: {
        id,
        name,
        image,
        AuthProvider: {
          create: {
            type,
            providerAccountId: providerAccountId,
          },
        },
      },
    });
  }

  async registerWithCredentials({
    email,
    name,
    password,
    image,
  }: RegisterWithCredentialsInput) {
    const existingUser = await this.prisma.credentials.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email.');
    }

    // Hash the password
    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(password, salt);

    const id = uuid();

    return this.prisma.user.create({
      data: {
        id,
        name,
        image,
        Credentials: {
          create: {
            email,
            passwordHash,
          },
        },
        AuthProvider: {
          create: {
            type: 'CREDENTIALS',
          },
        },
      },
      include: {
        Credentials: true,
      },
    });
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.prisma.user.findFirst({
      where: {
        Credentials: { email },
      },
      include: {
        Credentials: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = bcrypt.compareSync(
      password,
      user.Credentials.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const jwtToken = this.jwtService.sign(
      { id: user.id },
      {
        algorithm: 'HS256',
      },
    );

    return { token: jwtToken, user };
  }

  findAll(args: FindManyUserArgs) {
    return this.prisma.user.findMany(args);
  }

  findOne(args: FindUniqueUserArgs) {
    return this.prisma.user.findUnique(args);
  }

  update(updateUserInput: UpdateUserInput) {
    const { id, ...data } = updateUserInput;
    return this.prisma.user.update({
      where: { id },
      data: data,
    });
  }

  remove(args: FindUniqueUserArgs) {
    return this.prisma.user.delete(args);
  }
}
