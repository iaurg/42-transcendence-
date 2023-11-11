import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFriendDto } from './dto/createFriendDto';
import { DeleteFriendDto } from './dto/deleteFriendDto';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async createFriend(userId: string, createFriendDto: CreateFriendDto) {
    const friendship = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { friends: { where: { id: createFriendDto.friend_id } } },
    });

    if (friendship.friends.length > 0) {
      throw new NotAcceptableException('Friendship already exists');
    }

    const friendUser = await this.prisma.user.findUnique({
      where: { id: createFriendDto.friend_id },
    });

    if (!friendUser) {
      throw new NotFoundException('Friend not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { friends: { connect: [{ id: createFriendDto.friend_id }] } },
    });

    await this.prisma.user.update({
      where: { id: createFriendDto.friend_id },
      data: { friends: { connect: [{ id: userId }] } },
    });

    return {
      message: 'Friend added',
      friend: friendUser,
    };
  }

  async getFriends(userId: string) {
    const friends = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { friends: true },
    });

    return friends;
  }

  async deleteFriend(userId: string, deleteFriendDto: DeleteFriendDto) {
    const friendship = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { friends: { where: { id: deleteFriendDto.friend_id } } },
    });

    if (friendship.friends.length === 0) {
      throw new NotFoundException('Friendship not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { friends: { disconnect: [{ id: deleteFriendDto.friend_id }] } },
    });

    await this.prisma.user.update({
      where: { id: deleteFriendDto.friend_id },
      data: { friends: { disconnect: [{ id: userId }] } },
    });

    return {
      message: 'Friend deleted',
    };
  }
}
