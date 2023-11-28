import { Injectable } from '@nestjs/common';
import { GameDto } from '../dto/game.dto';

@Injectable()
export class GameLobbyService {
  public PADDLE_WIDTH: number;
  public PADDLE_HEIGHT: number;
  private lobby: GameDto[] = [];
  private PLAYER_INITIAL_X = 0;
  private CANVAS_WIDTH = 858;
  private CANVAS_HEIGHT = 525;

  joinPlayer1(player: any, login: string): boolean {
    if (this.lobby.length == 0) {
      const gameDto = this.initGame(player.id);
      this.lobby.push(gameDto);
      gameDto.player1.login = login;
      console.log('player 1 joined');
      player.join(`game_${gameDto.player1.socketId}`);
      return true;
    } else {
      return false;
    }
  }

  joinPlayer2(player: any, login: string): GameDto {
    const gameDto = this.lobby[0];
    gameDto.player2 = {
      login,
      socketId: player.id,
      userId: '',
      x: gameDto.canvas.width - this.PLAYER_INITIAL_X - this.PADDLE_WIDTH,
      y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      width: this.PADDLE_WIDTH,
      height: this.PADDLE_HEIGHT,
    };
    player.join(`game_${gameDto.player1.socketId}`);
    console.log('Player 2 joined');
    this.lobby.splice(0, 1);
    return gameDto;
  }

  initGame(player1Id: string): GameDto {
    const gameDto: GameDto = {
      gameId: `game_${player1Id}`,
      finished: false,
      player1: {
        login: '',
        socketId: player1Id,
        userId: '',
        x: this.PLAYER_INITIAL_X,
        y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
        width: this.PADDLE_WIDTH,
        height: this.PADDLE_HEIGHT,
      },
      player2: undefined,
      ball: {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        radius: 5,
      },
      canvas: {
        width: this.CANVAS_WIDTH,
        height: this.CANVAS_HEIGHT,
      },
      score: {
        player1: 0,
        player2: 0,
      },
    };
    return gameDto;
  }

  abandoneLobby(playerId: string) {
    let index = this.lobby.findIndex(item => item.gameId == `game_${playerId}`);
    if (index >= 0)
      this.lobby.splice(index);
  }
}
